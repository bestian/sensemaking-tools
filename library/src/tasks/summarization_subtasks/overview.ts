// Copyright 2025 Google LLC
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

// This file contains routines for generating summaries of the key findings from a report,
// based on the results of the more detailed topic and subtopic summaries

import { SummaryStats, TopicStats } from "../../stats/summary_stats";
import { OverviewSummaryItem, OverviewSummaryResponse, SummaryContent, Summary } from "../../types";
import { RecursiveSummary } from "./recursive_summarization";
import {
  formatOverviewItemsAsMarkdown,
  getAbstractPrompt,
  decimalToPercent,
  filterSummaryContent,
  isOverviewItemsValid,
  retryCall,
} from "../../sensemaker_utils";
import { Type } from "@sinclair/typebox";

// Import localization system
import { getReportSectionTitle, getReportContent } from "../../../templates/l10n";
import { getOverviewOneShotPrompt, getOverviewPerTopicPrompt } from "../../../templates/l10n/prompts";
import { SupportedLanguage } from "../../../templates/l10n/languages";

const OverviewPerTopicResponse = Type.Object({
  summary: Type.String(),
});

function describeResponseShape(response: unknown): string {
  if (Array.isArray(response)) {
    return `array(len=${response.length})`;
  }
  if (response === null) {
    return "null";
  }
  if (response === undefined) {
    return "undefined";
  }
  if (typeof response === "object") {
    const keys = Object.keys(response as Record<string, unknown>);
    return `object(keys=${keys.join(",") || "<none>"})`;
  }
  return typeof response;
}

function extractOverviewItems(response: unknown): OverviewSummaryItem[] {
  if (Array.isArray(response)) {
    return response as OverviewSummaryItem[];
  }
  if (
    response &&
    typeof response === "object" &&
    "items" in response &&
    Array.isArray((response as { items?: unknown }).items)
  ) {
    return (response as { items: OverviewSummaryItem[] }).items;
  }
  return [];
}

function oneShotInstructions(topicNames: string[], output_lang: string) {
  return getOverviewOneShotPrompt(output_lang as SupportedLanguage, topicNames);
}

function perTopicInstructions(topicName: string, output_lang: string) {
  return getOverviewPerTopicPrompt(output_lang as SupportedLanguage, topicName);
}

/**
 * The interface is the input structure for the OverviewSummary class, and controls
 * which specific method is used to generate this part of the summary.
 */
export interface OverviewInput {
  summaryStats: SummaryStats;
  topicsSummary: SummaryContent;
  method?: "one-shot" | "per-topic";
}

/**
 * Generates a summary of the key findings in the conversation, in terms of the top-level
 * topics.
 */
export class OverviewSummary extends RecursiveSummary<OverviewInput> {
  async getSummary(): Promise<SummaryContent> {
    // Debug: 檢查 output_lang 值
    console.log(`[DEBUG] OverviewSummary.getSummary() output_lang: ${this.output_lang}`);
    
    const method = this.input.method || "one-shot";
    const result = await (method == "one-shot" ? this.oneShotSummary() : this.perTopicSummary());

    // Get localized title and preamble from localization system
    const title = getReportSectionTitle("overview", this.output_lang);
    const preamble = getReportContent("overview", "preamble", this.output_lang);
    
    // Debug: 檢查本地化函式的調用參數和結果
    console.log(`[DEBUG] OverviewSummary.getSummary() calling getReportSectionTitle with: section="overview", output_lang="${this.output_lang}"`);
    console.log(`[DEBUG] OverviewSummary.getSummary() calling getReportContent with: section="overview", content="preamble", output_lang="${this.output_lang}"`);
    console.log(`[DEBUG] OverviewSummary.getSummary() title result: "${title}"`);
    console.log(`[DEBUG] OverviewSummary.getSummary() preamble result: "${preamble}"`);
    
    return { title, text: preamble + result };
  }

