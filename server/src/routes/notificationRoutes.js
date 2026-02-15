const express = require('express');
const router = express.Router();
const {
  getAllNotifications,
  getUnreadCount,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
} = require('../controllers/notificationController');

// Get all notifications
router.get('/', getAllNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Create new notification
router.post('/', createNotification);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all read notifications
router.delete('/read-all', deleteAllRead);

module.exports = router;
