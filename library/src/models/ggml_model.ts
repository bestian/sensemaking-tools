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

// Model adapter for local GGUF models served via llama-server (llama.cpp).
// llama-server exposes an OpenAI-compatible API at http://127.0.0.1:8080/v1
// Start the server with:
//   llama-server --model /path/to/model.gguf --port 8080 --ctx-size 8192

import { Model } from "./model";
import { TSchema, Static } from "@sinclair/typebox";
import { getLanguagePrefix, type SupportedLanguage } from "../../templates/l10n";

interface StreamBufferContext {
  buffer: string;
  chunks: string[];
  chunkCount: number;
  startTime: number;
  timeoutMs: number;
}

export class GgmlModel extends Model {
  private baseUrl: string;
  private modelName: string;

  /**
   * @param baseUrl  Base URL of the llama-server instance, e.g. "http://127.0.0.1:8080"
   * @param modelName Informational model name sent in requests (llama-server ignores it)
   */
  constructor(baseUrl: string = "http://127.0.0.1:8080", modelName: string = "local") {
    super(20); // smaller batch size — local models are slower
    this.baseUrl = baseUrl.replace(/\/$/, ""); // strip trailing slash
    this.modelName = modelName;
  }

  async generateText(prompt: string, output_lang: SupportedLanguage = "en"): Promise<string> {
    return await this.callLLM(prompt, () => true, undefined, output_lang);
  }

  async generateData(
    prompt: string,
    schema: TSchema,
    output_lang: SupportedLanguage = "en"
  ): Promise<Static<typeof schema>> {
    try {
      const response = await this.callLLM(prompt, validateResponse, schema, output_lang);
      if (!response) {
        throw new Error("Empty response from llama-server");
      }
      const parsed = JSON.parse(response);

      // Handle LLM wrapper formats like {"items": [...]}
      let processedData = parsed;
      console.log(`   🔍 Raw parsed response:`, JSON.stringify(parsed, null, 2));

      if (typeof parsed === "object" && parsed !== null && !Array.isArray(parsed)) {
        const wrapperKeys = ["items", "data", "result", "content", "output"];
        for (const key of wrapperKeys) {
          if (key in parsed && Array.isArray(parsed[key])) {
            console.log(`   🔧 Detected wrapped array in '${key}' key, extracting...`);
            processedData = parsed[key];
            break;
          }
        }
      }

      console.log(`   🔍 Final processed data:`, JSON.stringify(processedData, null, 2));

      if (schema && typeof schema === "object" && "type" in schema) {
        if (schema.type === "array" && !Array.isArray(processedData)) {
          throw new Error("Response format error: expected array but got " + typeof processedData);
        }
        if (
          schema.type === "object" &&
          (typeof processedData !== "object" || Array.isArray(processedData))
        ) {
          throw new Error("Response format error: expected object but got " + typeof processedData);
        }
      }

      return processedData;
    } catch (error) {
      console.error("Error in generateData:", error);
      throw error;
    }
  }

  async callLLM(
    prompt: string,
    validator: (response: string) => boolean = () => true,
    schema?: TSchema,
    output_lang: SupportedLanguage = "en",
    maxRetries: number = 3
  ): Promise<string> {
    const languagePrefix = getLanguagePrefix(output_lang);

    const requestBody: {
      model: string;
      messages: Array<{ role: "system" | "user"; content: string }>;
      max_tokens: number;
      temperature: number;
      stream: boolean;
      response_format?: {
        type: "json_schema";
        json_schema: { name: string; schema: TSchema };
      };
    } = {
      model: this.modelName,
      messages: [
        { role: "system" as const, content: languagePrefix },
        { role: "user" as const, content: prompt },
      ],
      // Keep token budget conservative for 12B models; raise via env var if needed
      max_tokens: Number(process.env.GGML_MAX_TOKENS ?? 4096),
      temperature: 0,
      stream: true,
    };

    // llama-server converts json_schema to BNF grammar internally, supporting both
    // object and array schemas — unlike json_object which forces a "{" prefix.
    if (schema) {
      requestBody.response_format = {
        type: "json_schema",
        json_schema: { name: "response", schema },
      };
    }

    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`   🔄 Attempt ${attempt}/${maxRetries}`);

