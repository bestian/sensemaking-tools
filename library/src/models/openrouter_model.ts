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

// Module to interact with models available through OpenRouter, including various
// AI models from different providers like OpenAI, Anthropic, Google, etc.

import OpenAI from "openai";
import { Model } from "./model";
import { retryCall } from "../sensemaker_utils";
import pLimit from "p-limit";
import { getEnvVar, getRequiredEnvVar } from "../utils/env_loader";
import { checkDataSchema } from "../types";
import { Static, TSchema } from "@sinclair/typebox";
import { RETRY_DELAY_MS, MAX_LLM_RETRIES } from "./model_util";

// 環境變數常數
const DEFAULT_OPENROUTER_PARALLELISM = 2;
const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";

/**
 * Class to interact with models available through OpenRouter.
 */
export class OpenRouterModel extends Model {
  private openai: OpenAI;
  private modelName: string;
  private limit: pLimit.Limit; // controls model calls concurrency on model's instance level
  
  // Override the default categorization batch size if needed
  public readonly categorizationBatchSize: number = 100;

  /**
   * Create a model object.
   * @param apiKey - the OpenRouter API key
   * @param modelName - the name of the model from OpenRouter to connect with
   * @param baseURL - optional custom base URL for OpenRouter API
   */
  constructor(
    apiKey: string,
    modelName: string = "openai/gpt-oss-120b",
    baseURL?: string
  ) {
    super();
    
    if (!apiKey) {
      throw Error("OpenRouter API key is required");
    }

    this.openai = new OpenAI({
      apiKey,
      baseURL: baseURL || DEFAULT_OPENROUTER_BASE_URL,
    });
    
    this.modelName = modelName;

    // 從環境變數讀取並發限制，或使用預設值
    const parallelismEnvVar = process.env["DEFAULT_OPENROUTER_PARALLELISM"];
    const parallelism = parallelismEnvVar ? parseInt(parallelismEnvVar) : DEFAULT_OPENROUTER_PARALLELISM;
    
    console.log("Creating OpenRouterModel with ", parallelism, " parallel workers...");
    this.limit = pLimit(parallelism);
  }

  /**
   * Get the current model name being used.
   * @returns the model name
   */
  getModelName(): string {
    return this.modelName;
  }

  /**
   * Get the current parallelism limit.
   * @returns the current parallelism limit
   */
  getParallelismLimit(): number {
    // p-limit doesn't expose the limit value directly, so we'll return the configured value
    const parallelismEnvVar = process.env["DEFAULT_OPENROUTER_PARALLELISM"];
    return parallelismEnvVar ? parseInt(parallelismEnvVar) : DEFAULT_OPENROUTER_PARALLELISM;
  }

  /**
   * Check if the model supports structured output (JSON Schema).
   * @returns true if the model supports structured output
   */
  supportsStructuredOutput(): boolean {
    // Most OpenRouter models support structured output via response_format
    return true;
  }

  /**
   * Generate text based on the given prompt.
   * @param prompt the text including instructions and/or data to give the model
   * @returns the model response as a string
   */
  async generateText(prompt: string): Promise<string> {
    return await this.callLLM(prompt);
  }

  /**
   * Generate structured data based on the given prompt.
   * @param prompt the text including instructions and/or data to give the model
   * @param schema a JSON Schema specification (generated from TypeBox)
   * @returns the model response as data structured according to the JSON Schema specification
   */
  async generateData(prompt: string, schema: TSchema): Promise<Static<typeof schema>> {
    const validateResponse = (response: string): boolean => {
      let parsedResponse;
      try {
        parsedResponse = JSON.parse(response);
      } catch (e) {
        console.error(`Model returned a non-JSON response:\n${response}\n${e}`);
        return false;
      }
      if (!checkDataSchema(schema, parsedResponse)) {
        console.error("Model response does not match schema: " + response);
        return false;
      }

      return true;
    };
    
    return JSON.parse(
      await this.callLLM(prompt, validateResponse, schema)
    );
  }

