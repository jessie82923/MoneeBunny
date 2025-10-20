# MoneeBunny API 架構文件

## 概述
MoneeBunny 採用 RESTful API 設計，遵循業界標準的資源導向架構。

## 路由設計原則

### 1. Authentication Routes (`/api/auth`)
**職責**：處理用戶身份驗證相關操作

```
POST /api/auth/register    → 用戶註冊
POST /api/auth/login       → 用戶登入
POST /api/auth/logout      → 用戶登出
```

**設計理念**：
- `/auth` 端點僅負責身份驗證流程
- 不包含用戶資料的 CRUD 操作
- 符合單一職責原則（Single Responsibility Principle）

---

### 2. User Routes (`/api/users`)
**職責**：管理用戶資源（需要認證）

```
GET  /api/users/me         → 取得當前登入用戶資料
PUT  /api/users/me         → 更新當前登入用戶資料
GET  /api/users/:id        → 取得指定用戶資料（管理員功能）
PUT  /api/users/:id        → 更新指定用戶資料（管理員功能）
```

**設計理念**：
- 使用 `/me` 端點表示「當前認證用戶」（業界標準模式）
- 所有端點都需要 `authenticate` middleware
- 支援未來擴展管理員功能（列表、刪除等）
- 符合 RESTful 資源導向設計

---

### 3. Budget Routes (`/api/budgets`)
**職責**：管理預算資源（需要認證）

```
GET    /api/budgets        → 取得當前用戶的所有預算
POST   /api/budgets        → 建立新預算
GET    /api/budgets/:id    → 取得單一預算詳情
PUT    /api/budgets/:id    → 更新預算
DELETE /api/budgets/:id    → 刪除預算
```

---

### 4. Transaction Routes (`/api/transactions`)
**職責**：管理交易記錄（需要認證）

```
GET    /api/transactions        → 取得當前用戶的所有交易
POST   /api/transactions        → 建立新交易
GET    /api/transactions/:id    → 取得單一交易詳情
PUT    /api/transactions/:id    → 更新交易
DELETE /api/transactions/:id    → 刪除交易
```

---

## 架構層級

```
┌─────────────────────────────────────────┐
│           Routes (路由層)               │
│  - 定義 API 端點                        │
│  - 加入驗證 middleware (Zod)            │
│  - 加入認證 middleware (JWT)            │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│        Controllers (控制器層)           │
│  - 處理 HTTP 請求/回應                  │
│  - 調用 Service 層業務邏輯              │
│  - 格式化 API 回應                      │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Services (服務層)               │
│  - 封裝業務邏輯                         │
│  - 調用 Prisma ORM                      │
│  - 處理資料轉換                         │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         Prisma ORM (資料層)             │
│  - 資料庫操作                           │
│  - 型別安全的查詢                       │
└─────────────────────────────────────────┘
```

---

## 中介軟體（Middleware）

### 1. Authentication Middleware (`authenticate`)
**位置**：`src/middleware/auth.ts`

**功能**：
- 驗證 JWT token
- 解析用戶 ID 並注入到 `req.userId`
- 用於所有需要認證的路由

**使用範例**：
```typescript
router.get('/me', authenticate, (req, res) => 
  userController.getCurrentUserProfile(req, res)
);
```

---

### 2. Validation Middleware (`validate`)
**位置**：`src/middleware/validate.ts`

**功能**：
- 使用 Zod schema 驗證請求資料
- 自動回傳 400 錯誤和詳細錯誤訊息
- 支援 body、query、params 驗證

**使用範例**：
```typescript
router.post('/register', 
  validate(registerSchema), 
  (req, res) => authController.register(req, res)
);
```

---

## 驗證系統（Validation）

### Schema 組織
```
src/validators/
├── index.ts                    # 統一匯出
├── authSchemas.ts             # 認證相關驗證
├── budgetSchemas.ts           # 預算相關驗證
└── transactionSchemas.ts      # 交易相關驗證
```

