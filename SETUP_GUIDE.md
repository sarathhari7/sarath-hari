# Personal Dashboard - Complete Setup Guide

This guide will help you set up and run the complete Personal Dashboard application with frontend and backend.

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Firebase Account** - [Sign up here](https://firebase.google.com/)
- **Git** (optional, for cloning)

## 🚀 Quick Start

### Option 1: Run Both Frontend and Backend

```bash
# In the root directory
npm install    # Install root dependencies (if any)

# Terminal 1 - Start Backend
cd server
npm install
npm run seed:budget   # Seed database with sample data
npm run dev          # Start server on port 9000

# Terminal 2 - Start Frontend
cd client
npm install
npm start            # Start React app on port 9001
```

Visit `http://localhost:9001` in your browser!

### Option 2: Step-by-Step Setup

Follow the detailed instructions below.

---

## 🔧 Backend Setup

### 1. Navigate to Server Directory

```bash
cd server
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- express
- firebase-admin
- cors
- dotenv
- nodemon (dev dependency)

### 3. Configure Firebase

#### A. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Give your project a name (e.g., "personal-dashboard")
4. Follow the setup wizard

#### B. Enable Firestore

1. In Firebase Console, go to **Firestore Database**
2. Click "Create database"
3. Choose "Start in **test mode**" (for development)
4. Select a location close to you
5. Click "Enable"

#### C. Generate Service Account Key

1. Go to **Project Settings** (gear icon)
2. Navigate to **Service Accounts** tab
3. Click "Generate new private key"
4. Click "Generate key" - a JSON file will download
5. **Keep this file secure!** (Don't commit to Git)

### 4. Configure Environment Variables

#### A. Copy Example File

```bash
cp .env.example .env
```

#### B. Fill in Firebase Credentials

Open `.env` and add your Firebase credentials from the downloaded JSON file:

```env
PORT=5000
FIREBASE_PROJECT_ID=your-project-id-here
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour\nPrivate\nKey\nHere\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
```

**Important Notes:**
- The `FIREBASE_PRIVATE_KEY` must be wrapped in quotes
- Keep the `\n` characters for line breaks
- Never commit `.env` to version control

#### C. Verify Configuration

Example `.env` file structure:

```env
PORT=5000
FIREBASE_PROJECT_ID=personal-dashboard-abc123
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQC7...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-abc123@personal-dashboard-abc123.iam.gserviceaccount.com
```

### 5. Seed Database with Sample Data

```bash
npm run seed:budget
```

This creates 10 sample budget transactions:
- 2 Income sources (Salary ₹75,000 + Freelance ₹25,000)
- 4 Expenses (Rent ₹18,000 + Groceries ₹8,000 + Utilities ₹3,500 + Car Loan ₹12,000)
- 4 Savings (2 SIPs + PPF + Emergency Fund = ₹30,500)

**To reseed (clear and add fresh data):**

```bash
npm run seed:budget --force
```

### 6. Start Backend Server

#### Development mode (with auto-reload):

```bash
npm run dev
```

#### Production mode:

```bash
npm start
```

The server will start on `http://localhost:9000`

### 7. Test Backend API

```bash
# Health check
curl http://localhost:9000/health

# Get all budget transactions
curl http://localhost:9000/api/budget

# Get budget summary
curl http://localhost:9000/api/budget/summary
```

You should see JSON responses with your budget data!

---

## 💻 Frontend Setup

### 1. Navigate to Client Directory

```bash
cd client
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- TanStack React Table
- React Router
- And more...

### 3. Configure Environment Variables

#### A. Copy Example File

```bash
cp .env.example .env
```

#### B. Verify API URL

Open `.env` and ensure it points to your backend:

```env
REACT_APP_API_URL=http://localhost:9000
```

### 4. Start Frontend Application

```bash
npm start
```

The React app will:
- Compile TypeScript files
- Start development server
- Automatically open `http://localhost:9001` in your browser

### 5. Verify Connection

You should see:
- ✅ Budget Dashboard loads without errors
- ✅ Summary cards show totals (Income, Expense, Savings, Balance)
- ✅ Budget table displays 10 transactions
- ✅ No loading spinner stuck
- ✅ No error messages in console

---

## 🎯 Testing the Application

### Budget Dashboard

1. **View Transactions**: Navigate to "Budget" in sidebar
2. **Toggle View Mode**:
   - Click "Current" toggle to see today's processed transactions
   - Click "Final" toggle to see end-of-month projection
3. **Check Summary Cards**: Verify totals update based on toggle
4. **Inspect Variance**: Look for color-coded amounts (green = better, red = worse)

### Todo Management

1. Navigate to "Todos" in sidebar
2. Click "Add Todo" button
3. Fill in title, description, priority, status
4. Save and verify it appears in the grid

### Calendar

1. Click calendar icon in navbar (next to notification bell)
2. Calendar dropdown should appear
3. Select dates and navigate months

---

## 🐛 Troubleshooting

### Backend Issues

#### Issue: "Firebase initialization error"

**Solution:**
1. Check `.env` file has correct credentials
2. Ensure private key has proper `\n` line breaks
3. Verify Firebase project exists in console
4. Check Firestore is enabled

#### Issue: "Port 5000 already in use"

**Solution:**
```bash
# Change port in server/.env
PORT=3001

# Or kill process using port 9000
lsof -ti:9000 | xargs kill -9
```

#### Issue: "No transactions found" after seeding

**Solution:**
```bash
# Reseed with force flag
npm run seed:budget --force

# Or manually check Firestore Console
```

### Frontend Issues

#### Issue: Loading spinner never stops

**Solutions:**
1. Check backend is running: `curl http://localhost:9000/health`
2. Open browser console (F12) to see errors
3. Verify `.env` has correct `REACT_APP_API_URL`
4. Check CORS is enabled on backend (it should be by default)

#### Issue: "Failed to fetch" error

**Solutions:**
1. Ensure both frontend (3000) and backend (5000) are running
2. Check browser console network tab for failed requests
3. Verify backend URL in `.env`
4. Try accessing `http://localhost:9000/api/budget` directly

#### Issue: TypeScript compilation errors

**Solutions:**
```bash
# Clear cache and reinstall
rm -rf node_modules
rm package-lock.json
npm install

# Or clear TypeScript cache
rm -rf node_modules/.cache
```

---

## 📁 Project Structure

```
personal-dashboard/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── services/      # API service layer
│   │   │   ├── api.ts
│   │   │   └── budgetService.ts
│   │   ├── views/
│   │   │   └── admin/
│   │   │       ├── default/    # Budget Dashboard
│   │   │       ├── todos/      # Todo Management
│   │   │       └── profile/    # User Profile
│   │   └── components/
│   ├── .env               # Frontend config (gitignored)
│   └── package.json
│
├── server/                # Node.js Backend
│   ├── src/
│   │   ├── controllers/
│   │   │   ├── budgetController.js
│   │   │   └── todoController.js
│   │   ├── routes/
│   │   │   ├── budgetRoutes.js
│   │   │   └── todoRoutes.js
│   │   ├── config/
│   │   │   └── firebase.js
│   │   ├── scripts/
│   │   │   └── seedBudget.js
│   │   └── index.js
│   ├── .env               # Backend config (gitignored)
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## 🔐 Security Notes

### Never Commit These Files:

- ❌ `server/.env`
- ❌ `client/.env`
- ❌ Firebase service account JSON file
- ❌ `node_modules/`

### Always Commit These Files:

- ✅ `server/.env.example`
- ✅ `client/.env.example`
- ✅ `.gitignore`
- ✅ `package.json` files
- ✅ Source code

---

## 📚 API Documentation

Full API documentation is available in `/server/API_DOCUMENTATION.md`

### Quick Reference

**Budget Endpoints:**
- `GET /api/budget` - Get all transactions
- `GET /api/budget/summary` - Get totals
- `POST /api/budget` - Create transaction
- `PUT /api/budget/:id` - Update transaction
- `DELETE /api/budget/:id` - Delete transaction

**Todo Endpoints:**
- `GET /api/todos` - Get all todos
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

---

## 🎨 Customization

### Change Brand Colors

Edit `client/tailwind.config.js`:

```javascript
colors: {
  brand: {
    50: '#your-color',
    // ... other shades
    500: '#18B7BE',  // Primary brand color
    // ... other shades
  }
}
```

### Add New Budget Categories

Currently supports: Income, Expense, Savings

To add more, update:
1. `server/src/controllers/budgetController.js` - validation logic
2. `client/src/services/budgetService.ts` - TypeScript types
3. Frontend components to handle new categories

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)

1. Build production version:
```bash
cd client
npm run build
```

2. Deploy `build/` folder to:
   - [Vercel](https://vercel.com/)
   - [Netlify](https://www.netlify.com/)
   - [GitHub Pages](https://pages.github.com/)

3. Set environment variable:
   - `REACT_APP_API_URL` = your deployed backend URL

### Backend (Heroku/Railway)

1. Deploy to:
   - [Heroku](https://www.heroku.com/)
   - [Railway](https://railway.app/)
   - [Render](https://render.com/)

2. Set environment variables in deployment platform:
   - `PORT`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_PRIVATE_KEY`
   - `FIREBASE_CLIENT_EMAIL`

---

## 📞 Support

If you encounter issues:

1. Check this guide's troubleshooting section
2. Review `/server/README.md` and `/client/README.md`
3. Check API documentation in `/server/API_DOCUMENTATION.md`
4. Inspect browser console for errors (F12)
5. Check server logs in terminal

---

## 🎉 Success!

If everything is working:
- ✅ Backend running on http://localhost:9000
- ✅ Frontend running on http://localhost:9001
- ✅ Budget data loads successfully
- ✅ Todos work properly
- ✅ No console errors

You're ready to start using your Personal Dashboard! 🎊
