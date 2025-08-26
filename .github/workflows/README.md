# GitHub Actions 工作流程說明

本目錄包含用於自動化打包和發布 sensemaking-tools library 的 GitHub Actions 工作流程。

## 工作流程文件

### 1. `build-library.yml` - 手動打包工作流程

**觸發方式：** 手動觸發 (workflow_dispatch)

**功能：**
- 安裝依賴
- 運行測試
- 編譯 TypeScript 代碼
- 打包成 `.tgz` 文件
- 上傳構建產物
- 可選：創建 GitHub Release

**使用方法：**
1. 前往 GitHub 專案的 Actions 頁面
2. 選擇 "Build Library Package" 工作流程
3. 點擊 "Run workflow"
4. 填寫版本號和是否創建 Release
5. 點擊 "Run workflow" 開始執行

**輸入參數：**
- `version`: 版本號 (例如: 1.0.0)
- `create_release`: 是否創建 GitHub Release (預設: true)

### 2. `release-library.yml` - 自動發布工作流程

**觸發方式：**
- 推送標籤 (tags) 到 main/master 分支
- 手動觸發

**功能：**
- 自動構建和打包
- 創建 GitHub Release
- 上傳 Release 資產
- 可選：發布到 NPM

## 使用步驟

### 手動打包 (推薦用於開發測試)

1. **觸發工作流程：**
   - 前往 Actions → Build Library Package → Run workflow
   - 輸入版本號，例如 `1.0.1`
   - 選擇是否創建 Release
   - 點擊執行

2. **查看結果：**
   - 在 Actions 頁面查看執行狀態
   - 下載構建產物 (Artifacts)
   - 如果選擇創建 Release，會在 Releases 頁面看到新版本

### 自動發布 (用於正式版本)

1. **創建標籤：**
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```

2. **工作流程會自動執行：**
   - 構建和測試
   - 創建 Release
   - 上傳資產

## 構建產物

工作流程會生成以下產物：

- **編譯後的 JavaScript 文件** (`dist/` 目錄)
- **TypeScript 類型定義** (`.d.ts` 文件)
- **打包後的 Cloudflare Workers 版本**
- **npm 包文件** (`.tgz` 文件)

## 注意事項

1. **Node.js 版本：** 使用 Node.js 18
2. **依賴緩存：** 會緩存 `node_modules` 以加速構建
3. **測試要求：** 構建前會運行測試，確保代碼品質
4. **權限要求：** 需要 `GITHUB_TOKEN` 權限來創建 Release

## 故障排除

### 常見問題

1. **構建失敗：**
   - 檢查 TypeScript 編譯錯誤
   - 確認所有依賴已正確安裝
   - 查看測試是否通過

2. **Release 創建失敗：**
   - 確認 GitHub Token 權限
   - 檢查標籤名稱格式 (必須以 `v` 開頭)

3. **依賴安裝失敗：**
   - 檢查 `package-lock.json` 是否存在
   - 確認 Node.js 版本兼容性

### 手動構建

如果 GitHub Actions 有問題，可以在本地手動構建：

```bash
cd library
npm ci
npm test
npm run build:worker-bundle
npm pack
```

這會生成一個 `.tgz` 文件，可以直接使用或手動上傳到 GitHub Release。