  /**
   * Produces a summary of the key findings within the conversation, based on the
   * results of the topicsSummary.
   * @returns A promise of the resulting summary string
   */
  async oneShotSummary(): Promise<string> {
    const topicNames = this.topicNames();
    const output_lang = this.output_lang;
    
    // Debug: 檢查 oneShotSummary 中的 output_lang 值
    console.log(`[DEBUG] OverviewSummary.oneShotSummary() output_lang: ${output_lang}`);
    
    const prompt = getAbstractPrompt(
      oneShotInstructions(topicNames, output_lang),
      [filterSectionsForOverview(this.input.topicsSummary)],
      (summary: SummaryContent) =>
        `<topicsSummary>\n` +
        `${new Summary([summary], []).getText("XML")}\n` +
        `  </topicsSummary>`,
      this.additionalContext,
      this.output_lang  // ← 加入 output_lang 參數
    );
    
    // Debug: 檢查 getAbstractPrompt 的調用參數
    console.log(`[DEBUG] OverviewSummary.oneShotSummary() calling getAbstractPrompt with: output_lang="${this.output_lang}"`);
    
    return await retryCall(
      async function (model, prompt, output_lang, topicNames): Promise<OverviewSummaryItem[]> {
        console.log(`Generating OVERVIEW SUMMARY in one shot`);
        console.log(`[DEBUG] retryCall function received output_lang: ${output_lang}`);
        const response = await model.generateData(
          prompt,
          OverviewSummaryResponse,
          output_lang
        );
        const items = extractOverviewItems(response);
        if (!isOverviewItemsValid(items, topicNames)) {
          console.warn(
            `[WARN] Invalid one-shot overview response shape: ${describeResponseShape(response)}`
          );
          throw new Error("Overview summary failed to conform to structured JSON format.");
        }
        return items;
      },
      (result) => isOverviewItemsValid(result, topicNames),
      6, // 6 retries
      "Overview summary failed to conform to structured JSON format, or did not include all topic descriptions exactly as intended.",
      undefined,
      [this.model, prompt, output_lang, topicNames],  // ← 加入 output_lang
      []
    ).then((items) => formatOverviewItemsAsMarkdown(items, topicNames));
  }

  /**
   * Generates a summary one topic at a time, and then programatically concatenates them.
   * @returns A promise of the resulting summary string
   */
  async perTopicSummary(): Promise<string> {
    // Debug: 檢查 perTopicSummary 中的 output_lang 值
    console.log(`[DEBUG] OverviewSummary.perTopicSummary() output_lang: ${this.output_lang}`);
    
    const items: OverviewSummaryItem[] = [];
    for (const topicStats of this.input.summaryStats.getStatsByTopic()) {
      const topicName = this.getTopicNameAndCommentPercentage(topicStats);
      const prompt = getAbstractPrompt(
        perTopicInstructions(topicName, this.output_lang),
        [filterSectionsForOverview(this.input.topicsSummary)],
        (summary: SummaryContent) =>
          `<topicsSummary>\n` +
          `${new Summary([summary], []).getText("XML")}\n` +
          `  </topicsSummary>`,
        this.additionalContext,
        this.output_lang  // ← 加入 output_lang 參數
      );
      
      // Debug: 檢查 getAbstractPrompt 的調用參數
      console.log(`[DEBUG] OverviewSummary.perTopicSummary() calling getAbstractPrompt with: output_lang="${this.output_lang}"`);
      
      console.log(`Generating OVERVIEW SUMMARY for topic: "${topicStats.name}"`);
      console.log(`[DEBUG] Calling model.generateData with output_lang: ${this.output_lang}`);
      const response = (await this.model.generateData(
        prompt,
        OverviewPerTopicResponse,
        this.output_lang
      )) as { summary: string };
      if (!response || typeof response.summary !== "string" || !response.summary.trim()) {
        console.warn(
          `[WARN] Invalid per-topic overview response shape: ${describeResponseShape(response)}`
        );
        throw new Error("Per-topic overview summary failed to return a valid summary string.");
      }
      items.push({
        topicName,
        summary: response.summary.trim(),
      });
    }
    const topicNames = this.topicNames();
    if (!isOverviewItemsValid(items, topicNames)) {
      throw new Error(
        "Per-topic overview summary failed to conform to structured JSON format, or topic ordering."
      );
    }
    return formatOverviewItemsAsMarkdown(items, topicNames);
  }

  /**
   * @returns Topic names with the percentage of comments classified thereunder in parentheses
   */
  private topicNames() {
    const summaryStats = this.input.summaryStats;
    return summaryStats.getStatsByTopic().map((topicStats: TopicStats) => {
      return this.getTopicNameAndCommentPercentage(topicStats);
    });
  }

  private getTopicNameAndCommentPercentage(topicStats: TopicStats): string {
    const totalCommentCount = this.input.summaryStats.commentCount;
    const percentage = decimalToPercent(topicStats.commentCount / totalCommentCount, 0);
    return `${topicStats.name} (${percentage})`;
  }
}

/**
 * This function removes all of the common ground and differences of opinion components
 * from the input topicSummary object, leaving the original unmodified.
 * @param topicSummary The result of the TopicsSummary component
 * @returns the resulting summary, as a new data structure
 */
function filterSectionsForOverview(topicSummary: SummaryContent): SummaryContent {
  return filterSummaryContent(
    topicSummary,
    (subtopicSummary: SummaryContent) =>
      !subtopicSummary.title?.includes("Common ground") &&
      !subtopicSummary.title?.includes("Differences of opinion")
  );
}
