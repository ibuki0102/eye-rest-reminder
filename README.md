# 用眼休息提醒 / Eye Rest Reminder

一個以 **20-20-20** 原則為核心的桌面提醒工具：每專注 20 分鐘，提醒使用者休息 20 秒並望向遠方；休息結束後，自動開始下一輪專注計時。

本專案使用 Vue 3、TypeScript 與 Tauri 2 建置，目前以 Windows 桌面 App 為主要發佈目標。

## 功能

- 預設 20 分鐘專注、20 秒休息，可自行調整。
- 開始、暫停與重設計時器。
- 休息期間可延後 1 分鐘、延後 5 分鐘或跳過本次休息。
- 桌面通知與柔和提示音可個別開關。
- 三種提醒模式：
  - **溫和**：只顯示桌面通知。
  - **專注**：休息開始時帶回 App 視窗。
  - **嚴格**：休息期間顯示遮罩並暫時置頂視窗。
- 勿擾模式：30 分鐘、1 小時或持續勿擾；專注結束時會保留待處理的休息。
- 可設定一組工作時段並套用到指定星期，避免非工作時間提醒。
- 支援繁體中文與美式英文，以及系統／淺色／深色主題。
- 設定會保存於本機，包含開機自動啟動選項與還原初始設定。
- 使用回顧：今日摘要與近 7 日的完成專注／休息統計。

## 系統匣行為

- 點擊視窗右上角 `×`：第一次會說明 App 將隱藏至系統匣；之後直接隱藏且計時持續運行。
- 左鍵點擊系統匣圖示：顯示並聚焦主視窗。
- 右鍵點擊系統匣圖示：顯示目前狀態與倒數、開始／暫停，以及「結束」。
- Hover 系統匣圖示：顯示目前語系的 App 名稱。

## 技術架構

- 前端：Vue 3、TypeScript、Vite、Vue I18n。
- 桌面殼層：Tauri 2、Rust。
- 原生能力：系統匣、視窗控制、開機啟動、本機設定儲存與桌面通知。

```text
src/
├─ components/      # 計時器、設定、統計、對話框與休息遮罩
├─ composables/     # 計時、設定、排程、主題、語系與統計邏輯
├─ locales/         # zh-TW 與 en-US 翻譯
├─ services/        # 本機儲存與原生視窗服務
└─ types/           # TypeScript 型別

src-tauri/
├─ src/             # Tauri 系統匣、視窗事件與 Rust 進入點
├─ capabilities/    # Tauri 權限設定
└─ icons/           # Windows、macOS 與 App 圖示素材
```

## 開發環境

請先安裝：

- Node.js 20 或更新版本
- Rust stable 與 Cargo
- Windows 上的 Tauri 開發相依環境（Microsoft C++ Build Tools、WebView2 Runtime）

安裝依賴：

```bash
npm install
```

啟動 Tauri 開發視窗：

```bash
npm run tauri dev
```

> `npm run tauri dev` 會開啟具備系統匣與原生視窗能力的 Tauri App。`npm run dev` 僅啟動瀏覽器預覽，無法使用系統匣、視窗置頂／隱藏與開機啟動等原生功能。

## 常用指令

| 指令                   | 用途                                 |
| ---------------------- | ------------------------------------ |
| `npm run dev`          | 啟動 Vite 瀏覽器預覽。               |
| `npm run tauri dev`    | 啟動 Tauri 桌面開發模式。            |
| `npm run build`        | 型別檢查並建置前端 production 檔案。 |
| `npm run tauri:build`  | 建置 Tauri release 與安裝檔。        |
| `npm run format`       | 使用 Prettier 格式化前端與設定檔。   |
| `npm run format:check` | 檢查 Prettier 格式。                 |

Rust 原始碼修改後，也請在 `src-tauri` 目錄執行：

```bash
cargo fmt
cargo check
```

## 建置與安裝

建立 Windows release 安裝檔：

```bash
npm run tauri:build
```

完成後，NSIS 安裝檔位於：

```text
src-tauri/target/release/bundle/nsis/Eye Rest Reminder_0.1.0_x64-setup.exe
```

## 通知說明

通知以 Tauri WebView 的標準 Notification API 顯示，確保每次開始休息與回到專注時都能可靠提醒。

Windows 通知中心是否保留提醒歷程由系統與 WebView 行為決定；目前 App 不會自動清除通知中心紀錄，以避免影響後續提醒的顯示。

## 目前限制

- 主要驗證與發佈目標為 Windows。
- macOS 與行動版尚未完成完整的原生行為驗證。
- 瀏覽器預覽可使用計時介面，但不等同完整桌面 App 體驗。
