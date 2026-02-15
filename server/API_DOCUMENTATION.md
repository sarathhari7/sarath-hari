# Personal Dashboard API Documentation

## Base URL
```
http://localhost:9000
```

## Authentication
Currently, no authentication is required (development phase).

---

## Budget API Endpoints

### 1. Get All Budget Transactions
**GET** `/api/budget`

Returns all budget transactions ordered by due date.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id",
      "source": "Monthly Salary",
      "category": "Income",
      "purpose": "Primary income source",
      "dueDate": "01",
      "expectedAmount": 75000,
      "amount": 75000,
      "createdAt": "2024-02-11T00:00:00.000Z",
      "updatedAt": "2024-02-11T00:00:00.000Z"
    }
  ]
}
```

---

### 2. Get Budget Summary
**GET** `/api/budget/summary`

Returns aggregated totals for all categories and balance.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 95000,
    "totalExpense": 41500,
    "totalSavings": 30500,
    "balance": 23000
  }
}
```

---

### 3. Get Transactions by Category
**GET** `/api/budget/category/:category`

Returns all transactions for a specific category (Income, Expense, or Savings).

**Parameters:**
- `category` (path param): Must be one of: `Income`, `Expense`, `Savings`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "doc_id",
      "source": "Monthly Salary",
      "category": "Income",
      "purpose": "Primary income source",
      "dueDate": "01",
      "expectedAmount": 75000,
      "amount": 75000
    }
  ]
}
```

---

### 4. Get Single Transaction
**GET** `/api/budget/:id`

Returns a single transaction by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "source": "Monthly Salary",
    "category": "Income",
    "purpose": "Primary income source",
    "dueDate": "01",
    "expectedAmount": 75000,
    "amount": 75000
  }
}
```

---

### 5. Create Budget Transaction
**POST** `/api/budget`

Creates a new budget transaction.

**Required Fields:**
- `source` (string): Name of the transaction
- `category` (string): Must be `Income`, `Expense`, or `Savings`
- `purpose` (string): Description of the transaction
- `dueDate` (string): Day of month (01-31)
- `amount` (number): Actual transaction amount

**Optional Fields:**
- `target` (number): For SIPs - target amount
- `currentAmount` (number): For SIPs - current accumulated amount
- `stepupDate` (string): For SIPs - month when to increase amount (e.g., "March")
- `stepupAmount` (number): For SIPs - amount to increase by
- `expectedAmount` (number): Budgeted/expected amount

**Request Body:**
```json
{
  "source": "SIP - Equity Fund",
  "category": "Savings",
  "purpose": "Long-term wealth creation",
  "target": 500000,
  "currentAmount": 85000,
  "stepupDate": "March",
  "stepupAmount": 500,
  "dueDate": "10",
  "expectedAmount": 5000,
  "amount": 5000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "new_doc_id",
    "source": "SIP - Equity Fund",
    "category": "Savings",
    "purpose": "Long-term wealth creation",
    "target": 500000,
    "currentAmount": 85000,
    "stepupDate": "March",
    "stepupAmount": 500,
    "dueDate": "10",
    "expectedAmount": 5000,
    "amount": 5000,
    "createdAt": "2024-02-11T00:00:00.000Z",
    "updatedAt": "2024-02-11T00:00:00.000Z"
  }
}
```

---

### 6. Update Budget Transaction
**PUT** `/api/budget/:id`

Updates an existing budget transaction. All fields are optional.

**Request Body:**
```json
{
  "amount": 5500,
  "currentAmount": 90000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "doc_id",
    "source": "SIP - Equity Fund",
    "amount": 5500,
    "currentAmount": 90000,
    "updatedAt": "2024-02-11T01:00:00.000Z"
  }
}
```

---

### 7. Delete Budget Transaction
**DELETE** `/api/budget/:id`

Deletes a budget transaction.

**Response:**
```json
{
  "success": true,
  "message": "Transaction deleted successfully"
}
```

---

## Todo API Endpoints

### Get All Todos
**GET** `/api/todos`

### Get Single Todo
**GET** `/api/todos/:id`

### Create Todo
**POST** `/api/todos`

### Update Todo
**PUT** `/api/todos/:id`

### Delete Todo
**DELETE** `/api/todos/:id`

---

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**Common Error Status Codes:**
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error

---

## Database Structure

### Firebase Firestore Collections

#### budgetTransactions Collection
```javascript
{
  source: string,              // Required
  category: string,            // Required - "Income" | "Expense" | "Savings"
  purpose: string,             // Required
  target: number,              // Optional - For SIPs
  currentAmount: number,       // Optional - For SIPs
  stepupDate: string,          // Optional - For SIPs
  stepupAmount: number,        // Optional - For SIPs
  dueDate: string,             // Required - Day of month
  expectedAmount: number,      // Optional - Budgeted amount
  amount: number,              // Required - Actual amount
  createdAt: string,           // Auto-generated ISO timestamp
  updatedAt: string            // Auto-generated ISO timestamp
}
```

#### todos Collection
```javascript
{
  title: string,               // Required
  description: string,         // Optional
  status: string,              // "pending" | "in-progress" | "completed"
  priority: string,            // "low" | "medium" | "high"
  completed: boolean,          // true | false
  createdAt: string,           // Auto-generated ISO timestamp
  updatedAt: string            // Auto-generated ISO timestamp
}
```
