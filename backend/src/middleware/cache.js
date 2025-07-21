const { getCacheData, setPriceCache, getPriceCache, getJobProgress } = require('../services/cacheService');


const priceCache = async (req, res, next) => {
  try {
    const { token, network, timestamp } = req.query;
    
    if (!token || !network || !timestamp) {
      return next();
    }
    
    const cacheKey = `price:${token}:${network}:${timestamp}`;
    const cachedData = await getPriceCache(token, network, timestamp);
    
    if (cachedData) {
      console.log('Cache hit:', cacheKey);
      return res.json({
        price: cachedData.price,
        source: 'cache',
        timestamp: parseInt(timestamp),
        success: true,
      });
    }
    
    console.log('Cache miss:', cacheKey);
    next();
  } catch (error) {
    console.error('Cache middleware error:', error);
    next();
  }
};

module.exports = {
  priceCache,
};
