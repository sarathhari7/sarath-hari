// Priority levels for notifications and events
const PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Repeat types for recurring items
const REPEAT_TYPE = {
  NONE: 'none',        // One-time only
  MONTHLY: 'monthly'   // Recurring monthly (for budget items)
};

// Source types for tracking where notifications/events come from
const SOURCE_TYPE = {
  BUDGET: 'budget',
  TODO: 'todo',
  RECIPE: 'recipe'
};

// Validation helpers
const isValidPriority = (priority) => {
  return Object.values(PRIORITY).includes(priority);
};

const isValidRepeatType = (repeatType) => {
  return Object.values(REPEAT_TYPE).includes(repeatType);
};

const isValidSourceType = (sourceType) => {
  return Object.values(SOURCE_TYPE).includes(sourceType);
};

module.exports = {
  PRIORITY,
  REPEAT_TYPE,
  SOURCE_TYPE,
  isValidPriority,
  isValidRepeatType,
  isValidSourceType
};
