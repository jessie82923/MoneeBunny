# LINE Bot 記帳應用整合計劃

## 專案目標
基於現有 MoneeBunny API，打造類似「記帳雞」的 LINE Bot 記帳應用。

---

## 功能規劃

### 第一階段：基礎記帳功能
- ✅ 用戶透過 LINE 註冊/登入
- ✅ 快速記帳（文字輸入：早餐 50）
- ✅ 查看今日/本月支出
- ✅ 查看預算剩餘

### 第二階段：進階功能
- 📊 圖表化統計報表
- 🔔 預算超支提醒
- 📷 拍照記帳（OCR 辨識發票）
- 🏷️ 自訂分類標籤

### 第三階段：社交功能
- 👥 群組記帳（共同帳本）
- 💰 費用分攤計算
- 📤 匯出 Excel 報表

---

## 技術架構

```
┌─────────────────────────────────────────┐
│         LINE Platform                   │
│  - LINE Messaging API                   │
│  - LINE Login                           │
│  - LIFF (LINE Front-end Framework)      │
└──────────────┬──────────────────────────┘
               │ Webhook
┌──────────────▼──────────────────────────┐
│      LINE Bot Service (新增)            │
│  - 處理 Webhook 事件                    │
│  - 解析用戶訊息                         │
│  - 調用 MoneeBunny API                  │
│  - 格式化回應訊息                       │
└──────────────┬──────────────────────────┘
               │ REST API
┌──────────────▼──────────────────────────┐
│    MoneeBunny API (既有架構)            │
│  - /api/auth (認證)                     │
│  - /api/users (用戶管理)                │
│  - /api/budgets (預算管理)              │
│  - /api/transactions (交易記錄)         │
└──────────────┬──────────────────────────┘
               │ Prisma ORM
┌──────────────▼──────────────────────────┐
│       PostgreSQL Database               │
└─────────────────────────────────────────┘
```

---

## 資料庫擴展

### 新增 LINE 用戶關聯表

```prisma
model LineUser {
  id            String   @id @default(cuid())
  lineUserId    String   @unique  // LINE 平台的 userId
  displayName   String?             // LINE 顯示名稱
  pictureUrl    String?             // LINE 頭像 URL
  statusMessage String?             // LINE 狀態訊息
  
  userId        String   @unique    // 關聯到 MoneeBunny User
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt
  
  @@map("line_users")
}

// User 模型需要加入關聯
model User {
  // ...existing fields...
  lineUser      LineUser?
}
```

---

## LINE Bot 互動流程

### 1. 用戶首次使用（註冊）
```
用戶 → LINE Bot
    → Bot: "歡迎！請點擊下方連結完成註冊"
    → LIFF 頁面（LINE Login）
    → 授權後建立 User + LineUser
    → Bot: "註冊完成！可以開始記帳了 🎉"
```

### 2. 快速記帳
```
用戶: "早餐 50"
Bot 解析:
  - 類型: 支出（預設）
  - 分類: 早餐 → Food & Dining
  - 金額: 50
  - 日期: 今天

Bot → API: POST /api/transactions
Bot → 用戶: "✅ 已記錄：早餐 NT$50
            💰 本月飲食支出：NT$1,250 / NT$5,000"
```

### 3. 查看報表
```
用戶: "本月支出"
Bot → API: GET /api/transactions?startDate=...&endDate=...
Bot → 用戶: 
"📊 本月支出報表 (12月)
────────────────────
🍔 飲食: NT$1,250
🚗 交通: NT$800
🏠 居住: NT$15,000
🎮 娛樂: NT$500
────────────────────
💰 總計: NT$17,550
📈 較上月增加 5%"
```

---

## 訊息解析規則

### 支出記錄格式
```
早餐 50          → 分類：飲食, 金額：50
午餐 120 便當    → 分類：飲食, 金額：120, 備註：便當
交通 30 公車     → 分類：交通, 金額：30, 備註：公車
-50 飲料         → 金額：50, 備註：飲料（分類自動判斷）
```

### 收入記錄格式
```
薪水 50000       → 類型：收入, 金額：50000
兼職 3000        → 類型：收入, 金額：3000
+5000 紅包       → 類型：收入, 金額：5000
```

### 查詢指令
```
今日支出         → 顯示今天的支出統計
本月支出         → 顯示本月支出統計
本月預算         → 顯示所有預算執行狀況
統計             → 顯示本月詳細報表
```

---

## 開發步驟