### 驗證流程
1. **請求進入** → 路由層的 `validate(schema)` middleware
2. **Zod 驗證** → 檢查資料格式、型別、必填欄位
3. **驗證失敗** → 自動回傳 400 + 詳細錯誤訊息
4. **驗證成功** → 資料傳遞到 Controller，保證型別正確

---

## 型別系統

### 1. Prisma 自動生成型別
```typescript
import { User, Budget, Transaction } from '@prisma/client';
```

### 2. Zod Schema 推斷型別
```typescript
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  firstName: z.string(),
  lastName: z.string(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
```

### 3. 自訂通用型別
```typescript
// src/types/index.ts
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  details?: any;
}
```

---

## 錯誤處理

### HTTP 狀態碼規範
```
200 OK                 → 成功
201 Created            → 建立成功
400 Bad Request        → 驗證失敗
401 Unauthorized       → 未認證
403 Forbidden          → 認證失敗（無效 token）
404 Not Found          → 資源不存在
409 Conflict           → 資料衝突（如重複註冊）
500 Internal Error     → 伺服器錯誤
```

### 錯誤回應格式
```json
{
  "success": false,
  "error": "錯誤訊息",
  "details": {
    "field": "具體錯誤資訊"
  }
}
```

---

## 業界標準參考

此架構設計參考以下業界標準：

1. **Firebase Authentication**
   - `/auth` 僅處理認證
   - `/users` 管理用戶資料

2. **GitHub API**
   - `GET /user` 取得當前用戶
   - `GET /users/:username` 取得指定用戶

3. **Auth0**
   - 認證和用戶管理職責分離
   - 使用 `/me` 端點表示當前用戶

4. **RESTful API 最佳實踐**
   - 資源導向設計
   - 使用正確的 HTTP 方法（GET/POST/PUT/DELETE）
   - 一致的錯誤處理

---

## 重構紀錄

### 2024 年重構：Auth 與 User 功能分離

**重構前**：
```
/api/auth/profile        → 取得/更新當前用戶（混亂）
/api/users/:id           → 取得/更新指定用戶
```

**問題**：
- 功能重複
- 職責不清晰
- 不符合 RESTful 設計

**重構後**：
```
/api/auth                → 純認證操作
  POST /register
  POST /login
  POST /logout

/api/users               → 用戶資源管理
  GET  /me               → 當前用戶
  PUT  /me
  GET  /:id              → 指定用戶（管理員）
  PUT  /:id
```

**優點**：
✅ 職責清晰（認證 vs 資源管理）
✅ 符合 RESTful 標準
✅ 支援未來擴展（管理員功能）
✅ 測試更容易維護

---

## 測試策略

### 測試檔案組織
```
tests/api/
├── 01-auth.test.ts          # 認證流程測試（9 個測試）
├── 02-budgets.test.ts       # 預算 CRUD 測試（11 個測試）
├── 03-transactions.test.ts  # 交易 CRUD 測試（10 個測試）
└── 04-integration.test.ts   # 完整流程測試（12 個測試）
```

### 測試覆蓋率
- ✅ 42 個測試全部通過（100%）
- 涵蓋成功和失敗情境
- 包含完整的整合測試流程

---

## 未來擴展計劃

### 1. 管理員功能
```typescript
// 需要管理員權限的路由
router.get('/users', requireAdmin, userController.listAllUsers);
router.delete('/users/:id', requireAdmin, userController.deleteUser);
```

### 2. 分頁和過濾
```typescript
GET /api/transactions?page=1&limit=20&type=EXPENSE
GET /api/budgets?category=Food&status=active
```

### 3. 更細緻的權限控制
- 基於角色的訪問控制（RBAC）
- 資源擁有者驗證

---

## 總結

MoneeBunny API 採用現代化、模組化的架構設計：

- **清晰的職責分離**：Auth vs User vs Resource
- **完整的驗證系統**：Zod + TypeScript
- **業界標準**：RESTful + JWT + CRUD
- **高測試覆蓋率**：42 個測試全部通過
- **易於擴展**：支援未來功能增強
