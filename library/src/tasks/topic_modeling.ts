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

import { Type } from "@sinclair/typebox";
import { Model } from "../models/model";
import { MAX_RETRIES } from "../models/model_util";
import { getPrompt, retryCall } from "../sensemaker_utils";
import { Comment, FlatTopic, NestedTopic, Topic } from "../types";
import { SupportedLanguage } from "../../templates/l10n";

/**
 * @fileoverview Helper functions for performing topic modeling on sets of comments.
 */

export const LEARN_TOPICS_PROMPT = `
Analyze the following comments and identify common topics.
Consider the granularity of topics: too few topics may oversimplify the content and miss important nuances, while too many topics may lead to redundancy and make the overall structure less clear.
Aim for a balanced number of topics that effectively summarizes the key themes without excessive detail.
After analysis of the comments, determine the optimal number of topics to represent the content effectively.
Justify why having fewer topics would be less optimal (potentially oversimplifying and missing key nuances), and why having more topics would also be less optimal (potentially leading to redundancy and a less clear overall structure).
After determining the optimal number of topics, identify those topics.

IMPORTANT: 
- Do NOT create a topic named "Other" or "Miscellaneous" or similar catch-all names.
- Each topic should have a specific, descriptive name that clearly represents the content.
- Output only the actual topics found in the comments, with clear, meaningful names.
- Use the exact JSON schema format specified: [{"name": "Topic Name"}]
`;

export function learnSubtopicsForOneTopicPrompt(parentTopic: Topic, otherTopics?: Topic[]): string {
  const otherTopicNames = otherTopics?.map((topic) => topic.name).join(", ") ?? "";

  return `
Analyze the following comments and identify common subtopics within the following overarching topic: "${parentTopic.name}".
Consider the granularity of subtopics: too few subtopics may oversimplify the content and miss important nuances, while too many subtopics may lead to redundancy and make the overall structure less clear.
Aim for a balanced number of subtopics that effectively summarizes the key themes without excessive detail.
After analysis of the comments, determine the optimal number of subtopics to represent the content effectively.
Justify why having fewer subtopics would be less optimal (potentially oversimplifying and missing key nuances), and why having more subtopics would also be less optimal (potentially leading to redundancy and a less clear overall structure).
After determining the optimal number of subtopics, identify those subtopics.

Important Considerations:
- No subtopics should have the same name as the overarching topic.
- There are other overarching topics that are being used on different sets of comments, do not use these overarching topic names as identified subtopics names: ${otherTopicNames}

Example of Incorrect Output:

[
  {
    "name": "Economic Development",
    "subtopics": [
        { "name": "Job Creation" },
        { "name": "Business Growth" },
        { "name": "Small Business Development" },
        { "name": "Small Business Marketing" } // Incorrect: Too closely related to the "Small Business Development" subtopic
        { "name": "Infrastructure & Transportation" } // Incorrect: This is the name of a main topic
      ]
  }
]
`;
}

/**
 * Generates an LLM prompt for topic modeling of a set of comments.
 *
 * @param parentTopics - Optional. An array of top-level topics to use.
 * @returns The generated prompt string.
 */
export function generateTopicModelingPrompt(parentTopic?: Topic, otherTopics?: Topic[]): string {
  if (parentTopic) {
    return learnSubtopicsForOneTopicPrompt(parentTopic, otherTopics);
  } else {
    return LEARN_TOPICS_PROMPT;
  }
}

/**
 * Learn either topics or subtopics from the given comments.
 * @param comments the comments to consider
 * @param model the LLM to use
 * @param topic given or learned topic that subtopics will fit under
 * @param otherTopics other topics that are being used, this is used
 * to avoid duplicate topic/subtopic names
 * @param additionalContext more info to give the model
 * @returns the topics that are present in the comments.
 */
export function learnOneLevelOfTopics(
  comments: Comment[],
  model: Model,
  topic?: Topic,
  otherTopics?: Topic[],
  additionalContext?: string,
  output_lang: SupportedLanguage = "en"
): Promise<Topic[]> {
  const instructions = generateTopicModelingPrompt(topic, otherTopics);
  const schema = topic ? Type.Array(NestedTopic) : Type.Array(FlatTopic);

  return retryCall(
    async function (model: Model): Promise<Topic[]> {
      console.log(`Identifying topics for ${comments.length} statements`);
      return (await model.generateData(
        getPrompt(
          instructions,
          comments.map((comment) => comment.text),
          additionalContext,
          output_lang
        ),
        schema,
        output_lang
      )) as Topic[];
    },
    function (response: Topic[]): boolean {
      return learnedTopicsValid(response, topic);
    },
    MAX_RETRIES,
    "Topic identification failed.",
    undefined,
    [model],
    []
  );
}

/**
 * Validates the topic modeling response from the LLM.
 *
 * @param response The topic modeling response from the LLM.
 * @param parentTopics Optional. An array of parent topic names to validate against.
 * @returns True if the response is valid, false otherwise.
 */
export function learnedTopicsValid(response: Topic[], parentTopic?: Topic): boolean {
  const topicNames = response.map((topic) => topic.name);

  // 1. If a parentTopic is provided, ensure no other top-level topics exist except "Other".
  if (parentTopic) {
    const allowedTopicNames = [parentTopic]
      .map((topic: Topic) => topic.name.toLowerCase())
      .concat("other");
    
    // 更寬鬆的主題名稱匹配，允許大小寫和格式差異
    const normalizedTopicNames = topicNames.map(name => 
      name.toLowerCase().replace(/[‑\-\s]+/g, ' ').trim()
    );
    const normalizedAllowedNames = allowedTopicNames.map(name => 
      name.toLowerCase().replace(/[‑\-\s]+/g, ' ').trim()
    );
    
    if (!normalizedTopicNames.every((name) => normalizedAllowedNames.includes(name))) {
      normalizedTopicNames.forEach((topicName: string, index: number) => {
        if (!normalizedAllowedNames.includes(topicName)) {
          console.warn(
            "Invalid response: Found top-level topic not present in the provided topics. Provided topics: ",
            normalizedAllowedNames,
            " Found topic: ",
            topicNames[index]
          );
        }
      });
      return false;
    }
  }

  // 2. Ensure no subtopic has the same name as any main topic.
  for (const topic of response) {
    const subtopicNames =
      "subtopics" in topic ? topic.subtopics.map((subtopic) => subtopic.name) : [];
    for (const subtopicName of subtopicNames) {
      // 更寬鬆的名稱匹配，允許大小寫和格式差異
      const normalizedSubtopicName = subtopicName.toLowerCase().replace(/[‑\-\s]+/g, ' ').trim();
      const normalizedTopicNames = topicNames.map(name => 
        name.toLowerCase().replace(/[‑\-\s]+/g, ' ').trim()
      );
      
      if (normalizedTopicNames.includes(normalizedSubtopicName) && subtopicName !== "Other") {
        console.warn(
          `Invalid response: Subtopic "${subtopicName}" has the same name as a main topic.`
        );
        return false;
      }
    }
  }

  return true;
}
