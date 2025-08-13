#!/usr/bin/env node

import * as dotenv from 'dotenv';
import * as path from 'path';
import { OpenRouterModel } from '../src/models/openrouter_model';
import { Type } from '@sinclair/typebox';

// 載入環境變數
dotenv.config({ path: path.join(__dirname, '../../.env') });

// 定義測試用的 JSON Schema
const TEST_SCHEMA = Type.Object({
  summary: Type.String({ description: "總結內容" }),
  topics: Type.Array(Type.String(), { description: "主題列表" }),
  sentiment: Type.Union([
    Type.Literal("positive"),
    Type.Literal("negative"),
    Type.Literal("neutral")
  ], { description: "情感傾向" })
});

async function debugOpenRouterModel() {
  console.log('=== OpenRouter 模型調試測試 ===\n');

  try {
    // 檢查環境變數
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('❌ 錯誤: 未設定 OPENROUTER_API_KEY 環境變數');
      console.error('請在 library/.env 檔案中設定你的 OpenRouter API 金鑰');
      return;
    }

    const model = process.env.OPENROUTER_MODEL || 'openai/gpt-4o';
    console.log(`✅ 使用模型: ${model}`);
    console.log(`✅ API 金鑰: ${apiKey.substring(0, 8)}...\n`);

    // 創建模型實例
    console.log('1. 創建 OpenRouter 模型實例...');
    console.log('   正在初始化 OpenAI 客戶端...');
    
    const openRouterModel = new OpenRouterModel(apiKey, model);
    console.log('✅ 模型創建成功\n');

    // 測試文字生成
    console.log('2. 測試文字生成...');
    const textPrompt = "請用一句話描述人工智慧的優點";
    console.log(`問題: ${textPrompt}`);
    console.log('   正在發送請求到 OpenRouter...');
    
    const startTime = Date.now();
    const response = await openRouterModel.generateText(textPrompt);
    const endTime = Date.now();
    
    console.log(`回答: ${response}`);
    console.log(`   回應時間: ${endTime - startTime}ms\n`);

    // 測試結構化資料生成
    console.log('3. 測試結構化資料生成...');
    const dataPrompt = `
請分析以下評論的情感傾向和主題：

評論內容：
"這個產品真的很棒，使用起來非常方便，界面設計也很美觀。我特別喜歡它的功能設計，完全符合我的需求。"

請提供總結、主題列表和情感傾向。
    `;
    
    console.log(`問題: ${dataPrompt.trim()}`);
    console.log('   正在發送結構化輸出請求...');
    console.log('   使用 Schema:', JSON.stringify(TEST_SCHEMA, null, 2));
    
    const dataStartTime = Date.now();
    const structuredData = await openRouterModel.generateData(dataPrompt, TEST_SCHEMA);
    const dataEndTime = Date.now();
    
    console.log('結構化回答:');
    console.log(JSON.stringify(structuredData, null, 2));
    console.log(`   回應時間: ${dataEndTime - dataStartTime}ms\n`);

    // 測試不同模型
    console.log('4. 測試不同模型...');
    const claudeModel = new OpenRouterModel(apiKey, 'anthropic/claude-3.5-sonnet');
    console.log('   正在測試 Claude 模型...');
    
    const claudeStartTime = Date.now();
    const claudeResponse = await claudeModel.generateText("請用一句話描述 Claude 模型的特點");
    const claudeEndTime = Date.now();
    
    console.log(`Claude 回答: ${claudeResponse}`);
    console.log(`   Claude 回應時間: ${claudeEndTime - claudeStartTime}ms\n`);

    // 測試錯誤處理
    console.log('5. 測試錯誤處理...');
    try {
      console.log('   測試無效的 API 金鑰...');
      const invalidModel = new OpenRouterModel('invalid_key', 'openai/gpt-4o');
      await invalidModel.generateText("測試");
    } catch (error) {
      console.log(`✅ 正確捕獲錯誤: ${error instanceof Error ? error.message : error}`);
    }

    console.log('\n=== 調試測試完成 ===');
    console.log('✅ OpenRouter 模型實作正常工作！');
    console.log('\n📊 性能摘要:');
    console.log(`- 文字生成: ${endTime - startTime}ms`);
    console.log(`- 結構化輸出: ${dataEndTime - dataStartTime}ms`);
    console.log(`- Claude 模型: ${claudeEndTime - claudeStartTime}ms`);

  } catch (error) {
    console.error('❌ 調試測試失敗:');
    if (error instanceof Error) {
      console.error('錯誤類型:', error.constructor.name);
      console.error('錯誤訊息:', error.message);
      console.error('錯誤堆疊:', error.stack);
      
      if (error.message.includes('OPENROUTER_API_KEY')) {
        console.error('\n💡 解決方案:');
        console.error('1. 在 library/.env 檔案中設定 OPENROUTER_API_KEY');
        console.error('2. 從 https://openrouter.ai/ 獲取 API 金鑰');
      } else if (error.message.includes('fetch') || error.message.includes('network')) {
        console.error('\n💡 網路問題，請檢查:');
        console.error('1. 網路連線是否正常');
        console.error('2. API 金鑰是否有效');
        console.error('3. 是否達到 API 使用限制');
      } else if (error.message.includes('structured output') || error.message.includes('json_schema')) {
        console.error('\n💡 結構化輸出問題:');
        console.error('1. 此模型可能不支援結構化輸出');
        console.error('2. 請嘗試使用支援的模型，如:');
        console.error('   - openai/gpt-4o');
        console.error('   - anthropic/claude-3.5-sonnet');
        console.error('   - google/gemini-pro');
      }
    } else {
      console.error('未知錯誤:', error);
    }
  }
}

// 執行調試測試
if (require.main === module) {
  debugOpenRouterModel().catch((error) => {
    console.error('程式執行失敗:', error);
    process.exit(1);
  });
}
