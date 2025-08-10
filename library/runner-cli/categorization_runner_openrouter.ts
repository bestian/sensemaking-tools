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

// Learns and assigns topics and subtopics to a CSV of comments using OpenRouter models.
//
// The input CSV must contain "comment_text" and "comment-id" fields. The output CSV will contain
// all input fields plus a new "topics" field which concatenates all topics and subtopics, e.g.
// "Transportation:PublicTransit;Transportation:Parking;Technology:Internet"
//
// Sample Usage:
// npx ts-node library/runner-cli/categorization_runner_openrouter.ts \
//    --topicDepth 2 \
//    --outputFile ~/outputs/test.csv  \
//    --inputFile ~/input.csv \
//    --model "openai/gpt-4o" \
//    --additionalContext "關於城市交通的討論"

import { OpenRouterModel } from "../src/models/openrouter_model";
import { Sensemaker } from "../src/sensemaker";
import { Comment, Topic } from "../src/types";
import { Command } from "commander";
import { parse } from "csv-parse";
import { createObjectCsvWriter } from "csv-writer";
import * as fs from "fs";
import * as path from "path";
import { concatTopics } from "./runner_utils";
import { getEnvVar, getRequiredEnvVar, loadEnvironmentVariables } from "../src/utils/env_loader";

type CommentCsvRow = {
  "comment-id": string;
  comment_text: string;
  topics: string;
};

async function main(): Promise<void> {
  // 載入環境變數
  loadEnvironmentVariables();
  
  // Parse command line arguments.
  const program = new Command();
  program
    .option("-o, --outputFile <file>", "The output file name.")
    .option("-i, --inputFile <file>", "The input file name.")
    .option("-t, --topics <comma separated list>", "Optional list of top-level topics.")
    .option(
      "-d, --topicDepth [number]",
      "If set, will learn only topics (1), topics and subtopics (2), or topics, subtopics, and subsubtopics (3). The default is 2.",
      "2"
    )
    .option(
      "-a, --additionalContext <instructions>",
      "A short description of the conversation to add context."
    )
    .option(
      "-m, --model <model>",
      "OpenRouter model to use (e.g., 'openai/gpt-4o', 'anthropic/claude-3.5-sonnet', 'minimax/minimax-m2.5'). Defaults to OPENROUTER_MODEL env var or 'openai/gpt-4o'."
    )
    .option(
      "-f, --forceRerun",
      "Force rerun of categorization, ignoring existing topics in the input file."
    );
  program.parse(process.argv);
  const options = program.opts();
  options.topicDepth = parseInt(options.topicDepth);
  if (![1, 2, 3].includes(options.topicDepth)) {
    throw Error("topicDepth must be one of 1, 2, or 3");
  }

  // 獲取 OpenRouter 配置
  const apiKey = getRequiredEnvVar("OPENROUTER_API_KEY");
  const modelName = options.model || getEnvVar("OPENROUTER_MODEL", "openai/gpt-4o");
  
  console.log(`🚀 使用 OpenRouter 模型: ${modelName}`);
  console.log(`📊 主題深度: ${options.topicDepth}`);
  console.log(`📁 輸入檔案: ${options.inputFile}`);
  console.log(`📁 輸出檔案: ${options.outputFile}`);
  if (options.topics) {
    console.log(`🏷️  預設主題: ${options.topics}`);
  }
  if (options.additionalContext) {
    console.log(`📝 額外上下文: ${options.additionalContext}`);
  }
  console.log("");

  const csvRows = await readCsv(options.inputFile);
  let comments = convertCsvRowsToComments(csvRows);
  if (options.forceRerun) {
    comments = comments.map((comment) => {
      delete comment.topics;
      return comment;
    });
  }

  // Learn topics and categorize comments using OpenRouter model.
  const sensemaker = new Sensemaker({
    defaultModel: new OpenRouterModel(apiKey, modelName),
  });
  const topics = options.topics ? getTopics(options.topics) : undefined;
  
  console.log(`🤖 開始使用 ${modelName} 進行評論分類...`);
  const startTime = Date.now();
  
  const categorizedComments = await sensemaker.categorizeComments(
    comments,
    options.topicDepth >= 2 ? true : false,
    topics,
    options.additionalContext,
    options.topicDepth
  );

  const endTime = Date.now();
  console.log(`✅ 分類完成！耗時: ${endTime - startTime}ms`);
  console.log(`📊 處理了 ${categorizedComments.length} 條評論`);

  const csvRowsWithTopics = setTopics(csvRows, categorizedComments);

  await writeCsv(csvRowsWithTopics, options.outputFile);
  console.log(`🎉 所有工作完成！結果已保存到: ${options.outputFile}`);
}

