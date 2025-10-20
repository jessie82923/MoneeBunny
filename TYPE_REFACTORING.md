# 型別系統重構說明

## 📦 重構目標

將所有輸入型別定義統一到 `validators` 資料夾，避免重複定義，保持單一真相來源（Single Source of Truth）。

## ✅ 完成的變更

### 1. 清理 `src/types/index.ts`

**移除：**
```typescript
// ❌ 移除這些重複的型別定義
export type CreateUserInput = Pick<User, 'email' | 'password' | 'firstName' | 'lastName'>;
export type UpdateUserInput = Partial<Pick<User, 'firstName' | 'lastName' | 'email'>>;
export type CreateBudgetInput = Pick<Budget, 'name' | 'amount' | 'period' | 'startDate' | 'endDate'>;
export type UpdateBudgetInput = Partial<CreateBudgetInput>;
export type CreateTransactionInput = Pick<Transaction, 'amount' | 'description' | 'category' | 'type' | 'date' | 'budgetId'>;
export type UpdateTransactionInput = Partial<CreateTransactionInput>;
```

**保留：**
```typescript
// ✅ 保留這些有用的型別
export type UserWithRelations = User & { ... };
export type BudgetWithRelations = Budget & { ... };
export type TransactionWithRelations = Transaction & { ... };
export interface ApiResponse<T = unknown> { ... };
export interface AuthTokenPayload { ... };
```

### 2. 建立 `src/validators/types.ts`

統一匯出所有型別，方便從一個地方引用：

```typescript
// 驗證相關型別
export type { RegisterInput, LoginInput, UpdateProfileInput } from './authSchemas';
export type { CreateBudgetInput, UpdateBudgetInput } from './budgetSchemas';
export type { CreateTransactionInput, UpdateTransactionInput } from './transactionSchemas';

// 共用型別
export type { UserWithRelations, ApiResponse, ... } from '../types';
```

### 3. 更新 `src/validators/index.ts`

加入所有型別的 re-export：

```typescript
export type {
  UserWithRelations,
  BudgetWithRelations,
  TransactionWithRelations,
  ApiResponse,
  AuthTokenPayload,
} from './types';
```

## 📊 型別來源對照表

### 之前（分散在兩個地方）

| 型別                    | 來源                    | 問題               |
|-------------------------|-------------------------|--------------------|
| CreateUserInput         | src/types/index.ts      | 手動 Pick          |
| RegisterInput           | validators/authSchemas  | Zod 推斷           |
| CreateBudgetInput       | src/types/index.ts      | 手動 Pick          |
| CreateBudgetInput       | validators/budgetSchemas| Zod 推斷（重複！）|

### 現在（統一在 validators）

| 型別                    | 來源                    | 優點               |
|-------------------------|-------------------------|--------------------|
| RegisterInput           | validators/authSchemas  | Zod 推斷 + 驗證    |
| LoginInput              | validators/authSchemas  | Zod 推斷 + 驗證    |
| CreateBudgetInput       | validators/budgetSchemas| Zod 推斷 + 驗證    |
| UpdateBudgetInput       | validators/budgetSchemas| Zod 推斷 + 驗證    |
| CreateTransactionInput  | validators/transactionSchemas| Zod 推斷 + 驗證|
| UpdateTransactionInput  | validators/transactionSchemas| Zod 推斷 + 驗證|

## 🎯 使用方式

### 選項 1: 從 validators 匯入（推薦）

```typescript
import type { RegisterInput, CreateBudgetInput, ApiResponse } from '../validators';
```

### 選項 2: 從個別檔案匯入

```typescript
import type { RegisterInput } from '../validators/authSchemas';
import type { CreateBudgetInput } from '../validators/budgetSchemas';
import type { ApiResponse } from '../types';
```

### 選項 3: 使用 Prisma 生成型別（Services 層）

```typescript
import { Prisma } from '@prisma/client';

async createUser(userData: Prisma.UserCreateInput): Promise<User> {
  // ...
}
```

## ✨ 優點

1. **單一真相來源**：所有輸入型別都由 Zod schema 推斷，避免重複定義。
2. **型別安全 + 執行時驗證**：同時擁有 TypeScript 編譯時檢查和 Zod 執行時驗證。
3. **易於維護**：修改 schema 時，型別自動更新，不需要手動同步。
4. **更精確的型別**：Zod 可以描述更細緻的驗證規則（如 min、max、email 格式等）。
5. **統一的匯出點**：可以從 `validators` 統一匯入所有驗證相關的型別和 schema。

## 📝 注意事項

1. **Controllers 不需要顯式型別標註**：因為 Zod 驗證 middleware 已經處理了，`req.body` 會被自動推斷為正確型別。

2. **Services 使用 Prisma 型別**：Service 層直接使用 Prisma 生成的型別（如 `Prisma.UserCreateInput`），更貼近資料庫操作。

3. **關聯型別保留在 types/index.ts**：如 `UserWithRelations` 等複合型別仍保留在原位置，因為這些是應用層的型別，不是輸入驗證。

## 🧪 測試結果

**所有 41 個測試通過！** ✅

- ✅ Authentication API (9 tests)
- ✅ Budget API (11 tests)
- ✅ Transaction API (10 tests)
- ✅ Integration Tests (11 tests)

## 🎓 學習重點

這次重構展示了現代 TypeScript 專案的最佳實踐：

1. **Schema-first 設計**：先定義驗證規則（schema），再從中推斷型別。
2. **避免重複**：同一個概念只定義一次。
3. **分層清晰**：驗證層（validators）、業務邏輯層（services）、資料層（Prisma）各司其職。
4. **型別安全**：從 API 輸入到資料庫操作，全程型別保護。

這就是 TypeScript 5.x + Zod + Prisma 的完美組合！🚀
