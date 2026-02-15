# Personal Dashboard Backend API

Node.js/Express backend with Firebase Firestore for the Personal Dashboard application.

## Features

- **Todo Management**: Full CRUD operations for todos
- **Budget Tracking**: Manage income, expenses, and savings
- **Budget Summary**: Get aggregated totals and balance
- **Category Filtering**: Filter transactions by Income/Expense/Savings
- **Firebase Firestore**: Scalable NoSQL database

## Prerequisites

- Node.js (v14 or higher)
- Firebase account with Firestore database enabled
- Firebase service account credentials

## Installation

1. Install dependencies:
```bash
cd server
npm install
```

2. Set up Firebase credentials:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Download the JSON file

3. Configure environment variables:
   - Copy `.env.example` to `.env`
   - Fill in your Firebase credentials from the downloaded JSON:
```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start on `http://localhost:9000` (or the port specified in `.env`)

## Database Setup

### Seed Budget Data

To populate the database with sample budget transactions:

```bash
npm run seed:budget
```

This will create 10 sample transactions including:
- 2 Income sources (Salary, Freelance)
- 4 Expenses (Rent, Groceries, Utilities, Car Loan)
- 4 Savings (SIPs, PPF, Emergency Fund)

To force reseed (clear existing data and add new):
```bash
npm run seed:budget --force
```

## API Endpoints

### Budget API

#### Get all transactions
```bash
GET /api/budget
```

#### Get budget summary
```bash
GET /api/budget/summary
```

#### Get transactions by category
```bash
GET /api/budget/category/Income
GET /api/budget/category/Expense
GET /api/budget/category/Savings
```

#### Get single transaction
```bash
GET /api/budget/:id
```

#### Create transaction
```bash
POST /api/budget
Content-Type: application/json

{
  "source": "Monthly Salary",
  "category": "Income",
  "purpose": "Primary income source",
  "dueDate": "01",
  "expectedAmount": 75000,
  "amount": 75000
}
```

#### Update transaction
```bash
PUT /api/budget/:id
Content-Type: application/json

{
  "amount": 76000
}
```

#### Delete transaction
```bash
DELETE /api/budget/:id
```

### Todo API

#### Get all todos
```bash
GET /api/todos
```

#### Get single todo
```bash
GET /api/todos/:id
```

#### Create todo
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Complete budget review",
  "description": "Review all transactions for the month",
  "status": "pending",
  "priority": "high"
}
```

#### Update todo
```bash
PUT /api/todos/:id
Content-Type: application/json

{
  "completed": true,
  "status": "completed"
}
```

#### Delete todo
```bash
DELETE /api/todos/:id
```

### Health Check
```bash
GET /health
```

## Testing the API

### Using cURL

```bash
# Get all budget transactions
curl http://localhost:9000/api/budget

# Get budget summary
curl http://localhost:9000/api/budget/summary

# Create a new transaction
curl -X POST http://localhost:9000/api/budget \
  -H "Content-Type: application/json" \
  -d '{
    "source": "Bonus",
    "category": "Income",
    "purpose": "Annual bonus",
    "dueDate": "15",
    "amount": 50000
  }'
```

### Using Postman or Thunder Client

1. Import the endpoints from `API_DOCUMENTATION.md`
2. Set base URL: `http://localhost:9000`
3. Test each endpoint with sample data

## Database Structure

### Collections

#### budgetTransactions
```javascript
{
  id: string (auto-generated),
  source: string,
  category: "Income" | "Expense" | "Savings",
  purpose: string,
  target?: number,
  currentAmount?: number,
  stepupDate?: string,
  stepupAmount?: number,
  dueDate: string,
  expectedAmount?: number,
  amount: number,
  createdAt: string (ISO timestamp),
  updatedAt: string (ISO timestamp)
}
```

#### todos
```javascript
{
  id: string (auto-generated),
  title: string,
  description: string,
  status: "pending" | "in-progress" | "completed",
  priority: "low" | "medium" | "high",
  completed: boolean,
  createdAt: string (ISO timestamp),
  updatedAt: string (ISO timestamp)
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| PORT | Server port (default: 5000) | No |
| FIREBASE_PROJECT_ID | Firebase project ID | Yes |
| FIREBASE_PRIVATE_KEY | Firebase service account private key | Yes |
| FIREBASE_CLIENT_EMAIL | Firebase service account email | Yes |

## Error Handling

All API responses follow this format:

**Success Response:**
```json
{
  "success": true,
  "data": { /* response data */ }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

**HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── firebase.js          # Firebase initialization
│   ├── controllers/
│   │   ├── todoController.js    # Todo business logic
│   │   └── budgetController.js  # Budget business logic
│   ├── routes/
│   │   ├── todoRoutes.js        # Todo API routes
│   │   └── budgetRoutes.js      # Budget API routes
│   ├── scripts/
│   │   └── seedBudget.js        # Database seed script
│   └── index.js                 # Main server file
├── .env                         # Environment variables (gitignored)
├── .env.example                 # Example environment file
├── package.json
├── API_DOCUMENTATION.md         # Full API documentation
└── README.md                    # This file
```

## Troubleshooting

### Firebase Connection Issues

If you get Firebase authentication errors:
1. Check that your `.env` file has correct credentials
2. Ensure the private key has proper newline characters (`\n`)
3. Verify your Firebase project has Firestore enabled
4. Check that your service account has proper permissions

### CORS Issues

If you get CORS errors:
- The server is configured to allow all origins in development
- For production, update the CORS configuration in `src/index.js`

### Port Already in Use

If port 9000 is already in use:
```bash
# Change the port in .env file
PORT=3001
```

## Development

### Adding New Endpoints

1. Create/update controller in `src/controllers/`
2. Create/update routes in `src/routes/`
3. Register routes in `src/index.js`
4. Update `API_DOCUMENTATION.md`

### Database Indexes

For better query performance, create indexes in Firebase Console:
- `budgetTransactions`: Index on `dueDate` (Ascending)
- `budgetTransactions`: Index on `category` (Ascending)
- `todos`: Index on `createdAt` (Descending)

## License

ISC
