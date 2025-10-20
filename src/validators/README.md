# Validators

這個資料夾包含所有 API 端點的輸入驗證 schema，使用 [Zod](https://zod.dev/) 進行執行時驗證。

## 為什麼需要執行時驗證？

TypeScript 只能在**編譯時**檢查型別，無法保證**執行時**從外部（HTTP 請求）接收的資料是否正確。

執行時驗證可以：
- ✅ 確保資料格式正確
- ✅ 回傳 400 Bad Request（而不是 500 Internal Server Error）
- ✅ 提供詳細的錯誤訊息
- ✅ 自動轉換資料型別（如字串轉日期）

## 檔案結構

```
validators/
├── index.ts                  # 匯出所有 schema 和 middleware
├── authSchemas.ts            # 認證相關驗證
├── budgetSchemas.ts          # 預算相關驗證
├── transactionSchemas.ts     # 交易相關驗證
└── README.md                 # 本文件
```

## 使用方式

### 1. 在路由中使用

```typescript
import { Router } from 'express';
import { validate, registerSchema, loginSchema } from '../validators';
import authController from '../controllers/authController';

const router = Router();

// 使用 validate middleware 驗證請求 body
router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);

export default router;
```

### 2. 在 controller 中移除手動驗證

驗證已經在 middleware 中完成，所以 controller 可以直接使用已驗證的資料：

**之前（手動驗證）：**
```typescript
async register(req: Request, res: Response) {
  const { email, password, firstName, lastName } = req.body;
  
  // ❌ 不需要了
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: 'Email and password are required',
    });
  }
  
  // ... rest of code
}
```

**現在（使用 Zod 驗證）：**
```typescript
async register(req: Request, res: Response) {
  // ✅ req.body 已經被驗證和轉換過了
  const { email, password, firstName, lastName } = req.body;
  
  // 直接使用資料
  // ... rest of code
}
```

## 可用的 Schemas

### Auth Schemas

- `registerSchema` - 用戶註冊
  - email: 必填，Email 格式
  - password: 必填，至少 6 個字元
  - firstName: 可選
  - lastName: 可選

- `loginSchema` - 用戶登入
  - email: 必填，Email 格式
  - password: 必填

- `updateProfileSchema` - 更新個人資料
  - 至少需要提供一個欄位

### Budget Schemas

- `createBudgetSchema` - 建立預算
  - name: 必填
  - amount: 必填，正數
  - period: 必填，'daily' | 'weekly' | 'monthly' | 'yearly'
  - startDate: 必填，日期
  - endDate: 可選，日期或 null

- `updateBudgetSchema` - 更新預算
  - 所有欄位都是可選的
  - 至少需要提供一個欄位

### Transaction Schemas

- `createTransactionSchema` - 建立交易
  - amount: 必填，正數
  - description: 必填
  - category: 必填
  - type: 必填，'income' | 'expense'
  - date: 可選，日期
  - budgetId: 可選

- `updateTransactionSchema` - 更新交易
  - 所有欄位都是可選的
  - 至少需要提供一個欄位

## Middleware

### `validate(schema)`

驗證請求的 `req.body`。

```typescript
router.post('/budgets', validate(createBudgetSchema), controller.create);
```

### `validateQuery(schema)`

驗證請求的 `req.query`（查詢參數）。

```typescript
const querySchema = z.object({
  page: z.string().transform(Number),
  limit: z.string().transform(Number)
});

router.get('/budgets', validateQuery(querySchema), controller.list);
```

### `validateParams(schema)`

驗證請求的 `req.params`（路徑參數）。

```typescript
const paramsSchema = z.object({
  id: z.string().uuid()
});

router.get('/budgets/:id', validateParams(paramsSchema), controller.get);
```

## 錯誤回應格式

當驗證失敗時，會回傳 400 Bad Request：

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

## 新增自訂 Schema

1. 在對應的 schema 檔案中定義：

```typescript
export const myCustomSchema = z.object({
  field1: z.string(),
  field2: z.number(),
});

export type MyCustomInput = z.infer<typeof myCustomSchema>;
```

2. 在 `index.ts` 中匯出：

```typescript
export { myCustomSchema, type MyCustomInput } from './mySchemas';
```

3. 在路由中使用：

```typescript
import { validate, myCustomSchema } from '../validators';
router.post('/endpoint', validate(myCustomSchema), controller.handler);
```

## Zod 常用功能

```typescript
// 字串
z.string()
z.string().min(5)
z.string().max(100)
z.string().email()
z.string().url()
z.string().uuid()

// 數字
z.number()
z.number().min(0)
z.number().max(100)
z.number().positive()
z.number().int()

// 日期
z.date()
z.string().datetime()

// 可選
z.string().optional()
z.string().nullable()

// 列舉
z.enum(['option1', 'option2'])

// 聯合類型
z.union([z.string(), z.number()])

// 陣列
z.array(z.string())

// 物件
z.object({
  field: z.string()
})

// 轉換
z.string().transform((val) => parseInt(val))

// 自訂驗證
z.string().refine((val) => val.length > 0, {
  message: 'Cannot be empty'
})
```

## 參考資料

- [Zod 官方文件](https://zod.dev/)
- [Zod GitHub](https://github.com/colinhacks/zod)
