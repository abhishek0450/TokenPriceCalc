// Validate token address format
const isValidAddress = (address) => {
  if (!address) return false;
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Validate network
const isValidNetwork = (network) => {
  if (!network) return false;
  return ['ethereum', 'polygon'].includes(network.toLowerCase());
};

// Validate timestamp
const isValidTimestamp = (timestamp) => {
  if (!timestamp) return false;
  
  const ts = parseInt(timestamp);
  
  // Check if it's a valid number
  if (isNaN(ts)) return false;
  
  // Check if it's a reasonable timestamp (2009-01-03 to 10 years in the future)
  const bitcoinGenesis = 1230768000; // 2009-01-03
  const tenYearsInFuture = Math.floor(Date.now() / 1000) + 10 * 365 * 24 * 60 * 60;
  
  return ts >= bitcoinGenesis && ts <= tenYearsInFuture;
};

// Validate all price query parameters
const validatePriceQuery = (token, network, timestamp) => {
  const errors = [];
  
  if (!isValidAddress(token)) {
    errors.push('Invalid token address format');
  }
  
  if (!isValidNetwork(network)) {
    errors.push('Invalid network. Must be "ethereum" or "polygon"');
  }
  
  if (!isValidTimestamp(timestamp)) {
    errors.push('Invalid timestamp');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};

module.exports = {
  isValidAddress,
  isValidNetwork,
  isValidTimestamp,
  validatePriceQuery,
};
