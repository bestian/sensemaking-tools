# OpenRouter 模型使用說明

## 概述

OpenRouter 模型是 Vertex AI 模型的替代方案，使用 OpenRouter API 來存取各種 AI 模型。

## 檔案結構

```
library/src/models/
├── openrouter_model.ts          # OpenRouter 模型實作
├── openrouter_model.test.ts     # 測試檔案 (目前有 Mock 問題)
└── model.ts                     # 抽象 Model 介面

library/scaffold/
└── openrouter_simple_test.ts    # 簡單測試腳本
```

## 快速開始

### 1. 設定環境變數

在 `library` 目錄下創建 `.env` 檔案：

```bash
# OpenRouter 設定
OPENROUTER_API_KEY=your_openrouter_api_key_here
OPENROUTER_MODEL=openai/gpt-5-chat
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_OPENROUTER_PARALLELISM=2
```

### 2. 安裝依賴

```bash
cd library
npm install
```

### 3. 運行簡單測試

```bash
npx ts-node scaffold/openrouter_simple_test.ts
```

## 使用方法

### 基本使用

```typescript
import { OpenRouterModel } from './src/models/openrouter_model';

// 直接創建實例
const model = new OpenRouterModel(
  'your_api_key',
  'openai/gpt-oss-120b'
);

// 文字生成
const response = await model.generateText("請總結以下內容...");
```

### 從環境變數創建

```typescript
import { createOpenRouterModelFromEnv } from './src/models/openrouter_model';

const model = createOpenRouterModelFromEnv();
const response = await model.generateText("測試問題");
```

### 結構化資料生成

```typescript
import { Type } from '@sinclair/typebox';

const schema = Type.Object({
  summary: Type.String(),
  topics: Type.Array(Type.String())
});

const data = await model.generateData("請分析以下評論...", schema);
```

## 支援的模型

以下模型支援 JSON Schema 結構化輸出：

- `openai/gpt-4o` (推薦)
- `openai/gpt-4o-mini`
- `anthropic/claude-3.5-sonnet` (推薦)
- `google/gemini-pro`

## 與 Vertex AI 的差異

| 特性 | Vertex AI | OpenRouter |
|------|-----------|------------|
| 模型選擇 | 僅限 Google 模型 | 多廠商模型 |
| 結構化輸出 | 原生支援 | 部分模型支援 |
| 成本 | 按 Google 定價 | 按各廠商定價 |
| 設定複雜度 | 需要 GCP 專案 | 僅需 API 金鑰 |

## 故障排除

### 1. API 金鑰錯誤
- 確保 `OPENROUTER_API_KEY` 已正確設定
- 從 https://openrouter.ai/ 獲取有效的 API 金鑰

### 2. 模型不支援結構化輸出
- 使用支援的模型 (如 gpt-4o, claude-3.5-sonnet)
- 或改用 `generateText` 方法

### 3. 網路問題
- 檢查網路連線
- 確認 API 端點是否可達
- 檢查是否達到 API 使用限制

## 開發注意事項

### 測試問題
目前的 Jest 測試有 Mock 設定問題，建議使用 `openrouter_simple_test.ts` 進行手動測試。

### 類型安全
模型完全支援 TypeScript 類型檢查，使用 TypeBox 進行 Schema 驗證。

### 錯誤處理
包含完整的錯誤處理和重試機制，與原有的 Vertex AI 模型行為一致。

## 下一步

1. 設定環境變數
2. 運行簡單測試腳本
3. 整合到現有專案中
4. 根據需要調整並發設定
