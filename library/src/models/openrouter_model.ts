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
    const timeoutMs = 300000; // 5 分鐘超時
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
        if (chunkCount > 100000) {
          console.log('   ⚠️ Reached maximum chunk limit (100000), forcing completion');
          break;
        }
        
        console.log(`   Received chunk ${chunkCount}, buffer size: ${buffer.length}`);

        // Process complete lines from buffer
        let doneSignalReceived = false;
        while (true) {
          const lineEnd = buffer.indexOf('\n');
          if (lineEnd === -1) break;

          const line = buffer.slice(0, lineEnd).trim();
          buffer = buffer.slice(lineEnd + 1);

          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              console.log('   Received [DONE] signal');
              doneSignalReceived = true;
              // 不要立即返回，繼續處理 buffer 中剩餘的內容
              break;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices ? parsed.choices[0]?.delta?.content : parsed.content;
              if (content) {
                chunks.push(content);
                console.log(`   Extracted content chunk: "${content}"`);
              } else {
                console.log('   No content found in parsed data');
              }
            } catch (e) {
              // Ignore invalid JSON
              console.warn('   Invalid JSON in streaming response:', e, 'Line:', line);
            }
          }
        }
        
        // 如果收到 [DONE] 信號，處理完 buffer 中剩餘的內容後退出主循環
        if (doneSignalReceived) {
          // 處理 buffer 中剩餘的內容
          if (buffer.length > 0) {
            console.log(`   Processing remaining buffer content (${buffer.length} chars): "${buffer}"`);
            // 嘗試解析剩餘的 buffer 內容
            try {
              const parsed = JSON.parse(buffer);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                chunks.push(content);
                console.log(`   Extracted final content chunk: "${content}"`);
              }
            } catch {
              console.log('   Remaining buffer is not valid JSON, skipping');
            }
          }
          break;
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
   * 修復不完整的 JSON - 更智能的版本
   */
  private fixIncompleteJson(response: string): string {
    let fixedResponse = response;
    
    console.log('   🔧 Starting JSON repair process...');
    
    // 首先嘗試直接解析，如果成功就直接返回
    try {
      JSON.parse(fixedResponse);
      console.log('   ✅ JSON is already valid, no repair needed');
      return fixedResponse;
    } catch {
      console.log('   ❌ JSON validation failed, starting repair...');
    }
    
    // 修復常見的 streaming 問題
    fixedResponse = this.fixStreamingIssues(fixedResponse);
    
    // 嘗試解析修復後的內容
    try {
      JSON.parse(fixedResponse);
      console.log('   ✅ JSON validation passed after streaming fixes');
      return fixedResponse;
    } catch {
      console.log('   ❌ Still invalid after streaming fixes, attempting structural repair...');
    }
    
    // 進行結構性修復
    fixedResponse = this.fixStructuralIssues(fixedResponse);
    
    // 最終驗證
    try {
      JSON.parse(fixedResponse);
      console.log('   ✅ JSON validation passed after structural repair');
      return fixedResponse;
    } catch (error) {
      console.log('   ❌ JSON validation failed after all repair attempts');
      console.log('   Final repair attempt failed:', error);
      
      // 最後的嘗試：找到最後一個完整的 JSON 結構
      return this.findLastValidJson(fixedResponse);
    }
  }
  
  /**
   * 修復 streaming 相關的問題
   */
  private fixStreamingIssues(response: string): string {
    let fixed = response;
    
    // 移除尾部的省略號和不完整內容
    fixed = fixed.replace(/\.{3,}.*$/, '');
    
    // 修復常見的格式錯誤
    fixed = fixed.replace(/([^"])\s*topics\s*:/g, '$1,"topics":'); // 修復缺少逗號的 topics
    fixed = fixed.replace(/([^"])\s*id\s*:/g, '$1,"id":'); // 修復缺少逗號的 id
    fixed = fixed.replace(/([^"])\s*name\s*:/g, '$1,"name":'); // 修復缺少逗號的 name
    
    // 修復缺少引號的屬性名
    fixed = fixed.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)\s*:/g, '$1"$2":');
    
    // 修復缺少引號的字符串值
    fixed = fixed.replace(/:\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*([,}])/g, ':"$1"$2');
    
    // 移除多餘的逗號
    fixed = fixed.replace(/,(\s*[}\]])/g, '$1');
    
    console.log('   Applied streaming-specific fixes');
    return fixed;
  }
  
  /**
   * 修復結構性問題
   */
  private fixStructuralIssues(response: string): string {
    let fixed = response;
    
    // 計算括號平衡
    const openBraces = (fixed.match(/\{/g) || []).length;
    const closeBraces = (fixed.match(/\}/g) || []).length;
    const openBrackets = (fixed.match(/\[/g) || []).length;
    const closeBrackets = (fixed.match(/\]/g) || []).length;
    
    console.log(`   Bracket analysis: {${openBraces}:${closeBraces}}, [${openBrackets}:${closeBrackets}]`);
    
    // 修復大括號不平衡
    if (openBraces > closeBraces) {
      const missingBraces = openBraces - closeBraces;
      fixed = fixed + '}'.repeat(missingBraces);
      console.log(`   Fixed braces: added ${missingBraces} closing braces`);
    }
    
    // 修復方括號不平衡
    if (openBrackets > closeBrackets) {
      const missingBrackets = openBrackets - closeBrackets;
      fixed = fixed + ']'.repeat(missingBrackets);
      console.log(`   Fixed brackets: added ${missingBrackets} closing brackets`);
    }
    
    return fixed;
  }
  
  /**
   * 找到最後一個有效的 JSON 結構
   */
  private findLastValidJson(response: string): string {
    console.log('   🔍 Searching for last valid JSON structure...');
    
    // 尋找最後一個完整的物件
    const objectMatches = response.match(/\{[^{}]*\}/g);
    if (objectMatches && objectMatches.length > 0) {
      const lastObject = objectMatches[objectMatches.length - 1];
      const lastObjectIndex = response.lastIndexOf(lastObject);
      
      // 檢查這個物件是否在陣列中
      const beforeObject = response.substring(0, lastObjectIndex);
      const openBrackets = (beforeObject.match(/\[/g) || []).length;
      const closeBrackets = (beforeObject.match(/\]/g) || []).length;
      
      if (openBrackets > closeBrackets) {
        // 物件在陣列中，需要補上陣列結尾
        const result = response.substring(0, lastObjectIndex + lastObject.length) + ']';
        console.log('   Found last valid object in array, truncating there');
        return result;
      }
    }
    
    // 如果沒有找到完整物件，嘗試找到最後一個完整的陣列
    const arrayMatches = response.match(/\[[^\[\]]*\]/g);
    if (arrayMatches && arrayMatches.length > 0) {
      const lastArray = arrayMatches[arrayMatches.length - 1];
      const lastArrayIndex = response.lastIndexOf(lastArray);
      const result = response.substring(0, lastArrayIndex + lastArray.length);
      console.log('   Found last valid array, truncating there');
      return result;
    }
    
    // 最後的嘗試：如果開頭是陣列，至少補上結尾
    if (response.trim().startsWith('[')) {
      const result = response.trim() + ']';
      console.log('   Array starts but never ends, adding closing bracket');
      return result;
    }
    
    // 如果都失敗了，返回原始內容
    console.log('   Could not find valid JSON structure, returning original');
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
