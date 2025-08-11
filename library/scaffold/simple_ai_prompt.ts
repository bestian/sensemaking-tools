#!/usr/bin/env node

import OpenAI from 'openai';
import * as dotenv from 'dotenv';
import * as path from 'path';

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  // 檢查命令列參數
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.error('請提供一個 prompt 參數');
    console.error('使用方式: npx ts-node simple_ai_prompt.ts "你的問題"');
    process.exit(1);
  }

  const prompt = args[0];

  // 檢查必要的環境變數
  const apiKey = process.env.OPENROUTER_API_KEY;
  const model = process.env.OPENROUTER_MODEL;
  const baseURL = process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1';

  if (!apiKey) {
    console.error('錯誤: 未設定 OPENROUTER_API_KEY 環境變數');
    console.error('請在 library/.env 檔案中設定你的 OpenRouter API 金鑰');
    process.exit(1);
  }

  if (!model) {
    console.error('錯誤: 未設定 OPENROUTER_MODEL 環境變數');
    console.error('請在 library/.env 檔案中設定要使用的模型');
    process.exit(1);
  }

  console.log(`使用模型: ${model}`);
  console.log(`API 端點: ${baseURL}`);
  console.log(`Prompt: ${prompt}`);
  console.log('---');

  try {
    // 建立 OpenAI 客戶端
    const openai = new OpenAI({
      apiKey,
      baseURL,
    });

    // 發送請求
    const completion = await openai.chat.completions.create({
      model,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    });

    // 輸出結果

    // console.log(completion);
    
    console.log(completion.choices[0]?.message);

    const response_msg = completion.choices[0]?.message;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //console.log((response_msg as any).reasoning);

    let response_text;
    if (model.includes('gpt-oss') || 
    model === 'openai/gpt-5-chat' || 
    model === 'anthropic/claude-sonnet-4') {
      response_text = response_msg?.content;
    } else if (model === 'google/gemini-2.5-pro') {
      // 使用類型斷言來存取 reasoning 屬性
      response_text = (response_msg as OpenAI.Chat.Completions.ChatCompletionMessage & { reasoning?: string })?.reasoning || response_msg?.content;
      console.log(response_text);
    } else {
      response_text = response_msg?.content;
    }

    if (response_text) {
      console.log('AI 回應:');
      console.log(response_text);
    } else {
      console.log('未收到回應，或回應解析失敗');
    }

  } catch (error) {
    console.error('發生錯誤:');
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
    process.exit(1);
  }
}

// 執行主程式
main().catch((error) => {
  console.error('程式執行失敗:', error);
  process.exit(1);
});
