const express = require('express');
const router = express.Router();
const {
  getAllEventData,
  getEventsByMonth,
  createEventPublic,
  deleteEventPublic
} = require('../controllers/eventDataController');

// GET all events for a user
router.get('/', getAllEventData);

// GET events for a specific month
router.get('/month/:year/:month', getEventsByMonth);

// Blocked endpoints - return 403
router.post('/', createEventPublic);
router.delete('/:id', deleteEventPublic);

module.exports = router;
