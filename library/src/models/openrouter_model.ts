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
    return await this.callLLM(prompt, () => true, undefined, output_lang);
  }

  async generateData(prompt: string, schema: TSchema, output_lang: SupportedLanguage = "en"): Promise<Static<typeof schema>> {
    try {
      const response = await this.callLLM(prompt, validateResponse, schema, output_lang);
      if (!response) {
        throw new Error("Empty response from OpenRouter API");
      }
      const parsed = JSON.parse(response);
      
      // 添加額外的驗證
      if (schema && Array.isArray(schema)) {
        // 如果 schema 是數組類型，確保回應也是數組
        if (!Array.isArray(parsed)) {
          console.error('Schema expects array but response is not array:', typeof parsed, parsed);
          throw new Error('Response format error: expected array but got ' + typeof parsed);
        }
      }
      
      return parsed;
    } catch (error) {
      console.error('Error in generateData:', error);
      throw error;
    }
  }

  async callLLM(prompt: string, validator: (response: string) => boolean = () => true, schema?: TSchema, output_lang: SupportedLanguage = "en"): Promise<string> {
    // Get language prefix from localization system
    const languagePrefix = getLanguagePrefix(output_lang);
    
    const requestBody = {
      model: this.modelName,
      messages: [{ role: "user" as const, content: languagePrefix + prompt }],
      max_tokens: 4000,
      temperature: 0,
      stream: true,
      n: 1,
      stop: null,
      presence_penalty: 0,
      frequency_penalty: 0,
    };
    
    // 如果有 schema，設定結構化輸出
    if (schema) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (requestBody as any).response_format = {
        type: "json_schema",
        json_schema: {
          name: "response",
          strict: true,
          schema: schema
        }
      };
    }

    // 使用 fetch API 發送 streaming 請求
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openai.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://github.com/your-repo',
        'X-Title': 'Your App Name',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    // 處理 streaming 回應
    const streamedResponse = await this.processStreamingResponse(response);
    
    // 在驗證前記錄詳細資訊
    console.log('🔍 Streaming Response Debug Info:');
    console.log('   Original Response Length:', streamedResponse.length);
    console.log('   Response Preview (first 200 chars):', streamedResponse.substring(0, 200));
    console.log('   Response Preview (last 200 chars):', streamedResponse.substring(Math.max(0, streamedResponse.length - 200)));
    console.log('   Full Response:', streamedResponse);
    
    // 在最後整併完成後進行驗證
    if (!validator(streamedResponse)) {
      console.error('❌ Response validation failed!');
      console.error('   Validator function:', validator.toString());
      console.error('   Response that failed validation:', streamedResponse);
      throw new Error("Response validation failed after streaming completion");
    }
    
    console.log('✅ Response validation passed successfully');
    return streamedResponse;
  }

  /**
   * 處理 streaming 回應 - 支援 OpenRouter 的 SSE 格式
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async processStreamingResponse(stream: any): Promise<string> {
    try {
      // 檢查是否是 Response 物件 (fetch API 回應)
      if (stream && stream.body && typeof stream.body.getReader === 'function') {
        return await this.handleFetchResponse(stream);
      }
      
      // 檢查是否是 AsyncIterable (OpenAI SDK streaming 格式)
      if (stream && typeof stream[Symbol.asyncIterator] === 'function') {
        return await this.handleAsyncIterable(stream);
      }
      
      // 檢查是否是陣列格式的 chunks
      if (Array.isArray(stream)) {
        return this.handleChunkArray(stream);
      }
      
      // 檢查是否是單一回應物件
      if (stream && stream.choices && stream.choices[0]) {
        const choice = stream.choices[0];
        if (choice.message && choice.message.content) {
          return this.processStreamedResponse(choice.message.content);
        }
        if (choice.delta && choice.delta.content) {
          return this.processStreamedResponse(choice.delta.content);
        }
      }
      
      // 如果都無法處理，嘗試直接提取內容
      const response = JSON.stringify(stream);
      console.warn("Unable to parse streaming response, using raw content:", response);
      return this.processStreamedResponse(response);
      
    } catch (error) {
      console.error('Error processing streaming response:', error);
      throw new Error('Failed to process streaming response');
    }
  }

  /**
   * 處理 AsyncIterable (OpenAI SDK streaming 格式)
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async handleAsyncIterable(stream: AsyncIterable<any>): Promise<string> {
    const chunks: string[] = [];
    
    try {
      for await (const chunk of stream) {
        if (chunk && chunk.choices && chunk.choices[0]) {
          const choice = chunk.choices[0];
          if (choice.delta && choice.delta.content) {
            chunks.push(choice.delta.content);
          }
        }
      }
    } catch (error) {
      console.error('Error processing async iterable stream:', error);
      throw error;
    }
    
    const fullResponse = chunks.join('');
    return this.processStreamedResponse(fullResponse);
  }

  /**
   * 處理 fetch API 回應 (OpenRouter 官網推薦方式)
   */
  private async handleFetchResponse(response: Response): Promise<string> {
    console.log('📡 Starting fetch API streaming response processing...');
    
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Response body is not readable');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    const chunks: string[] = [];
    let chunkCount = 0;
    
    // 添加超時機制
    const timeoutMs = 30000; // 30 秒超時
    const startTime = Date.now();

    try {
      while (true) {
        // 檢查超時
        if (Date.now() - startTime > timeoutMs) {
          console.log(`   ⏰ Timeout after ${timeoutMs}ms, forcing stream completion`);
          break;
        }
        
        const { done, value } = await reader.read();
        if (done) {
          console.log('   Stream completed, total chunks received:', chunkCount);
          break;
        }

        // Append new chunk to buffer
        const decodedChunk = decoder.decode(value, { stream: true });
        buffer += decodedChunk;
        chunkCount++;
        
        // 限制 chunk 數量，防止無限循環
        if (chunkCount > 1000) {
          console.log('   ⚠️ Reached maximum chunk limit (1000), forcing completion');
          break;
        }
        
        console.log(`   Received chunk ${chunkCount}, buffer size: ${buffer.length}`);

        // Process complete lines from buffer
        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('   Received [DONE] signal');
              return this.processStreamedResponse(chunks.join(''));
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                chunks.push(content);
                console.log(`   Extracted content chunk: "${content}"`);
              }
            } catch (e) {
              // Ignore invalid JSON
              console.warn('   Invalid JSON in streaming response:', e, 'Line:', line);
            }
          }
        }
      }
    } finally {
      reader.cancel();
      console.log('   Reader cancelled');
    }

    const fullResponse = chunks.join('');
    console.log('   Total content length:', fullResponse.length);
    console.log('   Number of content chunks:', chunkCount);
    
    return this.processStreamedResponse(fullResponse);
  }

  /**
   * 處理陣列格式的 chunks
   */
  private handleChunkArray(chunks: string[]): string {
    const fullResponse = chunks.join('');
    return this.processStreamedResponse(fullResponse);
  }

  /**
   * 處理可能的 streaming 回應，嘗試修復不完整的回應
   */
  private processStreamedResponse(response: string): string {
    console.log('🔧 Processing streamed response...');
    console.log('   Original length:', response.length);
    console.log('   Original content:', response);
    
    let processedResponse = response;

    // 移除 OpenRouter 的處理註釋
    const beforeProcessing = processedResponse;
    processedResponse = processedResponse.replace(/: OPENROUTER PROCESSING/g, '');
    if (beforeProcessing !== processedResponse) {
      console.log('   Removed OPENROUTER PROCESSING comments');
    }
    
    // 移除多餘的空白行
    processedResponse = processedResponse.replace(/\n\s*\n/g, '\n');
    
    // 檢查並修復 JSON 完整性
    processedResponse = this.fixIncompleteJson(processedResponse);
    
    const finalResponse = processedResponse.trim();
    console.log('   Final processed length:', finalResponse.length);
    console.log('   Final processed content:', finalResponse);
    
    return finalResponse;
  }

  /**
   * 修復不完整的 JSON
   */
  private fixIncompleteJson(response: string): string {
    let fixedResponse = response;
    
    // 如果回應看起來像是不完整的 JSON，嘗試修復
    if (fixedResponse.includes('{') && !fixedResponse.trim().endsWith('}')) {
      // 計算開頭和結尾的大括號數量
      const openBraces = (fixedResponse.match(/\{/g) || []).length;
      const closeBraces = (fixedResponse.match(/\}/g) || []).length;
      
      if (openBraces > closeBraces) {
        // 添加缺少的大括號
        const missingBraces = openBraces - closeBraces;
        fixedResponse = fixedResponse + '}'.repeat(missingBraces);
        console.log(`   Fixed incomplete JSON by adding ${missingBraces} missing closing braces`);
      }
    }
    
    // 如果回應看起來像是不完整的陣列，嘗試修復
    if (fixedResponse.includes('[') && !fixedResponse.trim().endsWith(']')) {
      // 計算開頭和結尾的方括號數量
      const openBrackets = (fixedResponse.match(/\[/g) || []).length;
      const closeBrackets = (fixedResponse.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        // 添加缺少的方括號
        const missingBrackets = openBrackets - closeBrackets;
        fixedResponse = fixedResponse + ']'.repeat(missingBrackets);
        console.log(`   Fixed incomplete array by adding ${missingBrackets} missing closing brackets`);
      }
    }

    // 移除尾部的省略號和不完整內容
    const beforeEllipsis = fixedResponse;
    fixedResponse = fixedResponse.replace(/\.{3,}.*$/, '');
    if (beforeEllipsis !== fixedResponse) {
      console.log('   Removed trailing ellipsis and incomplete content');
    }
    
    // 驗證修復後的 JSON 是否有效
    try {
      JSON.parse(fixedResponse);
      console.log('   ✅ JSON validation passed after fixing');
    } catch {
      console.log('   ❌ JSON validation failed after fixing, attempting additional repairs...');
      
      // 如果還是無效，嘗試更激進的修復
      fixedResponse = this.aggressiveJsonFix(fixedResponse);
    }
    
    return fixedResponse;
  }

  /**
   * 激進的 JSON 修復
   */
  private aggressiveJsonFix(response: string): string {
    let fixedResponse = response;
    
    // 尋找最後一個完整的物件或陣列
    let lastValidIndex = -1;
    
    // 尋找最後一個完整的物件
    const lastObjectMatch = fixedResponse.match(/\{[^{}]*\}/g);
    if (lastObjectMatch && lastObjectMatch.length > 0) {
      const lastObject = lastObjectMatch[lastObjectMatch.length - 1];
      lastValidIndex = fixedResponse.lastIndexOf(lastObject) + lastObject.length;
    }
    
    // 尋找最後一個完整的陣列
    const lastArrayMatch = fixedResponse.match(/\[[^\[\]]*\]/g);
    if (lastArrayMatch && lastArrayMatch.length > 0) {
      const lastArray = lastArrayMatch[lastArrayMatch.length - 1];
      const arrayIndex = fixedResponse.lastIndexOf(lastArray) + lastArray.length;
      if (arrayIndex > lastValidIndex) {
        lastValidIndex = arrayIndex;
      }
    }
    
    if (lastValidIndex > 0) {
      // 截斷到最後一個完整的位置
      const beforeTruncate = fixedResponse;
      fixedResponse = fixedResponse.substring(0, lastValidIndex);
      
      // 根據開頭決定如何結尾
      if (fixedResponse.startsWith('[')) {
        if (!fixedResponse.endsWith(']')) {
          fixedResponse += ']';
        }
      } else if (fixedResponse.startsWith('{')) {
        if (!fixedResponse.endsWith('}')) {
          fixedResponse += '}';
        }
      }
      
      console.log('   Applied aggressive JSON fix by truncating at last valid position');
      console.log('   Before aggressive fix:', beforeTruncate);
      console.log('   After aggressive fix:', fixedResponse);
    }
    
    return fixedResponse;
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
