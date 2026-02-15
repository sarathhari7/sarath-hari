const express = require('express');
const router = express.Router();
const {
  getAllNotificationData,
  getUpcomingNotificationData,
  createNotificationPublic,
  deleteNotificationPublic
} = require('../controllers/notificationDataController');

// GET all notifications for a user
router.get('/', getAllNotificationData);

// GET upcoming notifications (next 7 days)
router.get('/upcoming', getUpcomingNotificationData);

// Blocked endpoints - return 403
router.post('/', createNotificationPublic);
router.delete('/:id', deleteNotificationPublic);

module.exports = router;
