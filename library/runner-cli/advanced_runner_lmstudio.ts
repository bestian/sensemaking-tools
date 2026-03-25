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

import { Command } from "commander";
import { writeFileSync } from "fs";
import { concatTopics, getCommentsFromCsv } from "./runner_utils";
import { Sensemaker } from "../src/sensemaker";
import { LmStudioModel } from "../src/models/lmstudio_model";
import { MajoritySummaryStats } from "../src/stats/majority_vote";
import { TopicStats } from "../src/stats/summary_stats";
import { RelativeContext } from "../src/tasks/summarization_subtasks/relative_context";
import { Comment, CommentWithVoteInfo, Summary, SummarizationType, VoteInfo } from "../src/types";
import { getTotalAgreeRate, getTotalDisagreeRate, getTotalPassRate } from "../src/stats/stats_util";
import { SupportedLanguage } from "../templates/l10n/languages";

interface MinimalTopicStat {
  name: string;
  commentCount: number;
  voteCount: number;
  subtopicStats?: MinimalTopicStat[];
  relativeEngagement: string;
  relativeAlignment: string;
}

interface CommentWithScores {
  id: string;
  text: string;
  votes?: VoteInfo;
  topics?: string;
  agreeRate?: number;
  disagreeRate?: number;
  passRate?: number;
  isHighAlignment?: boolean;
  highAlignmentScore?: number;
  isLowAlignment?: boolean;
  lowAlignmentScore?: number;
  isHighUncertainty?: boolean;
  highUncertaintyScore?: number;
  isFilteredOut?: boolean;
}

function createMinimalStats(
  stats: TopicStats[],
  outputLang: SupportedLanguage = "en",
  relativeContext: RelativeContext | null = null
): MinimalTopicStat[] {
  const context = relativeContext || new RelativeContext(stats, outputLang);
  return stats.map((stat): MinimalTopicStat => ({
    name: stat.name,
    commentCount: stat.commentCount,
    voteCount: stat.summaryStats.voteCount,
    relativeAlignment: context.getRelativeAgreement(stat.summaryStats),
    relativeEngagement: context.getRelativeEngagement(stat.summaryStats),
    subtopicStats: stat.subtopicStats
      ? createMinimalStats(stat.subtopicStats, outputLang, context)
      : undefined,
  }));
}

function getCommentsWithScores(
  comments: Comment[],
  stats: MajoritySummaryStats
): CommentWithScores[] {
  const highAlignmentCommentIDs = stats
    .getCommonGroundComments(Number.MAX_VALUE)
    .map((comment) => comment.id);
  const lowAlignmentCommentIDs = stats
    .getDifferenceOfOpinionComments(Number.MAX_VALUE)
    .map((comment) => comment.id);
  const highUncertaintyCommentIDs = stats
    .getUncertainComments(Number.MAX_VALUE)
    .map((comment) => comment.id);
  const filteredCommentIds = stats.filteredComments.map((comment) => comment.id);

  return comments.map((comment) => {
    const commentWithScores: CommentWithScores = {
      id: comment.id,
      text: comment.text,
      votes: comment.voteInfo,
      topics: concatTopics(comment),
    };

    if (comment.voteInfo) {
      const commentWithVoteInfo = comment as CommentWithVoteInfo;
      commentWithScores.passRate = getTotalPassRate(comment.voteInfo, stats.asProbabilityEstimate);
      commentWithScores.agreeRate = getTotalAgreeRate(
        comment.voteInfo,
        stats.includePasses,
        stats.asProbabilityEstimate
      );
      commentWithScores.disagreeRate = getTotalDisagreeRate(
        comment.voteInfo,
        stats.includePasses,
        stats.asProbabilityEstimate
      );
      commentWithScores.isHighAlignment = highAlignmentCommentIDs.includes(comment.id);
      commentWithScores.highAlignmentScore = stats.getCommonGroundScore(commentWithVoteInfo);
      commentWithScores.isLowAlignment = lowAlignmentCommentIDs.includes(comment.id);
      commentWithScores.lowAlignmentScore = stats.getDifferenceOfOpinionScore(commentWithVoteInfo);
      commentWithScores.isHighUncertainty = highUncertaintyCommentIDs.includes(comment.id);
      commentWithScores.highUncertaintyScore = stats.getUncertainScore(commentWithVoteInfo);
      commentWithScores.isFilteredOut = !filteredCommentIds.includes(comment.id);
    }

    return commentWithScores;
  });
}