async function readCsv(inputFilePath: string): Promise<CommentCsvRow[]> {
  if (!inputFilePath) {
    throw new Error("Input file path is missing!");
  }
  const filePath = path.resolve(inputFilePath);
  const fileContent = fs.readFileSync(filePath, { encoding: "utf-8" });

  const parser = parse(fileContent, {
    delimiter: ",",
    columns: true,
  });

  return new Promise((resolve, reject) => {
    const allRows: CommentCsvRow[] = [];
    fs.createReadStream(filePath)
      .pipe(parser)
      .on("error", (error) => reject(error))
      .on("data", (row: CommentCsvRow) => {
        allRows.push(row);
      })
      .on("end", () => resolve(allRows));
  });
}

function convertCsvRowsToComments(csvRows: CommentCsvRow[]): Comment[] {
  const comments: Comment[] = [];
  for (const row of csvRows) {
    comments.push({
      text: row["comment_text"],
      id: row["comment-id"],
    });
  }
  return comments;
}

function setTopics(csvRows: CommentCsvRow[], categorizedComments: Comment[]): CommentCsvRow[] {
  // Create a map from comment-id to csvRow
  const mapIdToCsvRow: { [commentId: string]: CommentCsvRow } = {};
  for (const csvRow of csvRows) {
    const commentId = csvRow["comment-id"];
    mapIdToCsvRow[commentId] = csvRow;
  }

  // For each comment in categorizedComments
  //   lookup corresponding original csv row
  //   add a "topics" field that concatenates all topics/subtopics
  const csvRowsWithTopics: CommentCsvRow[] = [];
  for (const comment of categorizedComments) {
    const csvRow = mapIdToCsvRow[comment.id];
    csvRow["topics"] = concatTopics(comment);
    csvRowsWithTopics.push(csvRow);
  }
  return csvRowsWithTopics;
}

async function writeCsv(csvRows: CommentCsvRow[], outputFile: string) {
  // Expect that all objects have the same keys, and make id match header title
  const header: { id: string; title: string }[] = [];
  for (const column of Object.keys(csvRows[0])) {
    header.push({ id: column, title: column });
  }
  const csvWriter = createObjectCsvWriter({
    path: outputFile,
    header: header,
  });
  csvWriter
    .writeRecords(csvRows)
    .then(() => console.log(`CSV file written successfully to ${outputFile}.`));
}

function getTopics(commaSeparatedTopics: string): Topic[] {
  const topics: Topic[] = [];
  for (const topic of commaSeparatedTopics.split(",")) {
    topics.push({ name: topic.trim() });
  }
  return topics;
}

// 錯誤處理和環境變數檢查
function validateEnvironment(): void {
  try {
    getRequiredEnvVar("OPENROUTER_API_KEY");
  } catch (error) {
    console.error(error);
    console.error("❌ 環境變數設定錯誤:");
    console.error("請設定 OPENROUTER_API_KEY 環境變數");
    console.error("");
    console.error("方式 1: 在 library/.env 檔案中設定:");
    console.error("OPENROUTER_API_KEY=your-api-key-here");
    console.error("OPENROUTER_MODEL=openai/gpt-4o");
    console.error("");
    console.error("方式 2: 設定系統環境變數:");
    console.error("export OPENROUTER_API_KEY=your-api-key-here");
    console.error("export OPENROUTER_MODEL=openai/gpt-4o");
    console.error("");
    console.error("從 https://openrouter.ai/ 獲取 API 金鑰");
    process.exit(1);
  }
}

// 主程序入口
if (require.main === module) {
  try {
    validateEnvironment();
    main().catch((error) => {
      console.error("❌ 程序執行失敗:");
      console.error(error);
      process.exit(1);
    });
  } catch (error) {
    console.error("❌ 程序初始化失敗:");
    console.error(error);
    process.exit(1);
  }
}
