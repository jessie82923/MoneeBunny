# MoneeBunny API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Most endpoints require JWT authentication. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

## Authentication Endpoints

### Register
Create a new user account.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

### Login
Authenticate and receive a JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

### Get Profile
Get current user's profile. **Requires authentication.**

**Endpoint:** `GET /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  }
}
```

### Update Profile
Update current user's profile. **Requires authentication.**

**Endpoint:** `PUT /auth/profile`

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "newemail@example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "newemail@example.com",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "message": "Profile updated successfully"
}
```

### Logout
Logout user (client should remove token). **Requires authentication.**

**Endpoint:** `POST /auth/logout`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## Budget Endpoints

All budget endpoints require authentication.

### Create Budget
**Endpoint:** `POST /budgets`

**Request Body:**
```json
{
  "name": "Monthly Groceries",
  "amount": "500.00",
  "period": "monthly",
  "startDate": "2025-10-01",
  "endDate": "2025-10-31"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Monthly Groceries",
    "amount": "500.00",
    "period": "monthly",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T00:00:00.000Z",
    "userId": "clxxx...",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  },
  "message": "Budget created successfully"
}
```

### Get All Budgets
**Endpoint:** `GET /budgets`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "Monthly Groceries",
      "amount": "500.00",
      "period": "monthly",
      "startDate": "2025-10-01T00:00:00.000Z",
      "endDate": "2025-10-31T00:00:00.000Z",
      "transactions": []
    }
  ]
}
```

### Get Budget by ID
**Endpoint:** `GET /budgets/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Monthly Groceries",
    "amount": "500.00",
    "period": "monthly",
    "startDate": "2025-10-01T00:00:00.000Z",
    "endDate": "2025-10-31T00:00:00.000Z"
  }
}
```

### Update Budget
**Endpoint:** `PUT /budgets/:id`

**Request Body:**
```json
{
  "name": "Updated Budget Name",
  "amount": "600.00"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "Updated Budget Name",
    "amount": "600.00",
    "period": "monthly"
  },
  "message": "Budget updated successfully"
}
```

### Delete Budget
**Endpoint:** `DELETE /budgets/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Budget deleted successfully"
}
```

---

## Transaction Endpoints

All transaction endpoints require authentication.

### Add Transaction
**Endpoint:** `POST /transactions`

**Request Body:**
```json
{
  "amount": "45.50",
  "description": "Grocery shopping",
  "category": "food",
  "type": "expense",
  "date": "2025-10-15",
  "budgetId": "clxxx..."
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "amount": "45.50",
    "description": "Grocery shopping",
    "category": "food",
    "type": "expense",
    "date": "2025-10-15T00:00:00.000Z",
    "userId": "clxxx...",
    "budgetId": "clxxx...",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  },
  "message": "Transaction added successfully"
}
```

### Get All Transactions
**Endpoint:** `GET /transactions`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "amount": "45.50",
      "description": "Grocery shopping",
      "category": "food",
      "type": "expense",
      "date": "2025-10-15T00:00:00.000Z",
      "budget": {
        "id": "clxxx...",
        "name": "Monthly Groceries"
      }
    }
  ]
}
```

### Get Transaction by ID
**Endpoint:** `GET /transactions/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "amount": "45.50",
    "description": "Grocery shopping",
    "category": "food",
    "type": "expense",
    "date": "2025-10-15T00:00:00.000Z"
  }
}
```

### Update Transaction
**Endpoint:** `PUT /transactions/:id`

**Request Body:**
```json
{
  "amount": "50.00",
  "description": "Updated description"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "amount": "50.00",
    "description": "Updated description",
    "category": "food",
    "type": "expense"
  },
  "message": "Transaction updated successfully"
}
```

### Delete Transaction
**Endpoint:** `DELETE /transactions/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## User Endpoints

All user endpoints require authentication.

### Get User Profile
**Endpoint:** `GET /users/:id`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "createdAt": "2025-10-15T00:00:00.000Z",
    "updatedAt": "2025-10-15T00:00:00.000Z"
  }
}
```

### Update User Profile
**Endpoint:** `PUT /users/:id`

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "email": "user@example.com",
    "firstName": "Jane",
    "lastName": "Smith"
  },
  "message": "User profile updated successfully"
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid input data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Unauthorized"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "Forbidden: You can only access your own resources"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Email already registered"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error message"
}
```

---

## Notes

- All dates should be in ISO 8601 format
- Amounts should be decimal strings (e.g., "45.50")
- JWT tokens expire after 24 hours
- Password requirements: minimum 8 characters (implement validation as needed)
- All endpoints use JSON for request and response bodies
