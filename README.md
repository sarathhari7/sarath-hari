# Personal Dashboard

A full-stack Personal Dashboard application with React (TypeScript) frontend and Node.js backend using Firebase Firestore.

## Features

- **Todo Management**: Create, Read, Update, and Delete todos
- Mark todos as complete/incomplete
- Priority levels (Low, Medium, High)
- Clean and modern UI using Horizon UI
- Firebase Firestore database
- RESTful API backend
- Expandable with more features (NFT Marketplace, Data Tables, etc.)

## Tech Stack

### Frontend
- React 19 with TypeScript
- Tailwind CSS
- Chakra UI components
- Horizon UI template

### Backend
- Node.js with Express
- Firebase Admin SDK
- Firestore database

## Prerequisites

Before running this application, make sure you have:

1. Node.js (v14 or higher) installed
2. A Firebase project set up
3. Firebase service account credentials

## Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. Go to Project Settings > Service Accounts
4. Click "Generate New Private Key"
5. Save the downloaded JSON file securely

## Installation

### 1. Install all dependencies

From the root directory, run:

```bash
npm run install-all
```

This will install dependencies for both the root, server, and client.

### 2. Configure Firebase

1. Navigate to the server directory:
```bash
cd server
```

2. Copy the `.env.example` to `.env`:
```bash
cp .env.example .env
```

3. Edit the `.env` file and add your Firebase credentials:
```
PORT=5000
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
```

**Note:** You can find these values in the Firebase service account JSON file you downloaded:
- `project_id` → `FIREBASE_PROJECT_ID`
- `private_key` → `FIREBASE_PRIVATE_KEY`
- `client_email` → `FIREBASE_CLIENT_EMAIL`

## Running the Application

### Option 1: Run everything with one command (Recommended)

From the root directory:

```bash
npm start
```

This will start both the backend server (port 5000) and the frontend React app (port 3000).

### Option 2: Run servers separately

**Terminal 1 - Backend:**
```bash
cd server
npm start
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

## API Endpoints

The backend API runs on `http://localhost:5000`

### Todos Endpoints

- `GET /api/todos` - Get all todos
- `GET /api/todos/:id` - Get a single todo
- `POST /api/todos` - Create a new todo
- `PUT /api/todos/:id` - Update a todo
- `DELETE /api/todos/:id` - Delete a todo

### Example Request Body (POST/PUT)

```json
{
  "title": "Complete project",
  "description": "Finish the todo application",
  "priority": "high"
}
```

## Project Structure

```
Sarath Hari/
├── client/                 # React frontend
│   ├── src/
│   │   ├── views/
│   │   │   └── admin/
│   │   │       └── todos/  # Todo page component
│   │   ├── routes.tsx      # App routes
│   │   └── ...
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/
│   │   │   └── firebase.js # Firebase configuration
│   │   ├── controllers/
│   │   │   └── todoController.js
│   │   ├── routes/
│   │   │   └── todoRoutes.js
│   │   └── index.js        # Main server file
│   ├── .env.example
│   └── package.json
├── package.json            # Root package with run scripts
└── README.md
```

## Accessing the Application

Once both servers are running:

- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend API: [http://localhost:5000](http://localhost:5000)
- Health Check: [http://localhost:5000/health](http://localhost:5000/health)

Navigate to the Todos page from the sidebar to start managing your todos!

## Development

To run in development mode with auto-reload:

```bash
npm run dev
```

This uses nodemon for the backend to auto-restart on file changes.

## Troubleshooting

### Firebase Connection Issues
- Ensure your Firebase credentials in `.env` are correct
- Check that your Firebase project has Firestore enabled
- Verify the private key is properly formatted with `\n` for line breaks

### Port Conflicts
- If port 5000 or 3000 is already in use, you can change them:
  - Backend: Edit `PORT` in `server/.env`
  - Frontend: Create a `.env` file in the client folder with `PORT=3001`

### CORS Errors
- The backend is configured to allow all origins
- If you still face issues, check the CORS configuration in `server/src/index.js`

## License

ISC
