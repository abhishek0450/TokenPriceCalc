// Format date as YYYY-MM-DD
const formatDate = (timestamp) => {
  const date = new Date(timestamp * 1000);
  return date.toISOString().split('T')[0];
};

// Convert date string to Unix timestamp
const dateToTimestamp = (dateString) => {
  return Math.floor(new Date(dateString).getTime() / 1000);
};

// Generate timestamp for start of day
const getStartOfDayTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  date.setUTCHours(0, 0, 0, 0);
  return Math.floor(date.getTime() / 1000);
};

// Generate timestamp for end of day
const getEndOfDayTimestamp = (timestamp) => {
  const date = new Date(timestamp * 1000);
  date.setUTCHours(23, 59, 59, 999);
  return Math.floor(date.getTime() / 1000);
};

// Check if timestamp is for a weekend day
const isWeekend = (timestamp) => {
  const date = new Date(timestamp * 1000);
  const day = date.getDay();
  // 0 is Sunday, 6 is Saturday
  return day === 0 || day === 6;
};

// Get nearest business day timestamp
const getNearestBusinessDay = (timestamp, direction = 'before') => {
  const date = new Date(timestamp * 1000);
  const day = date.getDay();
  
  if (day === 0) { 
    if (direction === 'before') {
      date.setDate(date.getDate() - 2);
    } else {
      date.setDate(date.getDate() + 1);
    }
  } else if (day === 6) { 
    if (direction === 'before') {
      date.setDate(date.getDate() - 1);
    } else {
      date.setDate(date.getDate() + 2);
    }
  }
  
  return Math.floor(date.getTime() / 1000);
};

module.exports = {
  formatDate,
  dateToTimestamp,
  getStartOfDayTimestamp,
  getEndOfDayTimestamp,
  isWeekend,
  getNearestBusinessDay,
};
