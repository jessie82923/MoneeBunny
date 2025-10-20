# LINE Bot 快速開始指南

## 📋 前置準備

### 1. 申請 LINE Developers 帳號
1. 前往 [LINE Developers Console](https://developers.line.biz/console/)
2. 使用 LINE 帳號登入
3. 建立 Provider（提供者）

### 2. 建立 Messaging API Channel
1. 在 Provider 中點擊「Create a new channel」
2. 選擇「Messaging API」
3. 填寫基本資訊：
   - Channel name: MoneeBunny（或自訂名稱）
   - Channel description: 記帳機器人
   - Category: Finance
   - Subcategory: Accounting & Bookkeeping
4. 閱讀並同意條款，點擊「Create」

### 3. 設定 Messaging API
在 Channel 的「Messaging API」頁籤：

#### 獲取 Channel Access Token
1. 滾動到「Channel access token」區域
2. 點擊「Issue」按鈕
3. 複製生成的 token（長期有效）

#### 獲取 Channel Secret
1. 切換到「Basic settings」頁籤
2. 找到「Channel secret」
3. 點擊「Show」複製

#### 啟用 Webhook
1. 返回「Messaging API」頁籤
2. 找到「Webhook settings」
3. 點擊「Edit」設定 Webhook URL（稍後設定）
4. 啟用「Use webhook」

---

## 🔧 本地開發設定

### 1. 安裝依賴（已完成）
```bash
npm install @line/bot-sdk
```

### 2. 設定環境變數
編輯 `.env` 檔案，加入 LINE 設定：

```env
# LINE Bot Configuration
LINE_CHANNEL_ACCESS_TOKEN=your_channel_access_token
LINE_CHANNEL_SECRET=your_channel_secret
```

### 3. 更新資料庫
```bash
# 已執行 prisma db push，LineUser 模型已建立
npm run prisma:generate
```

### 4. 啟動開發伺服器
```bash
npm run dev
```

---

## 🌐 設定 Webhook（使用 ngrok）

### 1. 安裝 ngrok
```bash
# 使用 snap (Linux)
sudo snap install ngrok

# 或下載 https://ngrok.com/download
```

### 2. 註冊 ngrok 帳號
1. 前往 https://ngrok.com
2. 註冊免費帳號
3. 獲取 authtoken

### 3. 設定 authtoken
```bash
ngrok config add-authtoken YOUR_AUTHTOKEN
```

### 4. 啟動 ngrok tunnel
```bash
# 在新終端機視窗執行
ngrok http 3000
```

你會看到類似輸出：
```
Forwarding  https://xxxx-xxx-xxx-xxx.ngrok-free.app -> http://localhost:3000
```

### 5. 設定 LINE Webhook URL
1. 複製 ngrok 提供的 HTTPS URL
2. 前往 LINE Developers Console
3. 在「Messaging API」頁籤找到「Webhook settings」
4. 點擊「Edit」
5. 輸入：`https://your-ngrok-url.ngrok-free.app/api/line/webhook`
6. 點擊「Update」
7. 點擊「Verify」測試連線（應該顯示 Success）

---

## 📱 加入 Bot 好友並測試

### 1. 掃描 QR Code
1. 在「Messaging API」頁籤找到「Bot basic ID」
2. 使用 LINE App 掃描 QR Code
3. 加入 Bot 為好友

### 2. 測試基本功能

#### 查看幫助
```
幫助
```

#### 快速記帳
```
早餐 50
午餐 120 便當
交通 30 公車
-50 飲料
+5000 薪水
```

#### 查詢指令
```
今日支出
本月支出
本月預算
```

---

## 🔗 LINE User 綁定流程

### 當前實作（手動綁定）
1. 用戶首次傳訊息會收到註冊提示
2. 需要手動在資料庫建立 `LineUser` 記錄

#### 手動建立綁定（臨時方案）
```sql
-- 假設已有 MoneeBunny User (email: test@example.com)
-- LINE User ID 可從 webhook log 中取得

INSERT INTO line_users (id, "lineUserId", "displayName", "userId", "createdAt", "updatedAt")
VALUES (
  'cuid_here',                    -- 使用 CUID generator
  'Uxxxxxxxxxxxxxxxxxxxxx',       -- LINE User ID (從 webhook 取得)
  'Test User',                    -- LINE 顯示名稱
  'user_id_from_users_table',    -- MoneeBunny User ID
  NOW(),
  NOW()
);
```

### 未來實作（LIFF 自動綁定）
將建立 LIFF（LINE Front-end Framework）註冊頁面：
1. 用戶點擊註冊連結
2. LINE Login 授權
3. 自動建立 User 和 LineUser 關聯
4. 完成綁定

---

## 📊 功能檢查清單

### ✅ 已實作
- [x] Webhook 接收與驗證
- [x] 訊息解析引擎
- [x] 快速記帳功能
- [x] 今日支出查詢
- [x] 本月支出查詢
- [x] 本月預算查詢
- [x] 幫助指令
- [x] 加入好友歡迎訊息

### 🚧 待實作
- [ ] LIFF 註冊頁面
- [ ] LINE Login 整合
- [ ] 自動綁定 LINE User
- [ ] Rich Menu 設計
- [ ] Flex Message 報表
- [ ] 圖表視覺化
- [ ] 預算超支推播
- [ ] 圖片辨識記帳（OCR）

---

## 🧪 測試指令

### 記帳測試
```
早餐 35          # 基本支出
午餐 80 麵店     # 支出 + 備註
-45 飲料         # 金額格式
+3000 兼職       # 收入記錄
薪水 50000       # 收入（關鍵字判斷）
```

### 查詢測試
```
今日支出         # 顯示今日交易
本月支出         # 顯示本月統計
本月預算         # 顯示預算執行狀況
統計            # 詳細報表（開發中）
幫助            # 顯示使用說明
```

---

## 🐛 常見問題排除

### Webhook 驗證失敗
```
Error: Invalid signature
```
**解決方法**：
1. 確認 `.env` 中的 `LINE_CHANNEL_SECRET` 正確
2. 確認 ngrok 正在運行
3. 檢查 webhook URL 是否正確設定

### 用戶未註冊訊息
```
歡迎使用 MoneeBunny，請先完成註冊
```
**解決方法**：
1. 手動在資料庫建立 `LineUser` 記錄（見上方說明）
2. 或等待 LIFF 註冊功能完成

### Prisma 錯誤：Property 'lineUser' does not exist
**解決方法**：
```bash
npx prisma generate
```

---

## 📚 參考資源

### LINE 官方文件
- [Messaging API Reference](https://developers.line.biz/en/reference/messaging-api/)
- [Webhook Event Objects](https://developers.line.biz/en/reference/messaging-api/#webhook-event-objects)
- [Message Objects](https://developers.line.biz/en/reference/messaging-api/#message-objects)

### 開發工具
- [LINE Bot Designer](https://developers.line.biz/en/services/bot-designer/) - 設計對話流程
- [Flex Message Simulator](https://developers.line.biz/flex-simulator/) - 設計 Flex Message
- [ngrok](https://ngrok.com) - 本地開發 tunnel

---

## 🚀 部署到生產環境

### 選項 1: Heroku
```bash
# 安裝 Heroku CLI
# 設定環境變數
heroku config:set LINE_CHANNEL_ACCESS_TOKEN=xxx
heroku config:set LINE_CHANNEL_SECRET=xxx
heroku config:set DATABASE_URL=xxx

# 部署
git push heroku main
```

### 選項 2: Railway
1. 連接 GitHub repo
2. 設定環境變數
3. 自動部署

### 選項 3: VPS (Ubuntu)
```bash
# PM2 process manager
npm install -g pm2
pm2 start dist/app.js --name moneebunny
pm2 save
pm2 startup

# Nginx reverse proxy
# 設定 SSL (Let's Encrypt)
```

### 更新 LINE Webhook URL
部署後，更新 LINE Developers Console 的 Webhook URL 為：
```
https://your-domain.com/api/line/webhook
```

---

## 💡 下一步計劃

1. **LIFF 註冊頁面** - 實現自動綁定
2. **Rich Menu** - 提供快速操作按鈕
3. **Flex Message** - 美化報表顯示
4. **推播通知** - 預算提醒、每日摘要
5. **圖片記帳** - OCR 發票辨識

---

準備好開始了嗎？🎉

1. 先申請 LINE Developers 帳號
2. 建立 Messaging API Channel
3. 設定環境變數
4. 使用 ngrok 測試 webhook
5. 掃描 QR Code 加入 Bot
6. 開始記帳！
