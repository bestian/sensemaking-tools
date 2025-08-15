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

import { OpenAI } from "openai";
import { Model } from "./model";
import { TSchema, Static } from "@sinclair/typebox";

// Import localization system
import { getLanguagePrefix, type SupportedLanguage } from "../../templates/l10n";

export class OpenRouterModel extends Model {
  private openai: OpenAI;
  private modelName: string;

  constructor(apiKey: string, modelName: string = "anthropic/claude-3.5-sonnet") {
    super();
    this.modelName = modelName;
    this.openai = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://openrouter.ai/api/v1",
      defaultHeaders: {
        "HTTP-Referer": "https://github.com/your-repo",
        "X-Title": "Your App Name",
      },
    });
  }

  async generateText(prompt: string, output_lang: SupportedLanguage = "en"): Promise<string> {
    return await this.callLLM(prompt, undefined, undefined, output_lang);
  }

  async generateData(prompt: string, schema: TSchema, output_lang: SupportedLanguage = "en"): Promise<Static<typeof schema>> {
    return JSON.parse(await this.callLLM(prompt, validateResponse, schema, output_lang));
  }

  async callLLM(prompt: string, validator: (response: string) => boolean = () => true, schema?: TSchema, output_lang: SupportedLanguage = "en"): Promise<string> {
    // Get language prefix from localization system
    const languagePrefix = getLanguagePrefix(output_lang);
    
    const requestOptions: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
      model: this.modelName,
      messages: [{ role: "user" as const, content: languagePrefix + prompt }],
      max_tokens: 4000,
      temperature: 0,
      stream: false as const,
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

    // console.log("Request options:", JSON.stringify(requestOptions, null, 2));
    const completion = await this.openai.chat.completions.create(requestOptions);
    // console.log("Full completion object:", JSON.stringify(completion, null, 2));
    // console.log(completion.choices[0]?.message);

    if (!completion.choices || !completion.choices[0] || !completion.choices[0].message) {
      throw new Error("Invalid response from OpenRouter API");
    }

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error("Empty response from OpenRouter API");
    }

    if (!validator(response)) {
      throw new Error("Response validation failed");
    }

    return response;
  }
}

function validateResponse(response: string): boolean {
  try {
    JSON.parse(response);
    return true;
  } catch {
    return false;
  }
}