async function summarizeWithLocalModel(
  comments: Comment[],
  outputLang: SupportedLanguage,
  additionalContext?: string,
  modelName?: string,
  baseUrl?: string,
  maxTokens?: number,
  topicDepth: 1 | 2 | 3 = 2
): Promise<{ categorizedComments: Comment[]; summary: Summary }> {
  const sensemaker = new Sensemaker({
    defaultModel: new LmStudioModel({
      baseUrl,
      maxTokens,
      modelName,
    }),
  });

  const categorizedComments = await sensemaker.categorizeComments(
    comments,
    topicDepth >= 2,
    undefined,
    additionalContext,
    topicDepth,
    outputLang
  );

  const summary = await sensemaker.summarize(
    categorizedComments,
    SummarizationType.AGGREGATE_VOTE,
    undefined,
    additionalContext,
    outputLang
  );

  return {
    categorizedComments,
    summary: summary.withoutContents((sc) => sc.type === "TopicSummary"),
  };
}

async function main(): Promise<void> {
  const program = new Command();
  program
    .requiredOption("-o, --outputBasename <file>", "Basename for JSON output files.")
    .requiredOption("-i, --inputFile <file>", "Input CSV file in processed Polis format.")
    .option(
      "-a, --additionalContext <context>",
      "Short context about the conversation to guide local summarization."
    )
    .option("-m, --model <model>", "LM Studio model identifier.", "nvidia/nemotron-3-nano-4b")
    .option(
      "--baseUrl <url>",
      "LM Studio OpenAI-compatible base URL.",
      "http://127.0.0.1:1234/v1"
    )
    .option("--maxTokens <count>", "Maximum completion tokens per local request.", "4096")
    .option("-l, --outputLang <language>", "Output language.", "en")
    .option(
      "-d, --topicDepth <number>",
      "Topic depth to learn. Use 1 for topics only, 2 for topics + subtopics, or 3 for sub-subtopics.",
      "2"
    );
  program.parse(process.argv);
  const options = program.opts();

  const topicDepth = parseInt(options.topicDepth, 10) as 1 | 2 | 3;
  if (![1, 2, 3].includes(topicDepth)) {
    throw new Error("topicDepth must be one of 1, 2, or 3");
  }

  const comments = await getCommentsFromCsv(options.inputFile);
  const { categorizedComments, summary } = await summarizeWithLocalModel(
    comments,
    options.outputLang,
    options.additionalContext,
    options.model,
    options.baseUrl,
    parseInt(options.maxTokens, 10),
    topicDepth
  );

  const stats = new MajoritySummaryStats(categorizedComments);
  if (stats.getStatsByTopic().length === 0) {
    throw new Error("The local model returned no topics. Try rerunning with more context.");
  }

  const minimalTopicStats = createMinimalStats(stats.getStatsByTopic(), options.outputLang);
  writeFileSync(
    options.outputBasename + "-topic-stats.json",
    JSON.stringify(minimalTopicStats, null, 2)
  );

  const commentsWithScores = getCommentsWithScores(categorizedComments, stats);
  writeFileSync(
    options.outputBasename + "-comments-with-scores.json",
    JSON.stringify(commentsWithScores, null, 2)
  );

  writeFileSync(options.outputBasename + "-summary.json", JSON.stringify(summary, null, 2));
}

main();