        const response = await fetch(`${this.baseUrl}/v1/chat/completions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`llama-server error: ${response.status} ${response.statusText} — ${errText}`);
        }

        const streamedResponse = await this.processStreamingResponse(response);

        console.log("🔍 Streaming Response Debug Info:");
        console.log("   Response Length:", streamedResponse.length);
        console.log(
          "   Response Preview:",
          streamedResponse.substring(0, 200)
        );

        if (!validator(streamedResponse)) {
          const error = new Error(`Response validation failed on attempt ${attempt}/${maxRetries}`);
          console.error(`❌ Validation failed on attempt ${attempt}`);
          if (attempt === maxRetries) throw error;
          lastError = error;
          await this.sleep(attempt * 1000);
          continue;
        }

        console.log(`✅ Response validation passed on attempt ${attempt}`);
        return streamedResponse;
      } catch (error) {
        lastError = error as Error;
        console.error(`❌ Error in callLLM attempt ${attempt}:`, error);
        if (attempt === maxRetries) throw lastError;
        await this.sleep(attempt * 1000);
      }
    }

    throw lastError || new Error("Unexpected error in retry logic");
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private createBufferContext(): StreamBufferContext {
    return {
      buffer: "",
      chunks: [],
      chunkCount: 0,
      startTime: Date.now(),
      timeoutMs: 600000, // 10 minutes — local inference is slow
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processStreamingResponse(stream: any): Promise<string> {
    try {
      if (stream && stream.body && typeof stream.body.getReader === "function") {
        return await this.handleFetchResponse(stream);
      }
      if (stream && typeof stream[Symbol.asyncIterator] === "function") {
        return await this.handleAsyncIterable(stream);
      }
      if (Array.isArray(stream)) {
        return this.handleChunkArray(stream);
      }
      if (stream && stream.choices && stream.choices[0]) {
        const choice = stream.choices[0];
        if (choice.message?.content) return this.processStreamedResponse(choice.message.content);
        if (choice.delta?.content) return this.processStreamedResponse(choice.delta.content);
      }
      return this.processStreamedResponse(JSON.stringify(stream));
    } catch (error) {
      console.error("Error processing streaming response:", error);
      throw new Error("Failed to process streaming response");
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleAsyncIterable(stream: AsyncIterable<any>): Promise<string> {
    const context = this.createBufferContext();
    for await (const chunk of stream) {
      if (chunk?.choices?.[0]?.delta?.content) {
        context.chunks.push(chunk.choices[0].delta.content);
      }
    }
    return this.processStreamedResponse(context.chunks.join(""));
  }

  private async handleFetchResponse(response: Response): Promise<string> {
    console.log("📡 Processing llama-server SSE stream...");
    const reader = response.body?.getReader();
    if (!reader) throw new Error("Response body is not readable");

    const context = this.createBufferContext();
    const decoder = new TextDecoder();

    try {
      while (true) {
        if (Date.now() - context.startTime > context.timeoutMs) {
          console.log(`   ⏰ Timeout after ${context.timeoutMs}ms`);
          break;
        }

        const { done, value } = await reader.read();
        if (done) {
          console.log("   Stream completed, chunks:", context.chunkCount);
          break;
        }

        context.buffer += decoder.decode(value, { stream: true });
        context.chunkCount++;

        if (context.chunkCount > 100000) {
          console.log("   ⚠️ Reached maximum chunk limit, forcing completion");
          break;
        }

        let doneSignalReceived = false;
        while (true) {
          const lineEnd = context.buffer.indexOf("\n");
          if (lineEnd === -1) break;

          const line = context.buffer.slice(0, lineEnd).trim();
          context.buffer = context.buffer.slice(lineEnd + 1);

          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") {
              doneSignalReceived = true;
              break;
            }
            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) context.chunks.push(content);
            } catch {
              // ignore malformed SSE lines
            }
          }
        }

        if (doneSignalReceived) break;
      }
    } finally {
      reader.cancel();
    }

    const fullResponse = context.chunks.join("");
    console.log("   Total content length:", fullResponse.length);
    return this.processStreamedResponse(fullResponse);
  }

  private handleChunkArray(chunks: string[]): string {
    return this.processStreamedResponse(chunks.join(""));
  }

  private isMixedFormat(response: string): boolean {
    const trimmed = response.trim();
    const hasJsonBlock = /```json\s*[\s\S]*?```/g.test(trimmed);
    const hasCodeBlock = /```\s*[\s\S]*?```/g.test(trimmed);
    const hasJsonStructure = /\{[\s\S]*\}|\[[\s\S]*\]/g.test(trimmed);
    const hasNaturalLanguage = /[\u4e00-\u9fff\u3400-\u4dbf]|[a-zA-Z]{3,}/g.test(trimmed);
    if (hasNaturalLanguage && (hasJsonBlock || hasCodeBlock || hasJsonStructure)) return true;
    if (hasJsonBlock || hasCodeBlock) return true;
    return false;
  }

  private processStreamedResponse(response: string): string {
    console.log("🔧 Processing streamed response...");
    let processedResponse = response;

    processedResponse = processedResponse.replace(/\n\s*\n/g, "\n");

    if (this.isMixedFormat(processedResponse)) {
      const extracted = this.extractJsonFromMixedContent(processedResponse);
      if (extracted) return extracted;
    }

    processedResponse = this.fixIncompleteJson(processedResponse);
    return processedResponse.trim();
  }

  private extractJsonFromMixedContent(content: string): string | null {
    const jsonBlockRegex = /```json\s*([\s\S]*?)\s*```/g;
    for (const match of [...content.matchAll(jsonBlockRegex)]) {
      const candidate = match[1].trim();
      if (this.isValidJson(candidate)) return candidate;
    }
    const codeBlockRegex = /```\s*([\s\S]*?)\s*```/g;
    for (const match of [...content.matchAll(codeBlockRegex)]) {
      const candidate = match[1].trim();
      if (this.isValidJson(candidate)) return candidate;
    }
    const allMatches = [
      ...[...content.matchAll(/\{[\s\S]*\}/g)],
      ...[...content.matchAll(/\[[\s\S]*\]/g)],
    ];
    if (allMatches.length > 0) {
      const longest = allMatches.reduce((a, b) => (b[0].length > a[0].length ? b : a));
      if (this.isValidJson(longest[0])) return longest[0];
    }
    return null;
  }

  private fixIncompleteJson(response: string): string {
    try {
      JSON.parse(response);
      return response;
    } catch {
      // continue to repair
    }

    let fixed = response;

    // Fix common streaming artefacts
    fixed = fixed.replace(/\.{3,}.*$/, "");
    fixed = fixed.replace(/([^"])\s*topics\s*:/g, '$1,"topics":');
    fixed = fixed.replace(/([^"])\s*id\s*:/g, '$1,"id":');
    fixed = fixed.replace(/([^"])\s*name\s*:/g, '$1,"name":');
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    fixed = fixed.replace(/,(\s*[}\]])/g, "$1");

    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      // continue
    }

    // Balance brackets
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    if (openBraces > closeBraces) fixed += "}".repeat(openBraces - closeBraces);
    if (openBrackets > closeBrackets) fixed += "]".repeat(openBrackets - closeBrackets);

    try {
      JSON.parse(fixed);
      return fixed;
    } catch {
      return this.findLastValidJson(fixed);
    }
  }

  private findLastValidJson(response: string): string {
    const objectMatches = response.match(/\{[^{}]*\}/g);
    if (objectMatches && objectMatches.length > 0) {
      const lastObject = objectMatches[objectMatches.length - 1];
      const lastIndex = response.lastIndexOf(lastObject);
      const before = response.substring(0, lastIndex);
      const opens = (before.match(/\[/g) || []).length;
      const closes = (before.match(/\]/g) || []).length;
      if (opens > closes) {
        return response.substring(0, lastIndex + lastObject.length) + "]";
      }
    }
    if (response.trim().startsWith("[")) return response.trim() + "]";
    return response;
  }

  private isValidJson(json: string): boolean {
    try {
      JSON.parse(json);
      return true;
    } catch {
      return false;
    }
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
