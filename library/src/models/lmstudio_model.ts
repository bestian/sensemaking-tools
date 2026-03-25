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

import { Static, TSchema } from "@sinclair/typebox";
import { getLanguagePrefix, type SupportedLanguage } from "../../templates/l10n";
import { getEnvVar } from "../utils/env_loader";
import { Model } from "./model";

type ChatCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: string;
      reasoning_content?: string;
    };
  }>;
};

type LmStudioModelOptions = {
  apiKey?: string;
  baseUrl?: string;
  maxTokens?: number;
  modelName?: string;
};

const DEFAULT_BASE_URL = "http://127.0.0.1:1234/v1";
const DEFAULT_MODEL = "nvidia/nemotron-3-nano-4b";
const DEFAULT_MAX_TOKENS = 4096;
const MAX_RETRIES = 3;

export class LmStudioModel extends Model {
  private readonly apiKey?: string;
  private readonly baseUrl: string;
  private readonly maxTokens: number;
  private readonly modelName: string;

  constructor(options: LmStudioModelOptions = {}) {
    // Smaller categorization batches keep local models within a comfortable context window.
    super(20);
    this.apiKey = options.apiKey || getEnvVar("LM_STUDIO_API_KEY", undefined);
    this.baseUrl = normalizeBaseUrl(
      options.baseUrl || getEnvVar("LM_STUDIO_BASE_URL", DEFAULT_BASE_URL) || DEFAULT_BASE_URL
    );
    this.maxTokens = options.maxTokens || DEFAULT_MAX_TOKENS;
    this.modelName = options.modelName || getEnvVar("LM_STUDIO_MODEL", DEFAULT_MODEL) || DEFAULT_MODEL;
  }

  async generateText(prompt: string, output_lang: SupportedLanguage = "en"): Promise<string> {
    return await this.callLLM(prompt, undefined, output_lang);
  }

  async generateData(
    prompt: string,
    schema: TSchema,
    output_lang: SupportedLanguage = "en"
  ): Promise<Static<typeof schema>> {
    const rawResponse = await this.callLLM(prompt, schema, output_lang);
    const parsed = parseStructuredResponse(rawResponse);

    if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
      const wrapperKeys = ["items", "data", "result", "content", "output"];
      for (const key of wrapperKeys) {
        if (key in parsed) {
          return parsed[key as keyof typeof parsed] as Static<typeof schema>;
        }
      }
    }

    return parsed as Static<typeof schema>;
  }

  private async callLLM(
    prompt: string,
    schema?: TSchema,
    output_lang: SupportedLanguage = "en"
  ): Promise<string> {
    const messages = [
      { role: "system" as const, content: getLanguagePrefix(output_lang) },
      { role: "user" as const, content: prompt },
    ];

    const requestBody: Record<string, unknown> = {
      model: this.modelName,
      messages,
      temperature: 0,
      max_tokens: this.maxTokens,
      response_format: schema
        ? {
            type: "json_schema",
            json_schema: {
              name: "response",
              strict: true,
              schema,
            },
          }
        : {
            type: "text",
          },
    };

    let lastError: Error | null = null;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          throw new Error(`LM Studio API error: ${response.status} ${await response.text()}`);
        }

        const payload = (await response.json()) as ChatCompletionResponse;
        const text = extractMessageText(payload);
        if (!text) {
          throw new Error("LM Studio returned an empty completion.");
        }

        return schema ? text : sanitizeTextResponse(text);
      } catch (error) {
        lastError = error as Error;
        if (attempt === MAX_RETRIES) {
          break;
        }
        await sleep(attempt * 1000);
      }
    }

    throw lastError || new Error("LM Studio request failed without an explicit error.");
  }
}

function extractMessageText(response: ChatCompletionResponse): string {
  const message = response.choices?.[0]?.message;
  const candidates = [message?.content, message?.reasoning_content]
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.trim())
    .filter(Boolean);

  return candidates[0] || "";
}

function normalizeBaseUrl(baseUrl: string): string {
  return baseUrl.replace(/\/+$/, "");
}

function parseStructuredResponse(text: string): unknown {
  const candidates = buildJsonCandidates(text);
  for (const candidate of candidates) {
    try {
      return JSON.parse(candidate);
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(`Failed to parse LM Studio structured output: ${text}`);
}

function sanitizeTextResponse(text: string): string {
  const trimmed = text.trim();
  const lines = trimmed.split(/\r?\n/);
  const firstStructuredLineIndex = lines.findIndex((line) =>
    /^\s*(?:[*-]\s+|#{1,6}\s+|\d+\.\s+)/.test(line)
  );

  if (firstStructuredLineIndex > 0) {
    const prefix = lines.slice(0, firstStructuredLineIndex).join(" ").trim();
    if (looksLikeMetaPreamble(prefix)) {
      return lines.slice(firstStructuredLineIndex).join("\n").trim();
    }
  }

  return trimmed;
}

function buildJsonCandidates(text: string): string[] {
  const trimmed = text.trim();
  const candidates = new Set<string>();

  if (trimmed) {
    candidates.add(trimmed);
  }

  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenceMatch?.[1]) {
    candidates.add(fenceMatch[1].trim());
  }

  const objectStart = trimmed.indexOf("{");
  const objectEnd = trimmed.lastIndexOf("}");
  if (objectStart !== -1 && objectEnd > objectStart) {
    candidates.add(trimmed.slice(objectStart, objectEnd + 1));
  }

  const arrayStart = trimmed.indexOf("[");
  const arrayEnd = trimmed.lastIndexOf("]");
  if (arrayStart !== -1 && arrayEnd > arrayStart) {
    candidates.add(trimmed.slice(arrayStart, arrayEnd + 1));
  }

  return Array.from(candidates);
}

function looksLikeMetaPreamble(prefix: string): boolean {
  return /^(?:we\s+need|we\s+must|let'?s|i\s+should|here(?:'s| is)|format|output)/i.test(prefix);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
