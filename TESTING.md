# 測試指南

本文件說明如何設置和執行 MoneeBunny API 測試。

## 📋 目錄

- [快速開始](#快速開始)
- [測試架構](#測試架構)
- [執行測試](#執行測試)
- [測試資料庫設定](#測試資料庫設定)
- [測試檔案說明](#測試檔案說明)
- [常見問題](#常見問題)

## 🚀 快速開始

### 1. 安裝測試套件

測試套件已經包含在 `package.json` 的 `devDependencies` 中：

```bash
npm install
```

### 2. 設定測試資料庫

```bash
# 建立測試資料庫
createdb moneebunny_test

# 設定環境變數（或在 .env 檔案中設定）
export DATABASE_URL="postgresql://username:password@localhost:5432/moneebunny_test"

# 執行資料庫遷移
npx prisma migrate deploy
```

### 3. 執行測試

```bash
npm test
```

## 🏗️ 測試架構

### 使用的測試工具

- **Jest**: JavaScript 測試框架
- **ts-jest**: TypeScript 支援
- **Supertest**: HTTP 測試工具
- **Prisma**: 資料庫 ORM

### 測試目錄結構

```
tests/
├── setup.ts                    # Jest 全域設定
└── api/
    ├── README.md              # API 測試說明
    ├── 01-auth.test.ts        # 認證測試
    ├── 02-budgets.test.ts     # 預算測試
    ├── 03-transactions.test.ts # 交易測試
    └── 04-integration.test.ts  # 整合測試
```

## 🧪 執行測試

### 執行所有測試

```bash
npm test
```

### 執行特定測試檔案

```bash
npm test 01-auth
# 或
npm test auth.test.ts
```

### Watch 模式（開發時使用）

```bash
npm run test:watch
```

### 產生測試覆蓋率報告

```bash
npm run test:coverage
```

測試覆蓋率報告會產生在 `coverage/` 目錄中。

### 執行特定測試案例

```bash
npm test -- -t "should register a new user"
```

## 🗄️ 測試資料庫設定

### 方法 1: 使用獨立的測試資料庫（推薦）

```bash
# 建立測試資料庫
createdb moneebunny_test

# 在 .env 檔案中設定測試資料庫
DATABASE_URL_TEST="postgresql://username:password@localhost:5432/moneebunny_test"
```

### 方法 2: 使用 Docker

```bash
# 啟動測試資料庫容器
docker run -d \
  --name moneebunny-test-db \
  -e POSTGRES_USER=testuser \
  -e POSTGRES_PASSWORD=testpass \
  -e POSTGRES_DB=moneebunny_test \
  -p 5433:5432 \
  postgres:16

# 設定環境變數
export DATABASE_URL="postgresql://testuser:testpass@localhost:5433/moneebunny_test"
```

### 資料庫遷移

在執行測試前，確保測試資料庫已經執行遷移：

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
# 或
DATABASE_URL="postgresql://..." npx prisma db push
```

## 📝 測試檔案說明

### 01-auth.test.ts - 認證 API 測試

測試用戶認證相關功能：

- ✅ 用戶註冊（成功/失敗情境）
- ✅ 用戶登入（正確/錯誤憑證）
- ✅ JWT Token 驗證
- ✅ 取得個人資料
- ✅ 更新個人資料

**測試重點**：
- 密碼加密
- Token 生成與驗證
- 錯誤處理（重複註冊、錯誤密碼等）

### 02-budgets.test.ts - 預算管理測試

測試預算 CRUD 操作：

- ✅ 建立預算
- ✅ 列出所有預算
- ✅ 查看特定預算
- ✅ 更新預算
- ✅ 刪除預算

**測試重點**：
- 認證檢查（需要登入才能操作）
- 權限檢查（只能操作自己的預算）
- 資料驗證

### 03-transactions.test.ts - 交易記錄測試

測試交易 CRUD 操作：

- ✅ 建立交易（支出/收入）
- ✅ 列出所有交易
- ✅ 查看特定交易
- ✅ 更新交易
- ✅ 刪除交易

**測試重點**：
- 交易與預算的關聯
- 交易類型驗證（expense/income）
- 金額計算正確性

### 04-integration.test.ts - 完整流程測試

模擬真實用戶使用情境：

1. 📝 註冊新帳號
2. 🔐 登入取得 token
3. 💰 建立每月預算
4. 📊 查看預算列表
5. 💸 新增支出交易
6. 💵 新增收入交易
7. 📋 查看交易列表
8. 🔍 查看特定交易詳情
9. ✏️ 更新交易資訊
10. 👤 查看個人資料
11. 🔄 更新個人資料

**測試重點**：
- 完整的用戶體驗流程
- API 之間的協同運作
- 資料一致性

## 🔧 測試配置

### jest.config.js

Jest 配置檔案，定義測試環境和設定：

```javascript
module.exports = {
  preset: 'ts-jest',              // 使用 ts-jest
  testEnvironment: 'node',        // Node.js 環境
  roots: ['<rootDir>/tests'],     // 測試檔案位置
  testMatch: ['**/*.test.ts'],    // 測試檔案模式
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],  // 全域設定
};
```

### tests/setup.ts

Jest 全域設定檔案：

- 設定 `NODE_ENV=test`
- 設定測試用的 JWT_SECRET
- 設定測試逾時時間（30秒）
- 可選：抑制測試期間的 console 輸出

## ❓ 常見問題

### Q: 測試失敗，出現資料庫連線錯誤？

**A:** 確認以下事項：
1. PostgreSQL 服務是否正在執行
2. `.env` 檔案中的 `DATABASE_URL` 是否正確
3. 測試資料庫是否已建立
4. 是否已執行資料庫遷移

### Q: 測試通過但出現很多 console.log 輸出？

**A:** 可以在 `tests/setup.ts` 中取消註解以下行來抑制輸出：

```typescript
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
};
```

### Q: 如何測試特定的 API 端點？

**A:** 使用 Jest 的 `-t` 參數：

```bash
npm test -- -t "should create a new budget"
```

### Q: 測試資料會污染開發資料庫嗎？

**A:** 不會，只要使用獨立的測試資料庫。建議設定：
- 開發資料庫: `moneebunny`
- 測試資料庫: `moneebunny_test`

### Q: 如何清理測試資料？

**A:** 可以使用以下方法：

```bash
# 方法 1: 重建測試資料庫
dropdb moneebunny_test
createdb moneebunny_test
DATABASE_URL="..." npx prisma migrate deploy

# 方法 2: 使用 Prisma Studio 手動清理
DATABASE_URL="..." npx prisma studio
```

### Q: 測試執行很慢？

**A:** 可能的原因和解決方案：
1. 資料庫連線速度：使用本地資料庫
2. 測試逾時設定：調整 `jest.setTimeout()`
3. 測試隔離：確保測試不會互相等待

## 📚 進階用法

### 使用測試覆蓋率

```bash
npm run test:coverage
```

覆蓋率報告會顯示：
- **Statements**: 程式碼陳述執行率
- **Branches**: 分支執行率
- **Functions**: 函式執行率
- **Lines**: 程式碼行執行率

### 測試特定模組

```bash
# 只測試認證相關
npm test auth

# 只測試預算相關
npm test budgets

# 只測試整合測試
npm test integration
```

### Debug 測試

使用 VS Code 的偵錯功能：

1. 設定中斷點
2. 按 F5 或使用 Debug 面板
3. 選擇 "Jest" 配置

或使用 Node.js inspect：

```bash
node --inspect-brk node_modules/.bin/jest --runInBand
```

## 🎯 最佳實踐

1. **測試隔離**: 每個測試應該獨立運行
2. **清理資源**: 使用 `afterAll()` 清理測試資料
3. **有意義的測試名稱**: 使用描述性的測試名稱
4. **測試邊界條件**: 測試正常情況和異常情況
5. **使用 beforeAll/afterAll**: 設定和清理共用資源
6. **避免硬編碼**: 使用變數和常數
7. **測試覆蓋率**: 目標至少 80% 覆蓋率

## 📖 延伸閱讀

- [Jest 官方文件](https://jestjs.io/docs/getting-started)
- [Supertest GitHub](https://github.com/visionmedia/supertest)
- [Prisma 測試指南](https://www.prisma.io/docs/guides/testing)
- [TypeScript Jest 配置](https://kulshekhar.github.io/ts-jest/)
