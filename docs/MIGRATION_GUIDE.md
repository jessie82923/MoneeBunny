# API 端點變更說明

## 變更摘要

將 **用戶個人資料管理** 從 `/api/auth` 移至 `/api/users`，遵循業界標準的 RESTful 設計。

---

## ⚠️ 重大變更（Breaking Changes）

### 1. Profile 端點遷移

#### 舊的端點（已廢棄）
```http
GET  /api/auth/profile
PUT  /api/auth/profile
```

#### 新的端點（當前）
```http
GET  /api/users/me
PUT  /api/users/me
```

---

## 詳細對照表

### Authentication Routes (`/api/auth`)

| HTTP 方法 | 舊端點              | 新端點           | 狀態     | 說明       |
|-----------|---------------------|------------------|----------|------------|
| POST      | `/auth/register`    | `/auth/register` | ✅ 不變   | 用戶註冊   |
| POST      | `/auth/login`       | `/auth/login`    | ✅ 不變   | 用戶登入   |
| POST      | `/auth/logout`      | `/auth/logout`   | ✅ 不變   | 用戶登出   |
| GET       | `/auth/profile`     | **已移除**       | ❌ 廢棄   | 改用 `/users/me` |
| PUT       | `/auth/profile`     | **已移除**       | ❌ 廢棄   | 改用 `/users/me` |

---

### User Routes (`/api/users`)

| HTTP 方法 | 端點          | 說明                           | 認證需求 |
|-----------|---------------|--------------------------------|----------|
| GET       | `/users/me`   | 取得當前登入用戶資料           | ✅ Bearer Token |
| PUT       | `/users/me`   | 更新當前登入用戶資料           | ✅ Bearer Token |
| GET       | `/users/:id`  | 取得指定用戶資料（管理員功能） | ✅ Bearer Token |
| PUT       | `/users/:id`  | 更新指定用戶資料（管理員功能） | ✅ Bearer Token |

---

## 遷移指南

### 前端 JavaScript/TypeScript

#### 取得當前用戶資料

**舊的寫法（已廢棄）**：
```javascript
const response = await fetch('/api/auth/profile', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

**新的寫法**：
```javascript
const response = await fetch('/api/users/me', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`,
  },
});
```

---

#### 更新當前用戶資料

**舊的寫法（已廢棄）**：
```javascript
const response = await fetch('/api/auth/profile', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Updated',
    lastName: 'Name',
  }),
});
```

**新的寫法**：
```javascript
const response = await fetch('/api/users/me', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    firstName: 'Updated',
    lastName: 'Name',
  }),
});
```

---

### Axios 範例

**舊的寫法（已廢棄）**：
```javascript
// 取得 profile
axios.get('/api/auth/profile', {
  headers: { Authorization: `Bearer ${token}` }
});

// 更新 profile
axios.put('/api/auth/profile', 
  { firstName: 'New', lastName: 'Name' },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

**新的寫法**：
```javascript
// 取得當前用戶資料
axios.get('/api/users/me', {
  headers: { Authorization: `Bearer ${token}` }
});

// 更新當前用戶資料
axios.put('/api/users/me', 
  { firstName: 'New', lastName: 'Name' },
  { headers: { Authorization: `Bearer ${token}` } }
);
```

---

### React Hooks 範例

**舊的寫法（已廢棄）**：
```typescript
const useProfile = () => {
  const [profile, setProfile] = useState(null);
  
  useEffect(() => {
    fetch('/api/auth/profile', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setProfile(data.data));
  }, []);
  
  return profile;
};
```

**新的寫法**：
```typescript
const useCurrentUser = () => {
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    fetch('/api/users/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUser(data.data));
  }, []);
  
  return user;
};
```

---

## 為什麼要變更？

### 問題分析

**舊架構**：
```
/api/auth
  ├─ POST /register       ✅ 認證
  ├─ POST /login          ✅ 認證
  ├─ POST /logout         ✅ 認證
  ├─ GET  /profile        ⚠️  用戶資料管理（職責混亂）
  └─ PUT  /profile        ⚠️  用戶資料管理（職責混亂）

/api/users
  ├─ GET  /:id            ⚠️  功能重複
  └─ PUT  /:id            ⚠️  功能重複
```

**問題**：
1. `/auth` 路由同時處理「認證」和「用戶管理」，違反單一職責原則
2. `/profile` 和 `/:id` 功能重複
3. 不符合 RESTful 資源導向設計

---

### 新架構優點

```
/api/auth              → 純認證操作（清晰）
  ├─ POST /register
  ├─ POST /login
  └─ POST /logout

/api/users             → 用戶資源管理（RESTful）
  ├─ GET  /me          → 當前用戶（業界標準）
  ├─ PUT  /me
  ├─ GET  /:id         → 管理員功能
  └─ PUT  /:id
```

**優點**：
✅ 職責清晰：認證 vs 資源管理  
✅ 符合 RESTful 標準  
✅ 支援未來擴展（管理員功能）  
✅ 遵循業界慣例（Firebase、GitHub API、Auth0）  

---

## 回應格式（不變）

### 成功回應
```json
{
  "success": true,
  "data": {
    "id": "cm1a2b3c4",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  "message": "Profile updated successfully"
}
```

### 錯誤回應
```json
{
  "success": false,
  "error": "Authentication required"
}
```

---

## 常見問題

### Q1: 為什麼使用 `/me` 而非 `/profile`？

**A**: `/me` 是業界標準端點，廣泛用於：
- GitHub API: `GET /user`
- Spotify API: `GET /me`
- Facebook Graph API: `GET /me`
- Google APIs: 使用 `me` 作為用戶 ID

這是 RESTful 設計的最佳實踐，表示「當前認證用戶」。

---

### Q2: `/:id` 端點的用途？

**A**: 預留給未來的管理員功能：
- 管理員查看任意用戶資料
- 管理員更新用戶資訊
- 系統內部服務調用

一般用戶只能訪問 `/me`，不能訪問其他用戶的 `/:id`。

---

### Q3: 舊端點還能用嗎？

**A**: ❌ 不能。舊的 `/api/auth/profile` 端點已完全移除，會回傳 404 錯誤。

請立即更新前端代碼使用新端點 `/api/users/me`。

---

### Q4: 需要修改認證 token 嗎？

**A**: ✅ 不需要。JWT token 的格式和驗證方式完全不變，只需修改 API 端點 URL。

---

## 時間軸

| 日期 | 事件 |
|------|------|
| 2024 年 | 重構完成，舊端點已移除 |
| 現在 | 所有測試通過，新架構上線 |

---

## 需要協助？

如有任何遷移問題，請參考：
- [架構文件](./ARCHITECTURE.md)
- [API 文件](./API_DOCUMENTATION.md)
- [驗證系統說明](../src/validators/README.md)
