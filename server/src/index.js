require('dotenv').config();
const express = require('express');
const cors = require('cors');
const todoRoutes = require('./routes/todoRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const cookingSessionRoutes = require('./routes/cookingSessionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const notificationDataRoutes = require('./routes/notificationDataRoutes');
const eventDataRoutes = require('./routes/eventDataRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/todos', todoRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/recipe', recipeRoutes);
app.use('/api/cooking-session', cookingSessionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/notification-data', notificationDataRoutes);
app.use('/api/event-data', eventDataRoutes);

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Personal Dashboard API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      todos: '/api/todos',
      budget: '/api/budget',
      recipe: '/api/recipe',
      cookingSession: '/api/cooking-session',
      notifications: '/api/notifications',
      notificationData: '/api/notification-data',
      eventData: '/api/event-data'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}`);
});
