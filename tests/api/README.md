# API Tests

這個資料夾包含 MoneeBunny API 的完整測試套件。

## 測試檔案

1. **01-auth.test.ts** - 認證 API 測試
   - 用戶註冊
   - 用戶登入
   - 取得個人資料
   - 更新個人資料

2. **02-budgets.test.ts** - 預算管理 API 測試
   - 建立預算
   - 列出所有預算
   - 查看特定預算
   - 更新預算
   - 刪除預算

3. **03-transactions.test.ts** - 交易記錄 API 測試
   - 建立交易
   - 列出所有交易
   - 查看特定交易
   - 更新交易
   - 刪除交易

4. **04-integration.test.ts** - 整合測試
   - 完整用戶流程：註冊 → 登入 → 建立預算 → 新增交易 → 更新資料

## 執行測試

### 安裝測試套件

```bash
npm install --save-dev jest ts-jest @types/jest supertest @types/supertest
```

### 執行所有測試

```bash
npm test
```

### 執行特定測試檔案

```bash
npm test 01-auth.test.ts
```

### 執行整合測試

```bash
npm test 04-integration.test.ts
```

### 產生測試覆蓋率報告

```bash
npm test -- --coverage
```

## 測試環境設定

測試會使用 `DATABASE_URL` 環境變數來連接測試資料庫。建議建立一個獨立的測試資料庫：

```bash
# 建立測試資料庫
createdb moneebunny_test

# 執行資料庫遷移
DATABASE_URL="postgresql://user:password@localhost:5432/moneebunny_test" npx prisma migrate deploy
```

## 注意事項

- 測試會在實際資料庫上執行，請確保使用獨立的測試資料庫
- 每個測試都應該是獨立的，不依賴其他測試的結果
- 整合測試會建立真實的用戶和資料
- 測試完成後，可以手動清理測試資料或重置測試資料庫

## 測試流程說明

### 01-auth.test.ts
測試用戶認證流程，包含註冊、登入、JWT token 驗證等功能。

### 02-budgets.test.ts
測試預算管理的完整 CRUD 操作，確保只有擁有者可以操作自己的預算。

### 03-transactions.test.ts
測試交易記錄的完整 CRUD 操作，包含與預算的關聯。

### 04-integration.test.ts
完整的端到端測試，模擬真實用戶使用情境：
1. 註冊新帳號
2. 登入取得 token
3. 建立每月預算
4. 查看預算列表
5. 新增支出交易
6. 新增收入交易
7. 查看交易列表
8. 查看特定交易
9. 更新交易
10. 查看個人資料
11. 更新個人資料

這個測試確保整個 API 系統能夠正確協同運作。
