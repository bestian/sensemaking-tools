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

// Utility functions for the GGML (llama-server) runner.
// Re-exports CSV helpers from the OpenRouter utils and provides
// getSummary / getTopicsAndSubtopics wired to GgmlModel.

import { Sensemaker } from "../src/sensemaker";
import { GgmlModel } from "../src/models/ggml_model";
import { Summary, SummarizationType, Comment, Topic } from "../src/types";
import { SupportedLanguage } from "../templates/l10n";

// Re-export everything that doesn't depend on OpenRouter
export {
  getCommentsFromCsv,
  writeSummaryToGroundedCSV,
  writeSummaryToHtml,
  concatTopics,
  parseTopicsString,
  getTopicsFromComments,
  type CommentCsvRow,
  type VoteTallyCsvRow,
} from "./runner_openrouter_utils";

/**
 * Identify topics and subtopics using a local GGML model.
 */
export async function getTopicsAndSubtopics(
  comments: Comment[],
  output_lang: SupportedLanguage = "en",
  serverUrl: string = "http://127.0.0.1:8080"
): Promise<Topic[]> {
  const sensemaker = new Sensemaker({
    defaultModel: new GgmlModel(serverUrl),
  });
  return await sensemaker.learnTopics(comments, true, undefined, undefined, 2, output_lang);
}

/**
 * Run summarization using a local GGML model.
 */
export async function getSummary(
  comments: Comment[],
  topics?: Topic[],
  additionalContext?: string,
  output_lang: SupportedLanguage = "en",
  serverUrl: string = "http://127.0.0.1:8080"
): Promise<Summary> {
  const sensemaker = new Sensemaker({
    defaultModel: new GgmlModel(serverUrl),
  });
  const summary = await sensemaker.summarize(
    comments,
    SummarizationType.AGGREGATE_VOTE,
    topics,
    additionalContext,
    output_lang
  );
  return summary.withoutContents((sc) => sc.type === "TopicSummary");
}
