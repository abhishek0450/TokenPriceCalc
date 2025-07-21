const dbService = require('./dbService');

/**
 * Interpolate price between two known price points
 * @param {number} queryTimestamp - Timestamp to interpolate for
 * @param {number} beforeTimestamp - Earlier timestamp with known price
 * @param {number} beforePrice - Price at earlier timestamp
 * @param {number} afterTimestamp - Later timestamp with known price
 * @param {number} afterPrice - Price at later timestamp
 * @returns {number} Interpolated price
 */
const interpolatePrice = (
  queryTimestamp,
  beforeTimestamp,
  beforePrice,
  afterTimestamp,
  afterPrice
) => {
  // Check if timestamps are valid
  if (queryTimestamp < beforeTimestamp || queryTimestamp > afterTimestamp) {
    throw new Error('Query timestamp out of range');
  }
  
  // If query matches a known timestamp, return that price
  if (queryTimestamp === beforeTimestamp) return beforePrice;
  if (queryTimestamp === afterTimestamp) return afterPrice;
  
  // Calculate the ratio based on timestamps
  const ratio = (queryTimestamp - beforeTimestamp) / (afterTimestamp - beforeTimestamp);
  
  // weighted interpolation formula
  // before_price + (after_price - before_price) * ratio
  return beforePrice + (afterPrice - beforePrice) * ratio;
};


const getInterpolatedPrice = async (token, network, timestamp) => {
  try {
    // Find the nearest price points
    const beforePrice = await dbService.findPriceBefore(token, network, timestamp);
    const afterPrice = await dbService.findPriceAfter(token, network, timestamp);
    
    console.log(`Interpolation search for ${token} on ${network} at timestamp ${timestamp}:`);
    console.log(`- Before price found: ${beforePrice ? 'Yes, timestamp ' + beforePrice.timestamp : 'No'}`);
    console.log(`- After price found: ${afterPrice ? 'Yes, timestamp ' + afterPrice.timestamp : 'No'}`);
    
    if (!beforePrice && !afterPrice) {
      throw new Error('No price data available for interpolation');
    }
    
    if (!afterPrice) {
      return {
        price: beforePrice.price,
        source: 'interpolated',
        baseTimestamp: beforePrice.timestamp,
      };
    }
    
    if (!beforePrice) {
      return {
        price: afterPrice.price,
        source: 'interpolated',
        baseTimestamp: afterPrice.timestamp,
      };
    }
    
    // Interpolate between the two points
    const interpolatedPrice = interpolatePrice(
      timestamp,
      beforePrice.timestamp,
      beforePrice.price,
      afterPrice.timestamp,
      afterPrice.price
    );
    
    return {
      price: interpolatedPrice,
      source: 'interpolated',
      beforeTimestamp: beforePrice.timestamp,
      afterTimestamp: afterPrice.timestamp,
    };
  } catch (error) {
    console.error('Error getting interpolated price:', error);
    throw error;
  }
};

module.exports = {
  interpolatePrice,
  getInterpolatedPrice,
};
