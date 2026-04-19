# **[Sensemaker](https://github.com/Jigsaw-Code/sensemaking-tools)（由 Jigsaw 開發）—— Google AI 概念驗證專案**

本專案分享由 [Jigsaw](http://jigsaw.google.com) 開發的工具，作為概念驗證，協助理解大規模線上對話。它展示了如何運用 Gemini 等大型語言模型（LLM）來完成此類任務。本函式庫提供 Jigsaw 在分類、摘要，以及識別複雜文本中共識與分歧方面的透明方法。我們分享此成果，目的是啟發他人，並為面臨類似挑戰的開發者提供潛在的起點或實用元素。

---

## **NPM 套件使用方式（Cloudflare Workers）**

本函式庫現已提供 npm 套件，針對 Cloudflare Workers 環境進行優化，可直接在 Cloudflare Workers 專案中使用。

### **安裝**

2025-08-27 版本的套件（注意：本穩定版本並不是最新版）可從 GitHub Releases 取得，請從發布的壓縮包安裝：

```bash
# 從 GitHub Release 下載並安裝
npm install https://github.com/bestian/sensemaking-tools/releases/download/v1.0.2/sensemaking-tools-1.0.2.tgz
```

或下載 `.tgz` 檔案後本機安裝：

```bash
# 下載壓縮包
wget https://github.com/bestian/sensemaking-tools/releases/download/v1.0.2/sensemaking-tools-1.0.2.tgz

# 從本機檔案安裝
npm install ./sensemaking-tools-1.0.2.tgz
```

**注意**：此為暫時性安裝方式，套件未來將發布至 npm。

### **在 Cloudflare Workers 中快速開始**

```typescript
import { Sensemaker, OpenRouterModel } from 'sensemaking-tools';

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 設定模型——使用 OpenRouter 最為便捷
    const modelSettings = {
      defaultModel: new OpenRouterModel({
        apiKey: env.OPENROUTER_API_KEY,
        baseUrl: env.OPENROUTER_BASE_URL,
        model: env.OPENROUTER_MODEL
      })
    };

    // 建立 Sensemaker 實例
    const sensemaker = new Sensemaker(modelSettings);

    // 範例：從請求主體分析留言
    const { comments } = await request.json();

    // 依主題分類留言
    const categorizedComments = await sensemaker.categorizeComments(comments);

    // 產生摘要
    const summary = await sensemaker.summarize(
      categorizedComments,
      'AGGREGATE_VOTE'
    );

    return new Response(JSON.stringify(summary), {
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### **可用的匯出項目**

```typescript
// 核心類別
import { Sensemaker } from 'sensemaking-tools';

// 模型實作
import { VertexModel, OpenRouterModel } from 'sensemaking-tools';

// 型別與工具函式
import { Comment, Topic, Summary, SummarizationType } from 'sensemaking-tools';
```

### **建置正式版本**

```bash
npm run build:worker
```

此指令會在 `dist/` 目錄產生優化後的 JavaScript 檔案。

---

## **概述**

有效理解大規模公眾意見是一項重大挑戰，傳統方法難以將數千條多元意見轉化為可執行的洞見。Sensemaker 展示了如何運用 Google 的 Gemini 模型，將大量原始社群回饋轉化為清晰易懂的洞見，協助分析這些複雜的討論。

本工具集展示的方法包括：

* **主題識別**——識別討論中的主要議題。細緻程度可設定，工具可發現：僅頂層主題、主題與子主題，或最深層次的主題、子主題與主題群（子子主題）。
* **陳述分類**——將陳述歸類至使用者定義的主題，或由主題識別功能產生的主題。陳述可屬於多個主題。
* **摘要生成**——分析陳述與投票資料，輸出對話摘要，包含概覽、討論主題，以及共識與分歧之處。

這些方法已應用於 [Jigsaw 在肯塔基州保齡綠市的案例研究](https://medium.com/jigsaw/how-one-of-the-fastest-growing-cities-in-kentucky-used-ai-to-plan-for-the-next-25-years-3b70c4fd1412)，分析一場美國大型數位公民對話。

請參閱[說明文件](https://jigsaw-code.github.io/sensemaking-tools/docs/)以了解所有可用方法與型別的完整說明。

---

# 我們的方法

本工具集展示了 Jigsaw 如何將 AI 與 Google 的 Gemini 應用於新興的「sensemaking」領域。此為實驗方法的分享，旨在提供洞見。雖然本函式庫的部分內容可適用於其他專案，但開發者應預期需要針對自身使用情境進行實作、客製化與持續維護。

---

# **運作原理**

## **主題識別**

Sensemaker 提供識別留言中所含主題的選項，彈性設定可學習的內容：

* 頂層主題
* 頂層主題與子主題
* 在指定頂層主題的前提下，僅取得子主題

主題識別程式碼位於 [library/src/tasks/topic\_modeling.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/src/tasks/topic_modeling.ts)。

## **陳述分類**

分類功能將陳述指派至一個或多個主題與子主題，這些主題可由使用者提供，或由上述「主題識別」方法產生。

主題以批次方式指派至陳述，要求模型針對每條陳述回傳適當的類別，並利用 Vertex API 的約束解碼功能，依預先定義的 JSON schema 結構化輸出，以避免輸出格式問題。此外，加入了錯誤處理機制，在指派失敗時自動重試。

陳述分類程式碼位於 [library/src/tasks/categorization.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/src/tasks/categorization.ts)。

## **摘要生成**

摘要以敘事報告形式輸出，但建議使用者依據自身資料需求挑選合適的元素（請參考 runner 中的[範例](https://github.com/Jigsaw-Code/sensemaking-tools/blob/521dd0c4c2039f0ceb7c728653a9ea495eb2c8e9/runner-cli/runner.ts#L54)），並考慮將摘要搭配視覺化呈現（更多相關工具即將推出）。

摘要程式碼位於 [library/src/tasks/summarization.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/src/tasks/summarization.ts)。

### **引言區塊**

包含一份簡短的條列清單，列出摘要中的陳述數量、投票數、主題與子主題數量。

### **概覽區塊**

概覽區塊彙整所有子主題的「主題群」區塊，以及為每個頂層主題產生的摘要（這些摘要作為中間步驟產生，不直接呈現給使用者，可視為整體遞迴摘要方法中的「思維鏈」中間步驟）。

目前概覽不參照下文的「共識」與「意見分歧」區塊。

概覽中的百分比（例如「藝術與文化（17%）」）表示屬於該主題的陳述比例。由於陳述可被分類至多個主題，這些百分比加總會超過 100%。

### **前 5 大子主題**

Sensemaker 依陳述數量選取前 5 個子主題，並簡潔地摘要這些子主題中的關鍵主題群。這些主題群比後續摘要中出現的內容更為精簡，作為快速概覽之用。

### **主題與子主題區塊**

運用「主題識別」與「陳述分類」功能產生的主題與子主題，為每個子主題（若無子主題則為主題）產生簡短摘要。

對於每個子主題，Sensemaker 呈現：

* 指派至該子主題的陳述數量。
* 突出的主題群。
* 根據同意與不同意率，呈現「共識」與「意見分歧」最高的陳述摘要。
* 與平均子主題相比，該子主題的相對共識程度，基於有多少留言落入「共識」與「意見分歧」類別。

#### **主題群**

對於每個子主題，Sensemaker 識別出至多 5 個跨陳述的主題群，並為每個主題群撰寫簡短描述。此區塊考慮所有指派至該子主題的陳述。

識別主題群時，Sensemaker 利用陳述文字而非投票資訊，並嘗試在呈現主題群時兼顧不同觀點。

#### **共識與意見分歧**

在摘要子主題的「共識」與「意見分歧」時，Sensemaker 彙整依據同意、不同意與略過投票數計算的統計數據，從中抽取陳述樣本。對於每個區塊，Sensemaker 選取共識與分歧訊號最為明確的陳述，不使用任何文字分析（分類除外），僅考慮投票資訊。

由於小樣本（投票數少）可能產生誤導，總投票數少於 20 票的陳述不予納入。這可避免例如某陳述僅有 2 票贊成，被誤認為廣泛支持的情況，因為更多投票後可能顯示支持度相對偏低（或存在顯著的意見分歧）。

此區塊提供基礎引用，顯示 LLM 參考了哪些陳述，並讓讀者可以核實原始文字與投票數。

#### **相對共識程度**

每個子主題被標記為「高」、「中高」、「中低」或「低」共識。其計算方式為：針對每個子主題，取得所有符合共識留言條件的留言，並根據該子主題的留言數進行標準化，再與各子主題相互比較。

---

### **多語言支援**

Sensemaker 透過 `output_lang` 參數支援以多種語言產生摘要。函式庫為所有支援的語言提供本地化提示詞與標籤，確保跨語系的輸出品質一致。

#### **支援語言**

1. **英文（en）**——預設語言
2. **正體中文（zh-TW）**——台灣繁體中文
3. **簡體中文（zh-CN）**——中國大陸簡體中文
4. **法文（fr）**
5. **西班牙文（es）**
6. **日文（ja）**

#### **實作方式**

多語言支援透過以下方式實作：

- **本地化提示詞**：所有摘要使用的提示詞均已翻譯，儲存於 `library/templates/l10n/prompts.ts`
- **標籤翻譯**：相對共識與參與度標籤（例如「低一致性」、「中低一致性」）會依所選語言自動翻譯
- **內容翻譯**：當 `output_lang` 不為 `en` 時，報告中的「Other」關鍵字會自動替換為對應的本地化詞彙

#### **使用方式**

呼叫摘要函式時指定輸出語言：

```typescript
const summary = await sensemaker.summarize(
  comments,
  SummarizationType.AGGREGATE_VOTE,
  topics,
  additionalContext,
  "zh-TW" // 輸出語言
);
```

或在 CLI 工具中使用 `--output_lang` 參數：

```bash
npx ts-node ./library/runner-cli/runner_openrouter.ts \
  --outputBasename out \
  --inputFile "./files/comments.csv" \
  --additionalContext "對話描述" \
  --output_lang zh-TW
```

#### **技術特性**

- **型別安全**：使用 `SupportedLanguage` 型別確保語言參數的正確性
- **自動備援**：若指定語言不可用，系統自動退回英文
- **結構一致**：所有語言版本維持相同的提示詞結構與格式
- **可擴充**：可透過擴充 `library/templates/l10n/` 中的語言定義新增語言

---

### **使用的 LLM 與自訂模型**

本函式庫以 Google Cloud 的 [VertexAI](https://cloud.google.com/vertex-ai) 實作，支援最新的 Gemini 模型。存取與配額需求由使用者的 Google Cloud 帳戶控制。

除了透過 VertexAI 可用的 Gemini 模型外，使用者可利用函式庫的 `Model` 抽象類別整合自訂模型。只需實作兩個方法——一個用於產生純文字，一個用於產生結構化資料（[方法說明文件](https://jigsaw-code.github.io/sensemaking-tools/docs/classes/models_model.Model.html)）——即可讓函式庫支援 Gemini 以外的模型、其他雲端供應商，甚至本地端基礎設施，以達到完整的資料主權。

請注意，依所選模型不同，現有功能的效能結果可能有所差異。

另提供兩個本機推論 adapter：**`GgmlModel`**（對接 `llama-server` / llama.cpp 的 GGUF 檔案）與 **`LmStudioModel`**（對接 LM Studio 的 OpenAI 相容端點）。兩者均無需雲端帳戶，可直接替換 `VertexModel` 或 `OpenRouterModel`。

---

### **執行成本**

LLM 定價依 token 數計算且持續變動。以下列出約 1000 條陳述的對話所需 token 數，請參閱 [Vertex AI 定價頁面](https://cloud.google.com/vertex-ai/generative-ai/pricing)取得最新的每個輸入 token 費用。截至 2025 年 4 月 10 日，在 Gemini 1.5 Pro 上執行主題識別、陳述分類與摘要生成的總費用不到 1 美元。

1000 條陳述對話的 Token 用量

|  | 主題識別 | 陳述分類 | 摘要生成 |
| ----- | ----- | ----- | ----- |
| 輸入 Tokens | 130,000 | 130,000 | 80,000 |
| 輸出 Tokens | 50,000 | 50,000 | 7,500 |

---

### **評估**

我們的文字摘要由多次 LLM 呼叫的輸出組成，每次呼叫專注於摘要一部分留言。我們已透過人工評估與自動評分器對這些 LLM 輸出進行幻覺評估。自動評分程式碼位於 [library/evals/autorating](https://github.com/Jigsaw-Code/sensemaking-tools/tree/main/library/evals/autorating)。

我們也使用基於輪廓係數的方法對主題識別與分類進行評估，相關評估程式碼將於近期發布。在穩定性方面，留言被分類至相同主題的一致率約達 90%，識別出的主題也顯示出高度穩定性。

---

## **執行工具——初始設定**

首先確認已安裝 `npm`（Ubuntu 系統可使用 `apt-get install npm`）。  
接著執行以下指令安裝專案模組：  
`npm install`

### **使用預設模型——GCloud 驗證**

使用連接至 Model Garden 的預設模型時，需要 Google Cloud 專案來控制配額與存取。所有系統的安裝說明請參閱[這裡](https://cloud.google.com/sdk/docs/install-sdk#deb)。  
Linux 系統可透過以下方式安裝 GCloud CLI：  
`sudo apt install -y google-cloud-cli`  
接著執行以下指令登入本機：  
`gcloud config set project <你的專案名稱>`  
`gcloud auth application-default login`

---

## **OpenRouter 整合**

### **環境設定**

#### **方式一：系統環境變數（正式環境建議）**

設定系統環境變數：

```bash
export OPENROUTER_API_KEY="你的-api-key"
export OPENROUTER_MODEL="openai/gpt-oss-120b"
export OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
export DEFAULT_OPENROUTER_PARALLELISM="5"
```

也可以設定：

```bash
export OPENROUTER_MODEL="minimax/minimax-m2.5"
```

#### **方式二：.env 檔案（僅限開發環境）**

在 `library` 目錄建立 `.env` 檔案：

```bash
OPENROUTER_API_KEY=你的-api-key
OPENROUTER_MODEL=openai/gpt-oss-120b
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
DEFAULT_OPENROUTER_PARALLELISM=5
```

使用 MiniMax M2.5 的範例：

```bash
OPENROUTER_MODEL=minimax/minimax-m2.5
```

**注意**：`.env` 檔案僅在 `NODE_ENV !== 'production'` 時載入，以確保正式環境安全性。

#### **環境變數優先順序**

1. **系統環境變數**（最高優先）
2. **.env 檔案**（僅開發環境）
3. **預設值**（最低優先）

### **使用方式**

#### **基本用法**

```typescript
import { createOpenRouterModelFromEnv } from './src/models/openrouter_model';

// 從環境變數自動建立模型
const model = createOpenRouterModelFromEnv();
```

#### **直接實例化**

```typescript
import { OpenRouterModel } from './src/models/openrouter_model';

const model = new OpenRouterModel(
  '你的-api-key',
  'openai/gpt-oss-120b',
  'https://openrouter.ai/api/v1'
);
```

### **部署**

#### **Docker 環境**

```dockerfile
ENV OPENROUTER_API_KEY=你的-api-key
ENV OPENROUTER_MODEL=openai/gpt-oss-120b
ENV OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
ENV DEFAULT_OPENROUTER_PARALLELISM=5
```

#### **Kubernetes 環境**

```yaml
env:
- name: OPENROUTER_API_KEY
  valueFrom:
    secretKeyRef:
      name: openrouter-secret
      key: api-key
- name: OPENROUTER_MODEL
  value: "openai/gpt-oss-120b"
- name: OPENROUTER_BASE_URL
  value: "https://openrouter.ai/api/v1"
```

#### **無伺服器環境**

```javascript
// AWS Lambda、Vercel、Netlify 等
process.env.OPENROUTER_API_KEY = '你的-api-key';
process.env.OPENROUTER_MODEL = 'openai/gpt-oss-120b';
```

### **瀏覽器環境支援**

本套件設計為瀏覽器友善：

- 優先讀取系統環境變數
- 不依賴 Node.js 特有的檔案系統操作
- 支援 Web Workers 與無伺服器環境

### **疑難排解**

#### **常見問題**

1. **未設定 API Key**
   - 確認 `OPENROUTER_API_KEY` 環境變數
   - 驗證 `.env` 檔案格式是否正確

2. **模型名稱錯誤**
   - 使用正確的 OpenRouter 模型名稱格式
   - 範例：`openai/gpt-oss-120b`、`anthropic/claude-3-sonnet`、`minimax/minimax-m2.5`

3. **並發限制問題**
   - 調整 `DEFAULT_OPENROUTER_PARALLELISM` 數值
   - 依據你的 OpenRouter 方案進行調整

#### **除錯模式**

設定 `DEBUG_MODE=true` 啟用詳細日誌：

```bash
export DEBUG_MODE=true
```

---

## **使用範例（OpenRouter）——JavaScript**

1. 註冊 OpenRouter 帳號，取得 API key，並設定於 `.env` 檔案中。
2. 將 `polist_report.csv` 複製至 `/files` 目錄，並重新命名為 `comments.csv`。

3. 執行：

```bash
npx ts-node ./library/examples/tutorial.ts
```

可從終端機取得 Markdown 格式的輸出。

---

## **使用範例——JavaScript**

摘要西雅圖最低工資 15 美元議題的對話。

```javascript
// 使用預設 Vertex 模型（Gemini Pro 1.5）與相關驗證資訊設定工具。
const mySensemaker = new Sensemaker({
  defaultModel: new VertexModel(
    "myGoogleCloudProject123",
    "us-central1",
  ),
});

// 注意：此函式並不存在。
// 取得西雅圖 15 美元最低工資討論的資料。
// CSV 包含留言文字、投票數與群組資訊，來源：
// https://github.com/compdemocracy/openData/tree/master/15-per-hour-seattle
const comments: Comments[] = getCommentsFromCsv("./comments.csv");

// 學習討論中的主題並印出。
const topics = mySensemaker.learnTopics(
  comments,
  // 是否包含子主題：
  true,
  // 無預先存在的主題：
  undefined,
  // 補充背景：
  "這是西雅圖 15 美元最低工資的對話"
);
console.log(topics);

// 摘要對話並以 Markdown 格式印出結果。
const summary = mySensemaker.summarize(
  comments,
  SummarizationType.AGGREGATE_VOTE,
  topics,
  // 補充背景：
  "這是西雅圖 15 美元最低工資的對話"
);
console.log(summary.getText("MARKDOWN"));
```

---

## **CLI 使用方式**

另有一套簡易 CLI 供測試使用，工具如下：

* [./library/runner-cli/runner.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/runner-cli/runner.ts)：輸入代表對話的 CSV，輸出包含摘要的 HTML 檔案。建議以 HTML 檔案檢視摘要，以便透過懸停引用查看原始留言與投票數。

* [./library/runner-cli/runner\_openrouter.ts](https://github.com/bestian/sensemaking-tools/blob/new-feature-open-router/library/runner-cli/runner_openrouter.ts)：用法同上，但使用 OpenRouter 模型。

使用 OpenRouter 模型前，請依下方設定環境變數：

```bash
# OpenRouter API 設定
OPENROUTER_API_KEY=你的_openrouter_api_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
OPENROUTER_MODEL=openai/gpt-oss-120b

# 選用：OpenRouter 自訂標頭
OPENROUTER_X_TITLE=Sensemaking Tools
```

接著執行：

```bash
npx ts-node ./library/runner-cli/runner_openrouter.ts \
  --outputBasename out \
  --inputFile "./files/comments.csv" \
  --additionalContext "對話描述" \
  --model minimax/minimax-m2.5 \
  --output_lang zh-TW
```

`--output_lang` 參數支援：
- `en`（預設）：英文輸出
- `zh-TW`：正體中文輸出

* [./library/runner-cli/categorization\_runner.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/runner-cli/categorization_runner.ts)：輸入代表對話的 CSV，輸出另一份已將留言分類至主題與子主題的 CSV。

* [./library/runner-cli/categorization\_runner\_openrouter.ts](https://github.com/bestian/sensemaking-tools/blob/new-feature-open-router/library/runner-cli/categorization_runner_openrouter.ts)：使用 OpenRouter 模型進行主題分類。

```bash
# 基本用法
npx ts-node ./library/runner-cli/categorization_runner_openrouter.ts \
  --inputFile "./files/comments.csv" \
  --outputFile "./files/categorized_comments.csv"
```

* [./library/runner-cli/advanced\_runner.ts](https://github.com/Jigsaw-Code/sensemaking-tools/blob/main/library/runner-cli/advanced_runner.ts)：輸入代表對話的 CSV，為對統計數據更感興趣的進階使用者輸出三個檔案。第一個是包含主題、其規模與子主題的 JSON；第二個是包含所有留言及其一致性分數與數值的 JSON；第三個是摘要物件的 JSON，可用於進一步處理。

* [./library/runner-cli/runner\_ggml.ts](https://github.com/bestian/sensemaking-tools/blob/new-feature-open-router-ggml/library/runner-cli/runner_ggml.ts)：透過本機 **GGUF 模型**（由 [llama-server（llama.cpp）](https://github.com/ggerganov/llama.cpp) 提供服務）執行完整的 sensemaking 流程，無需雲端 API Key。

  **方式 A——先手動啟動 `llama-server`：**
  ```bash
  llama-server --model /path/to/model.gguf --port 8080 --ctx-size 8192
  npx ts-node ./library/runner-cli/runner_ggml.ts \
    --inputFile "./files/comments.csv" \
    --outputBasename out
  ```

  **方式 B——讓 runner 自動啟動 `llama-server`：**
  ```bash
  npx ts-node ./library/runner-cli/runner_ggml.ts \
    --inputFile "./files/comments.csv" \
    --outputBasename out \
    --modelPath /path/to/model.gguf \
    --autoStart \
    --ctxSize 32768 \
    --output_lang zh-TW
  ```

  主要參數：`--serverUrl`（預設 `http://127.0.0.1:8080`）、`--modelPath`、`--autoStart`、`--ctxSize`（預設 32768）、`--output_lang`。  
  輸出：`.md`、`.html`、`.json` 以及 `-summaryAndSource.csv`。  
  可透過 `LLAMA_SERVER_BIN` 環境變數覆寫執行檔路徑。

* [./library/runner-cli/advanced\_runner\_lmstudio.ts](https://github.com/bestian/sensemaking-tools/blob/new-feature-open-router-ggml/library/runner-cli/advanced_runner_lmstudio.ts)：進階 runner，使用本機執行的 **[LM Studio](https://lmstudio.ai)**（OpenAI 相容端點，預設 `http://127.0.0.1:1234/v1`）。輸出與 `advanced_runner.ts` 相同的三個 JSON 檔案（主題統計、含分數的留言、摘要）。

  啟動 LM Studio 並載入模型後執行：
  ```bash
  npx ts-node ./library/runner-cli/advanced_runner_lmstudio.ts \
    --inputFile "./files/comments.csv" \
    --outputBasename out \
    --model nvidia/nemotron-3-nano-4b \
    --baseUrl http://127.0.0.1:1234/v1 \
    --outputLang zh-TW \
    --topicDepth 2
  ```

  主要參數：`--model`（預設 `nvidia/nemotron-3-nano-4b`）、`--baseUrl`、`--maxTokens`（預設 4096）、`--outputLang`、`--topicDepth`（1 / 2 / 3，預設 2）。  
  也可使用便利的 shell 腳本 `run_local_html_report.sh`，它會從 Bloom Civic AI 匯出 URL 抓取原始資料、執行此 runner，並建置獨立的 HTML 報告。腳本同樣支援 `--outputLang`，例如 `--outputLang zh-TW` 可生成繁體中文介面的報告。

這些工具處理 CSV 輸入檔案，必須包含 `comment_text` 和 `comment-id` 欄位。對於無群組資訊的討論，投票數應設定在 `agrees`、`disagrees` 和 `passes` 欄位中。若無投票資訊，可將這些欄位設為 0。對於有群組劃分的討論，可設定 `{group_name}-agree-count`、`{group_name}-disagree-count`、`{group_name}-pass-count` 欄位。

---

## **修改工具——開發**

### **測試**

單元測試可用以下指令執行：`npm test`  
若要在修改時持續執行測試，請執行：`npm run test-watch`

---

## **說明文件**

[此處](https://jigsaw-code.github.io/sensemaking-tools)的說明文件是 `docs/` 子目錄中 HTML 的託管版本，使用 typedoc 自動產生。若要更新說明文件，請執行：  
`npx typedoc`

---

## **貢獻與改進**

本專案提供 Jigsaw 以 AI 進行大規模對話 sensemaking 的透明視角。開發者可以：

* **審閱程式碼**，了解 Jigsaw 運用 LLM 的技術。
* **運用元件**於自身專案（可能需要一些客製化）。
* **以指令與提示詞範例及整體方法**作為自身 sensemaking 工具的靈感來源。

我們鼓勵實驗並在此分享的想法上繼續建構！

---

## **Cloud Vertex 使用條款**

本函式庫設計用於運用 Vertex AI，使用須遵守 [Cloud Vertex 服務條款](https://cloud.google.com/terms/service-terms)與[生成式 AI 禁止使用政策](https://policies.google.com/terms/generative-ai/use-policy)。
