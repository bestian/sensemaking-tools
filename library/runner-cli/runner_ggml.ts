// Copyright 2024 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Summarizes comments using a local GGUF model via llama-server (llama.cpp).
//
// USAGE:
//   # Option A — start llama-server manually first:
//   llama-server --model /path/to/model.gguf --port 8080 --ctx-size 8192
//   npx ts-node ./library/runner-cli/runner_ggml.ts \
//     --inputFile comments_realdata_fixed.csv \
//     --outputBasename out
//
//   # Option B — let the runner auto-start llama-server:
//   npx ts-node ./library/runner-cli/runner_ggml.ts \
//     --inputFile comments_realdata_fixed.csv \
//     --outputBasename out \
//     --modelPath /Users/au/w/tmp/gguf/Gemma-3-TAIDE-12b-Chat-2602-Q8_0.gguf \
//     --autoStart
//
// The server URL defaults to http://127.0.0.1:8080; override with --serverUrl.
// Output language: --output_lang en|zh-TW|zh-CN|fr|es|ja|de  (default: en)

import { Command } from "commander";
import { writeFileSync } from "fs";
import { spawn, ChildProcess } from "child_process";
import {
  getCommentsFromCsv,
  getSummary,
  writeSummaryToGroundedCSV,
  writeSummaryToHtml,
} from "./runner_ggml_utils";

const LLAMA_SERVER_BIN = process.env.LLAMA_SERVER_BIN ?? "/opt/homebrew/bin/llama-server";

/** Wait until llama-server responds on the health endpoint, or timeout. */
async function waitForServer(serverUrl: string, timeoutMs = 120000): Promise<void> {
  const healthUrl = `${serverUrl}/health`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(healthUrl);
      if (res.ok) {
        console.log("✅ llama-server is ready");
        return;
      }
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`llama-server did not become ready within ${timeoutMs / 1000}s`);
}

/**
 * Start llama-server with the given GGUF model.
 * Returns the child process so the caller can kill it when done.
 */
function startLlamaServer(
  modelPath: string,
  serverUrl: string,
  ctxSize: number
): ChildProcess {
  const url = new URL(serverUrl);
  const port = url.port || "8080";
  const host = url.hostname || "127.0.0.1";

  console.log(`🚀 Starting llama-server: ${LLAMA_SERVER_BIN}`);
  console.log(`   Model: ${modelPath}`);
  console.log(`   Host: ${host}:${port}  ctx-size: ${ctxSize}`);

  const proc = spawn(
    LLAMA_SERVER_BIN,
    [
      "--model", modelPath,
      "--port", port,
      "--host", host,
      "--ctx-size", String(ctxSize),
      "--no-mmap",          // safer on macOS with large Q8 files
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );

  proc.stdout?.on("data", (d: Buffer) => process.stdout.write(`[llama-server] ${d}`));
  proc.stderr?.on("data", (d: Buffer) => process.stderr.write(`[llama-server] ${d}`));
  proc.on("exit", (code) => {
    if (code !== null && code !== 0) {
      console.error(`llama-server exited with code ${code}`);
    }
  });

  return proc;
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .option("-o, --outputBasename <file>", "Output file basename prefix")
    .option("-i, --inputFile <file>", "Input CSV file")
    .option("-a, --additionalContext <context>", "Short description of the conversation")
    .option(
      "--serverUrl <url>",
      "URL of the llama-server instance",
      "http://127.0.0.1:8080"
    )
    .option(
      "--modelPath <path>",
      "Path to the GGUF model file (required with --autoStart)"
    )
    .option(
      "--autoStart",
      "Automatically start llama-server before running (requires --modelPath)",
      false
    )
    .option(
      "--ctxSize <n>",
      "Context window size passed to llama-server when auto-starting",
      "32768"
    )
    .option(
      "--output_lang <language>",
      "Output language: en | zh-TW | zh-CN | fr | es | ja | de",
      "en"
    );

  program.parse(process.argv);
  const options = program.opts();

  if (!options.inputFile) {
    console.error("Error: --inputFile is required");
    process.exit(1);
  }
  if (!options.outputBasename) {
    console.error("Error: --outputBasename is required");
    process.exit(1);
  }

  let serverProc: ChildProcess | null = null;

  if (options.autoStart) {
    if (!options.modelPath) {
      console.error("Error: --modelPath is required when using --autoStart");
      process.exit(1);
    }
    serverProc = startLlamaServer(
      options.modelPath,
      options.serverUrl,
      Number(options.ctxSize)
    );
    // Give it a moment to bind the port before polling
    await new Promise((r) => setTimeout(r, 2000));
    await waitForServer(options.serverUrl);
  }

  try {
    console.log(`📂 Loading comments from: ${options.inputFile}`);
    const comments = await getCommentsFromCsv(options.inputFile);
    console.log(`   Loaded ${comments.length} comments`);

    console.log(`🤖 Calling llama-server at ${options.serverUrl}...`);
    const summary = await getSummary(
      comments,
      undefined,
      options.additionalContext,
      options.output_lang,
      options.serverUrl
    );

    const base = options.outputBasename;
    writeFileSync(base + "-summary.md", summary.getText("MARKDOWN"));
    writeSummaryToHtml(summary, base + "-summary.html");
    writeSummaryToGroundedCSV(summary, base + "-summaryAndSource.csv");
    writeFileSync(base + "-summary.json", JSON.stringify(summary, null, 2));

    console.log(`\n✅ Done. Outputs written to ${base}-summary.{md,html,json} and ${base}-summaryAndSource.csv`);
  } finally {
    if (serverProc) {
      console.log("🛑 Stopping llama-server...");
      serverProc.kill("SIGTERM");
    }
  }
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