### Phase 1: LINE Bot 基礎建設
1. ✅ 申請 LINE Developers 帳號
2. ✅ 建立 LINE Messaging API Channel
3. ✅ 設定 Webhook URL
4. ✅ 建立 LINE Bot Service 目錄結構
5. ✅ 實作 Webhook 接收與驗證

### Phase 2: 用戶認證整合
1. ✅ 建立 LINE Login Channel
2. ✅ 實作 LIFF 註冊頁面
3. ✅ LINE User 與 MoneeBunny User 綁定
4. ✅ 實作自動登入機制

### Phase 3: 記帳功能
1. ✅ 訊息解析引擎（NLP）
2. ✅ 快速記帳指令
3. ✅ 交易確認流程
4. ✅ 錯誤處理與提示

### Phase 4: 查詢與報表
1. ✅ 支出查詢指令
2. ✅ 預算查詢指令
3. ✅ 統計報表生成
4. ✅ Flex Message 圖表呈現

### Phase 5: 進階功能
1. ⏳ 預算超支通知（Push Message）
2. ⏳ 週報/月報自動推送
3. ⏳ 圖片辨識記帳
4. ⏳ Rich Menu 設計

---

## 目錄結構規劃

```
src/
├── line-bot/                    # LINE Bot 相關（新增）
│   ├── index.ts                 # Bot 主入口
│   ├── webhook.ts               # Webhook 處理
│   ├── handlers/                # 事件處理器
│   │   ├── message.ts           # 文字訊息處理
│   │   ├── postback.ts          # Postback 事件
│   │   └── follow.ts            # 加入好友事件
│   ├── parsers/                 # 訊息解析
│   │   ├── transaction.ts       # 交易記錄解析
│   │   └── command.ts           # 指令解析
│   ├── templates/               # 訊息模板
│   │   ├── flex/                # Flex Message
│   │   │   ├── transaction.ts   # 交易卡片
│   │   │   └── report.ts        # 報表卡片
│   │   └── quick-reply.ts       # Quick Reply
│   └── services/                # LINE 服務
│       ├── lineClient.ts        # LINE SDK 封裝
│       └── lineAuth.ts          # LINE Login 處理
├── routes/
│   └── line.ts                  # LINE Webhook 路由（新增）
├── controllers/                 # 既有 API Controllers
├── services/                    # 既有 Business Services
└── ...
```

---

## 環境變數設定

```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
LINE_LIFF_ID=your_liff_id

# LINE Login Configuration
LINE_LOGIN_CHANNEL_ID=your_login_channel_id
LINE_LOGIN_CHANNEL_SECRET=your_login_channel_secret
LINE_LOGIN_CALLBACK_URL=https://yourdomain.com/api/line/callback
```

---

## 安全性考量

### 1. Webhook 驗證
- 驗證 LINE 簽名（X-Line-Signature）
- 防止偽造請求

### 2. 用戶認證
- LINE User ID 與 MoneeBunny User 綁定
- 使用 JWT token 管理 session

### 3. 資料隱私
- 不儲存 LINE 訊息內容
- 僅保留必要的 LINE 用戶資訊

---

## 成本估算

### LINE API 費用
- Messaging API: 免費額度 500 則/月
- 超過部分: 約 NT$0.2/則
- LINE Login: 免費

### 建議方案
- 個人使用: 免費方案足夠
- 商業化: Developer Trial（免費 500 則/月）
- 大量用戶: 升級付費方案

---

## 參考資源

### LINE 官方文件
- [Messaging API](https://developers.line.biz/en/docs/messaging-api/)
- [LINE Login](https://developers.line.biz/en/docs/line-login/)
- [LIFF](https://developers.line.biz/en/docs/liff/)
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/)

### 類似應用參考
- 記帳雞
- CWMoney（康和記帳）
- Moneybook

---

## 下一步行動

1. **立即開始**：申請 LINE Developers 帳號
2. **安裝 SDK**：`npm install @line/bot-sdk`
3. **建立 Webhook**：實作 `/api/line/webhook` 路由
4. **測試環境**：使用 ngrok 進行本地測試

---

## 預期效益

### 用戶體驗
- ⚡ 秒速記帳（不需開 App）
- 💬 自然語言輸入
- 📱 LINE 原生體驗

### 技術優勢
- 🏗️ 復用既有 API（減少開發時間 70%）
- 🔒 完整的認證與資料驗證
- 📊 已驗證的業務邏輯

### 商業價值
- 👥 10 億+ LINE 用戶潛在市場
- 🚀 低進入門檻（無需下載 App）
- 💰 未來可加入廣告或訂閱制

---

準備好開始了嗎？🚀
