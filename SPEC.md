# 【Automation Toolkit】規格計劃書

## 1. 專案概述

### 1.1 專案背景與目的

現代工作者每天處理大量重複性任務——定時發社群、監控庫存、整合不同系統資料——卻沒有合適的工具能快速建立自動化流程。Zapier 和 Make 功能強大但昂貴且複雜；寫程式雖然靈活，但門檻高。本工具提供一個無需寫程式碼的視覺化流程編輯器，讓行銷人員、電商業者甚至一般用戶透過拖放節點、建立條件判斷、串接 API，就能在瀏覽器內完成個人化自動化腳本。與競爭對手的核心差異在於支援自托管、靈活的程式碼區塊，以及中文優先的使用者體驗。
### 1.2 目標受眾（TA）

- 行銷人員：需要定時發布社群內容，但 Zapier 昂貴且操作複雜
- 電商從業人員：訂單成立後需通知倉庫、發送 Email、更新庫存，手動處理易出錯
- 開發者：日常有許多重複性資料處理腳本，希望有圖形介面管理而非純 CLI
- 內容創作者：需跨平台同步內容（FB/IG/YouTube）並追蹤成效
### 1.3 專案範圍

In Scope（做）：視覺化流程編輯器（React Flow 所見即所得）、觸發器（時間/Cron、Webhook、Email/Discord/LINE 事件）、動作（HTTP 請求、資料轉換、發送通知、執行腳本）、條件分支（IF/ELSE）和 ForEach 循環、執行記錄、流程範本市集
Out of Scope（不做）：複雜 RPA（桌面自動化）、團隊協作（多人編輯同一流程）、付費市集與創作者分潤、企業 SSO 整合
### 1.4 參考網站分析

- Zapier：應用整合最多、操作引導完善，但昂貴、免費額度少、中文支援差
- Make：視覺化出色、邏輯靈活，但學習曲線高、UI 複雜
- n8n：開源可自托管、工作流強大，但 UI 較技術導向
- Pabbly：價格實惠、介面簡單，但整合數量少、功能有限
## 2. 資訊架構與動線

### 2.1 網站地圖（Sitemap）

Automation Toolkit：儀表板（我的流程列表、流量使用概覽、快速上手範本推薦）→ 流程編輯器（左側節點面板、中央 Canvas、右側節點設定）→ 執行記錄（執行歷史、單次詳情）→ 範本市集 → 設定
### 2.2 使用者動線

 flowchart TD
    A([使用者登入儀表板]) --> B{意圖}
    B -->|建立新流程| C[點擊建立新流程]
    B -->|使用範本| D[瀏覽範本市集]
    B -->|查看執行紀錄| E[進入執行記錄頁]
    C --> F[選擇觸發器類型]
    D --> G[選擇範本分類]
    F --> H[拖放觸發器到 Canvas]
    G --> I[點擊安裝範本]
    H --> J[拖放動作節點並串接]
    I --> J
    J --> K[設定節點參數]
    K --> L{流程正確?}
    L -->|是| M[啟用流程]
    L -->|否| K
    M --> N[流程執行中]
    N --> O[Webhook 觸發或排程啟動]
    O --> P[紀錄執行結果]
    P --> Q{成功?}
    Q -->|失敗| R[查看執行記錄除錯]
    Q -->|成功| S([完成])
    E --> T[選擇執行歷史]
    T --> U[查看步驟輸入輸出]
    R --> V[修正節點設定]
    V --> M
### 2.3 使用者旅程圖

 journey
    title 自動化流程建立旅程
    section 探索需求
      發現重複性任務: 5: 行銷人員
      研究自動化工具: 4: 電商從業人員
    section 建立流程
      選擇觸發條件: 5: 開發者
      拖放相關動作節點: 5: 一般用戶
      設定 API 參數: 4: 行銷人員
    section 測試與發布
      執行測試: 5: 開發者
      檢查執行記錄: 4: 電商從業人員
      啟用並監控: 5: 行銷人員
    section 持續使用
      收到 LINE 通知成功: 4: 一般用戶
      流程穩定運行: 5: 所有用戶
