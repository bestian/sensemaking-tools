// Copyright 2026 Google LLC
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

// Run only the overview summarization subtask against a live OpenRouter model,
// using a synthetic fixture so you don't need a Polis CSV on hand.
//
// Sample Usage:
//   npx ts-node ./library/runner-cli/overview_subtask_open_router.ts \
//     --model "openai/gpt-oss-120b" \
//     --apiKey "sk-or-..." \
//     --method one-shot \
//     --outputLang zh-TW

import { Command } from "commander";
import { writeFileSync } from "fs";
import { OpenRouterModel } from "../src/models/openrouter_model";
import { MajoritySummaryStats } from "../src/stats/majority_vote";
import { OverviewSummary } from "../src/tasks/summarization_subtasks/overview";
import { Comment, Summary, SummaryContent, VoteTally } from "../src/types";
import { type SupportedLanguage } from "../templates/l10n/languages";
import { getEnvVar, getRequiredEnvVar, loadEnvironmentVariables } from "../src/utils/env_loader";

type OverviewMethod = "one-shot" | "per-topic";

interface SyntheticOverviewFixture {
  comments: Comment[];
  topicsSummary: SummaryContent;
}

function parsePositiveInt(value: string, field: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} must be a positive integer, got: ${value}`);
  }
  return parsed;
}

function buildSyntheticOverviewFixture(
  topicCount: number,
  subtopicsPerTopic: number,
  commentsPerSubtopic: number
): SyntheticOverviewFixture {
  const comments: Comment[] = [];
  const topicSections: SummaryContent[] = [];
  let nextId = 1;

  for (let topicIdx = 1; topicIdx <= topicCount; topicIdx++) {
    const topicName = `Topic ${topicIdx}`;
    const subtopicSections: SummaryContent[] = [];

    for (let subtopicIdx = 1; subtopicIdx <= subtopicsPerTopic; subtopicIdx++) {
      const subtopicName = `Subtopic ${topicIdx}.${subtopicIdx}`;
      const subtopicCommentIds: string[] = [];

      for (let commentIdx = 1; commentIdx <= commentsPerSubtopic; commentIdx++) {
        const id = String(nextId++);
        subtopicCommentIds.push(id);
        comments.push({
          id,
          text:
            `Statement ${id}: Participants discuss ${topicName} / ${subtopicName}. ` +
            `The statement highlights concrete requests, trade-offs, and implementation details (${commentIdx}/${commentsPerSubtopic}).`,
          voteInfo: new VoteTally(30 + (commentIdx % 7), 8 + (commentIdx % 5), commentIdx % 3),
          topics: [
            {
              name: topicName,
              subtopics: [{ name: subtopicName }],
            },
          ],
        });
      }

      subtopicSections.push({
        title: `#### ${subtopicName} (${commentsPerSubtopic} statements)`,
        text:
          `${subtopicName} captures recurring practical concerns and proposals. ` +
          `The subtopic includes operational details, concerns about side effects, and concrete examples from statements.`,
        citations: subtopicCommentIds.slice(0, 3),
        subContents: [
          {
            title: "Prominent themes were:",
            text:
              `* Feasibility and timeline clarity\n` +
              `* Budget and staffing constraints\n` +
              `* Equitable access across neighborhoods`,
          },
          {
            title: "Common ground:",
            text:
              "Participants broadly agree on improving service quality and maintaining accountability in implementation.",
            citations: subtopicCommentIds.slice(0, 2),
          },
          {
            title: "Differences of opinion:",
            text:
              "Statements diverge on sequencing, level of investment, and degree of policy strictness.",
            citations: subtopicCommentIds.slice(1, 3),
          },
        ],
      });
    }

    topicSections.push({
      title: `### ${topicName} (${subtopicsPerTopic * commentsPerSubtopic} statements)`,
      text:
        `${topicName} aggregates ${subtopicsPerTopic} subtopics with detailed proposals and constraints. ` +
        `The section reflects both common priorities and implementation trade-offs.`,
      subContents: subtopicSections,
    });
  }

  return {
    comments,
    topicsSummary: {
      title: "## Topics",
      text:
        `Synthetic topics summary used to test the overview subtask with enough data volume. ` +
        `It includes nested topic/subtopic summaries similar to production output.`,
      subContents: topicSections,
    },
  };
}

