/**
 * Date utility functions for handling dynamic dates and working days
 */

/**
 * Get the day of the week (0 = Sunday, 6 = Saturday)
 * @param {Date} date
 * @returns {number}
 */
const getDayOfWeek = (date) => {
  return date.getDay();
};

/**
 * Check if a date is a weekend (Saturday or Sunday)
 * @param {Date} date
 * @returns {boolean}
 */
const isWeekend = (date) => {
  const day = getDayOfWeek(date);
  return day === 0 || day === 6; // Sunday or Saturday
};

/**
 * Adjust date to next working day if it falls on a weekend
 * @param {Date} date
 * @returns {Date}
 */
const getNextWorkingDay = (date) => {
  const newDate = new Date(date);
  const day = getDayOfWeek(newDate);

  if (day === 6) {
    // Saturday -> add 2 days to get Monday
    newDate.setDate(newDate.getDate() + 2);
  } else if (day === 0) {
    // Sunday -> add 1 day to get Monday
    newDate.setDate(newDate.getDate() + 1);
  }

  return newDate;
};

/**
 * Adjust date to previous working day if it falls on a weekend
 * @param {Date} date
 * @returns {Date}
 */
const getPreviousWorkingDay = (date) => {
  const newDate = new Date(date);
  const day = getDayOfWeek(newDate);

  if (day === 6) {
    // Saturday -> subtract 1 day to get Friday
    newDate.setDate(newDate.getDate() - 1);
  } else if (day === 0) {
    // Sunday -> subtract 2 days to get Friday
    newDate.setDate(newDate.getDate() - 2);
  }

  return newDate;
};

/**
 * Calculate the actual due date based on date type and dynamic rule
 * @param {number} dueDay - Day of month (1-31)
 * @param {number} year - Year
 * @param {number} month - Month (1-12)
 * @param {string} dateType - 'fixed' or 'dynamic'
 * @param {string} dynamicDateRule - 'next' or 'previous' (only used if dateType is 'dynamic')
 * @returns {Date}
 */
const calculateActualDueDate = (dueDay, year, month, dateType = 'fixed', dynamicDateRule = 'next') => {
  // Create date with the specified day (month is 0-indexed in JS Date)
  const date = new Date(year, month - 1, dueDay);

  // If fixed date type, return as is
  if (dateType === 'fixed') {
    return date;
  }

  // If dynamic and falls on weekend, adjust based on rule
  if (dateType === 'dynamic' && isWeekend(date)) {
    if (dynamicDateRule === 'next') {
      return getNextWorkingDay(date);
    } else if (dynamicDateRule === 'previous') {
      return getPreviousWorkingDay(date);
    }
  }

  return date;
};

/**
 * Format date for display
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return `${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

module.exports = {
  getDayOfWeek,
  isWeekend,
  getNextWorkingDay,
  getPreviousWorkingDay,
  calculateActualDueDate,
  formatDate
};