## 3. 視覺與 UI

### 3.1 品牌設計指南

- Primary #6366F1：主要按鈕、已選取節點、品牌元素
- Secondary #0F172A：深色背景、主要容器底色
- Accent #10B981：執行成功、連接線、完成狀態
- Node Trigger #8B5CF6：觸發器節點 / Node Action #3B82F6：動作節點 / Node Logic #F59E0B：邏輯節點
### 3.2 跨裝置支援

Desktop ≥1280px：完整三欄編輯器 / Tablet 768-1279px：左右面板改為 Drawer / Mobile <768px：不支援流程編輯（僅檢視執行記錄、儀表板瀏覽）
## 4. 前端功能規格

- 視覺化流程編輯器：React Flow，支援拖放節點、連接線、縮放、拖曳畫布
- 觸發器節點：時間（Cron 設定）、Webhook URL（自動產生）、Email/LINE/Discord 事件
- 動作節點：HTTP 請求（方法/URL/Header/Body）、JSON 轉換、通知發送、Script 執行
- 邏輯節點：IF/ELSE 條件分支、ForEach 循環、Switch 多條件
- 執行記錄：歷史執行含狀態（成功/失敗/進行中）、耗時、觸發時間；展開查看步驟輸入輸出 JSON
- 範本市集：預設範本分類展示，一鍵安裝並進入編輯器
- 流程版本管理：每次儲存產生版本，可回溯
## 5. 後端與技術規格

### 5.1 技術棧

- 前端：Next.js 14（App Router）+ Tailwind CSS + React Flow
- 後端：FastAPI（Python）
- 任務佇列：Celery + Redis
- 腳本執行：Docker 容器隔離（Python/Node.js）
- 資料庫：PostgreSQL / 快取：Redis
### 5.2 第三方 API 串接

- Discord Webhook：發送通知（免費）
- LINE Messaging API：發送 LINE 通知（免費額度）
- SendGrid：Email 發送（免費 100 封/天）/ Twilio：SMS 通知（依用量計費）
## 6. 專案時程與驗收標準

### 6.1 里程碑時程

 timeline
    title Automation Toolkit 開發時程
    phase 1: 設計與基礎架構 (Week 1-2)
        UI/UX 設計稿確認 : 4 days
        資料庫 Schema 設計 : 2 days
        Docker 環境建立 : 4 days
    phase 2: 核心編輯器 (Week 3-5)
        React Flow 整合 : 5 days
        觸發器節點實作 : 4 days
        動作節點實作 : 5 days
        邏輯節點實作 : 3 days
    phase 3: 後端與執行引擎 (Week 6-7)
        FastAPI 流程儲存 API : 3 days
        Celery Worker 執行引擎 : 5 days
        Docker 腳本隔離環境 : 4 days
    phase 4: 功能補全與測試 (Week 8-9)
        執行記錄功能 : 3 days
        範本市集 : 3 days
        端到端測試 : 4 days
        Bug 修復 : 3 days
    phase 5: 部署與交付 (Week 10)
        自托管部署文件 : 3 days
        上線與監控設定 : 2 days
        驗收確認 : 2 days
### 6.2 驗收標準

- 支援瀏覽器：Chrome 120+、Firefox 120+
- 流程建立成功率 > 95%（基本流程）
- 執行穩定性 > 99%（正式環境）
- HTTP 請求動作：成功發送並正確解析回應
- 腳本執行：Python/Node.js 程式碼區塊正確執行
- 通知發送：Discord/LINE/Email 正確送達
- 同時活躍流程數：支援 100+ 個流程同時執行
### 6.3 保固與維護

上線後 30 天：免費 Bug 修復 / 版本更新：Celery/Docker 依賴每月檢查更新 / 節點擴展：提供 SDK 文件供未來新增自訂節點
## 7. 功能勾選清單

### 前端

### 後端

### DevOps