async function runOverviewSubtask(
  model: OpenRouterModel,
  method: OverviewMethod,
  fixture: SyntheticOverviewFixture,
  outputLang: SupportedLanguage,
  additionalContext?: string
) {
  const summaryStats = new MajoritySummaryStats(fixture.comments, outputLang);
  const overview = await new OverviewSummary(
    {
      summaryStats,
      topicsSummary: fixture.topicsSummary,
      method,
    },
    model,
    additionalContext,
    outputLang
  ).getSummary();

  const markdown = new Summary([overview], fixture.comments).getText("MARKDOWN");
  const bulletLines = overview.text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("* **"));
  const expectedTopicCount = summaryStats.getStatsByTopic().length;

  if (bulletLines.length !== expectedTopicCount) {
    throw new Error(
      `Overview bullet count mismatch for ${method}: expected ${expectedTopicCount}, got ${bulletLines.length}`
    );
  }

  return {
    method,
    topicCount: expectedTopicCount,
    bulletCount: bulletLines.length,
    title: overview.title,
    markdown,
  };
}

async function main(): Promise<void> {
  loadEnvironmentVariables();

  const program = new Command();
  program
    .name("overview_subtask_open_router")
    .description("Run only the overview summarization subtask against a live OpenRouter model.")
    .option(
      "-m, --model <model>",
      "OpenRouter model identifier (e.g. 'openai/gpt-oss-120b'). Falls back to OPENROUTER_MODEL env."
    )
    .option(
      "-k, --apiKey <key>",
      "OpenRouter API key. If omitted, falls back to OPENROUTER_API_KEY env."
    )
    .option("--method <method>", "one-shot | per-topic | both", "one-shot")
    .option("--topicCount <count>", "Synthetic top-level topic count.", "8")
    .option("--subtopicsPerTopic <count>", "Synthetic subtopics per topic.", "4")
    .option("--commentsPerSubtopic <count>", "Synthetic comments per subtopic.", "10")
    .option("-l, --outputLang <language>", "Output language.", "en")
    .option(
      "-a, --additionalContext <context>",
      "Extra context appended to the overview prompt.",
      "This synthetic consultation simulates civic feedback on infrastructure and services."
    )
    .option(
      "-o, --outputFile <file>",
      "Optional path to save JSON output.",
      "tmp/overview-subtask-open-router.json"
    );

  program.parse(process.argv);
  const options = program.opts();

  const topicCount = parsePositiveInt(options.topicCount, "topicCount");
  const subtopicsPerTopic = parsePositiveInt(options.subtopicsPerTopic, "subtopicsPerTopic");
  const commentsPerSubtopic = parsePositiveInt(options.commentsPerSubtopic, "commentsPerSubtopic");
  const outputLang = options.outputLang as SupportedLanguage;
  const methodOption = String(options.method).trim().toLowerCase();

  if (!["one-shot", "per-topic", "both"].includes(methodOption)) {
    throw new Error(`method must be one of: one-shot, per-topic, both. Got: ${options.method}`);
  }

  const apiKey = options.apiKey || getRequiredEnvVar("OPENROUTER_API_KEY");
  const modelName =
    options.model || getEnvVar("OPENROUTER_MODEL", "openai/gpt-oss-120b") || "openai/gpt-oss-120b";

  const fixture = buildSyntheticOverviewFixture(topicCount, subtopicsPerTopic, commentsPerSubtopic);
  const model = new OpenRouterModel(apiKey, modelName);

  console.log("Running overview subtask with synthetic fixture:");
  console.log(`- model: ${modelName}`);
  console.log(`- method: ${methodOption}`);
  console.log(`- language: ${outputLang}`);
  console.log(
    `- synthetic volume: ${fixture.comments.length} comments (${topicCount} topics x ${subtopicsPerTopic} subtopics x ${commentsPerSubtopic} comments)`
  );

  const startedAt = Date.now();
  const methods: OverviewMethod[] =
    methodOption === "both" ? ["one-shot", "per-topic"] : [methodOption as OverviewMethod];
  const outputs = [];

  for (const method of methods) {
    console.log(`\n[RUN] method=${method}`);
    const result = await runOverviewSubtask(
      model,
      method,
      fixture,
      outputLang,
      options.additionalContext
    );
    console.log(`[OK] ${method} produced ${result.bulletCount} topic bullets.`);
    outputs.push(result);
  }

  const elapsedMs = Date.now() - startedAt;
  const payload = {
    generatedAt: new Date().toISOString(),
    elapsedMs,
    config: {
      model: modelName,
      outputLang,
      topicCount,
      subtopicsPerTopic,
      commentsPerSubtopic,
      totalComments: fixture.comments.length,
    },
    outputs,
  };

  if (options.outputFile) {
    writeFileSync(options.outputFile, JSON.stringify(payload, null, 2));
    console.log(`\nSaved output to ${options.outputFile}`);
  }

  console.log("\nOverview subtask run completed.");
}

main();
