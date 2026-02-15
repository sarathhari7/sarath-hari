/**
 * Budget Model - Month key utilities for month-based budget tracking
 */

/**
 * Generate month key in YYYY-MM format
 * @param {number} year - Year (e.g., 2026)
 * @param {number} month - Month (1-12)
 * @returns {string} Month key (e.g., "2026-02")
 */
const getMonthKey = (year, month) => {
  return `${year}-${String(month).padStart(2, '0')}`;
};

/**
 * Get current month key
 * @returns {string} Current month key (e.g., "2026-02")
 */
const getCurrentMonthKey = () => {
  const now = new Date();
  return getMonthKey(now.getFullYear(), now.getMonth() + 1);
};

/**
 * Parse month key into year and month components
 * @param {string} key - Month key (e.g., "2026-02")
 * @returns {{year: number, month: number}} Parsed year and month
 */
const parseMonthKey = (key) => {
  const [year, month] = key.split('-');
  return { year: parseInt(year), month: parseInt(month) };
};

/**
 * Get next month key
 * @param {string} key - Current month key
 * @returns {string} Next month key
 */
const getNextMonthKey = (key) => {
  const { year, month } = parseMonthKey(key);
  if (month === 12) {
    return getMonthKey(year + 1, 1);
  }
  return getMonthKey(year, month + 1);
};

/**
 * Get previous month key
 * @param {string} key - Current month key
 * @returns {string} Previous month key
 */
const getPreviousMonthKey = (key) => {
  const { year, month } = parseMonthKey(key);
  if (month === 1) {
    return getMonthKey(year - 1, 12);
  }
  return getMonthKey(year, month - 1);
};

/**
 * Check if month is in the future
 * @param {string} key - Month key to check
 * @returns {boolean} True if future month
 */
const isFutureMonth = (key) => {
  const current = getCurrentMonthKey();
  return key > current;
};

/**
 * Check if month is in the past
 * @param {string} key - Month key to check
 * @returns {boolean} True if past month
 */
const isPastMonth = (key) => {
  const current = getCurrentMonthKey();
  return key < current;
};

/**
 * Check if month is the current month
 * @param {string} key - Month key to check
 * @returns {boolean} True if current month
 */
const isCurrentMonth = (key) => {
  return key === getCurrentMonthKey();
};

module.exports = {
  getMonthKey,
  getCurrentMonthKey,
  parseMonthKey,
  getNextMonthKey,
  getPreviousMonthKey,
  isFutureMonth,
  isPastMonth,
  isCurrentMonth
};
