const { Command } = require("commander");
const { copyFileSync, writeFileSync } = require("fs");
const path = require("path");
const { exec, ExecException } = require("child_process");

const SUPPORTED_LANGS = ["en", "zh-TW", "zh-CN", "fr", "es", "ja", "de"] as const;
type SupportedLang = (typeof SUPPORTED_LANGS)[number];

function normalizeOutputLang(value: string | undefined): SupportedLang {
  const fallback: SupportedLang = "en";
  if (!value) return fallback;
  const lower = value.toLowerCase();
  if (lower === "zh-tw" || lower === "zh_tw" || lower === "zh-hant") return "zh-TW";
  if (lower === "zh-cn" || lower === "zh_cn" || lower === "zh-hans" || lower === "zh") return "zh-CN";
  if (lower.startsWith("fr")) return "fr";
  if (lower.startsWith("es")) return "es";
  if (lower.startsWith("ja")) return "ja";
  if (lower.startsWith("de")) return "de";
  if (lower.startsWith("en")) return "en";
  if ((SUPPORTED_LANGS as readonly string[]).includes(value)) {
    return value as SupportedLang;
  }
  console.warn(`Unknown outputLang "${value}", falling back to "${fallback}".`);
  return fallback;
}

async function main(): Promise<void> {
  // Parse command line arguments.
  const program = new Command();
  program.option("-t, --topics <file>", "The topics file location.");
  program.option("-s, --summary <file>", "The summary file location.");
  program.option("-c, --comments <file>", "The comments file location.");
  program.option("-r, --reportTitle <title>", "The title of the report.");
  program.option("--reportSubtitle <subtitle>", "Optional report subtitle.");
  program.option("--reportQuestion <question>", "Optional report question or prompt.");
  program.option("--sourceUrl <url>", "Optional source URL for the report data.");
  program.option("--modelName <name>", "Optional model label to display in the report.");
  program.option("--generatedAt <timestamp>", "Optional generated-at timestamp for the report.");
  program.option(
    "--outputLang <language>",
    `Optional output language for UI labels. One of: ${SUPPORTED_LANGS.join(", ")}.`,
    "en",
  );
  program.parse(process.argv);
  const options = program.opts();

  if(!options["topics"]) {
    throw Error("Topics file path not specified");
  }
  if(!options["summary"]) {
    throw Error("Summary file path not specified");
  }
  if(!options["comments"]) {
    throw Error("Comments file path not specified");
  }
  if(!options["reportTitle"]) {
    throw Error("Report title not specified");
  }

  const reportMetadata = {
    title: options["reportTitle"],
    subtitle: options["reportSubtitle"],
    question: options["reportQuestion"],
    sourceUrl: options["sourceUrl"],
    modelName: options["modelName"],
    generatedAt: options["generatedAt"],
    outputLang: normalizeOutputLang(options["outputLang"]),
  };

  // path to "data" folder
  const baseOutputPath = path.join(__dirname, "./data");

  copyFileSync(options["topics"], path.join(baseOutputPath, "/topic-stats.json"));
  copyFileSync(options["summary"], path.join(baseOutputPath, "/summary.json"));
  copyFileSync(options["comments"], path.join(baseOutputPath, "/comments.json"));
  writeFileSync(path.join(baseOutputPath, "/metadata.json"), JSON.stringify(reportMetadata, null, 2));

  await exec("npm run build", (error: typeof ExecException | null, stdout: string, stderr: string) => {
    if(error) {
      console.error(`Build failed: ${error.message}`);
      return;
    }
    if(stderr) {
      console.error(`Build errors/warnings: ${stderr}`);
    }
    console.log(`Build output: ${stdout}`);
    console.log("Build complete");
  });
}

main();