  /**
   * Calls an LLM to generate text based on a given prompt and handles rate limiting, response validation and retries.
   *
   * Concurrency: To take advantage of concurrent execution, invoke this function as a batch of callbacks,
   * and pass it to the `executeConcurrently` function. It will run multiple `callLLM` functions concurrently,
   * up to the limit set by `p-limit` in `OpenRouterModel`'s constructor.
   *
   * @param prompt - The text prompt to send to the language model.
   * @param validator - optional check for the model response.
   * @param schema - optional JSON schema for structured output.
   * @returns A Promise that resolves with the text generated by the language model.
   */
  async callLLM(
    prompt: string,
    validator: (response: string) => boolean = () => true,
    schema?: TSchema
  ): Promise<string> {
    // Wrap the entire retryCall sequence with the `p-limit` limiter,
    // so we don't let other calls to start until we're done with the current one
    // (in case it's failing with rate limits error and needs to be waited on and retried first)
    const rateLimitedCall = () =>
      this.limit(async () => {
        return await retryCall(
          // call LLM
          async () => {
            const requestOptions: {
              model: string;
              messages: Array<{ role: "user"; content: string }>;
              max_tokens: number;
              temperature: number;
              stream: boolean;
              response_format?: {
                type: "json_schema";
                json_schema: {
                  name: string;
                  strict: boolean;
                  schema: TSchema;
                };
              };
            } = {
              model: this.modelName,
              messages: [{ role: "user", content: prompt }],
              max_tokens: 4000,
              temperature: 0,
              stream: false,
            };

            // 如果有 schema，設定結構化輸出
            if (schema) {
              requestOptions.response_format = {
                type: "json_schema",
                json_schema: {
                  name: "response",
                  strict: true, // 若改為 false 會允許更寬鬆的格式
                  schema: schema
                }
              };
            }

            const completion = await this.openai.chat.completions.create(requestOptions) as any;
            
            // 檢查回應是否有效
            if (!completion.choices || completion.choices.length === 0) {
              throw new Error("No choices returned from OpenRouter API");
            }

            console.log(completion.choices[0]?.message);
            
            const content = completion.choices[0]?.message?.content;
            if (!content || content.trim() === "") {
              throw new Error("Empty content returned from OpenRouter API");
            }
            
            // 檢查是否為有效的 JSON 回應（當使用 schema 時）
            if (schema && content.trim().startsWith('{')) {
              try {
                JSON.parse(content);
              } catch {
                console.warn("OpenRouter returned malformed JSON, attempting to fix...");
                // 嘗試修復常見的 JSON 格式問題
                const fixedContent = content
                  .replace(/[\u2013\u2014]/g, '-') // 修復破折號
                  .replace(/\s+/g, ' ') // 修復多餘空格
                  .replace(/[‑\-\s]+/g, ' ') // 修復各種破折號和空格
                  .replace(/[^\x00-\x7F]/g, '') // 移除非 ASCII 字符
                  .trim();
                try {
                  JSON.parse(fixedContent);
                  return fixedContent;
                } catch (e2) {
                  console.error("Failed to fix JSON:", e2);
                  // 最後嘗試：移除所有可能的問題字符
                  const lastResortContent = content
                    .replace(/[^\w\s\{\}\[\]":,.-]/g, '')
                    .replace(/\s+/g, ' ')
                    .trim();
                  try {
                    JSON.parse(lastResortContent);
                    console.warn("JSON fixed with last resort method");
                    return lastResortContent;
                  } catch (e3) {
                    console.error("All JSON fixing attempts failed:", e3);
                    throw new Error("Invalid JSON response from OpenRouter API");
                  }
                }
              }
            }
            
            return content;
          },
          // Check if the response exists and contains text.
          function (response): boolean {
            if (!response || typeof response !== "string") {
              console.error("Failed to get a model response.");
              return false;
            }
            if (response.trim() === "") {
              console.error("Model returned an empty response.");
              return false;
            }
            if (!validator(response)) {
              return false;
            }
            console.log("✓ Completed LLM call");
            return true;
          },
          MAX_LLM_RETRIES,
          "Failed to get a valid model response.",
          RETRY_DELAY_MS,
          [], // Arguments for the LLM call
          [] // Arguments for the validator function
        );
      });

    return await rateLimitedCall();
  }
}

/**
 * Factory function to create an OpenRouterModel from environment variables.
 * @returns OpenRouterModel instance configured from environment variables
 */
export function createOpenRouterModelFromEnv(): OpenRouterModel {
  const apiKey = getRequiredEnvVar("OPENROUTER_API_KEY");
  const model = getEnvVar("OPENROUTER_MODEL", "openai/gpt-oss-120b");
  const baseURL = getEnvVar("OPENROUTER_BASE_URL", DEFAULT_OPENROUTER_BASE_URL);

  return new OpenRouterModel(apiKey, model, baseURL);
}
