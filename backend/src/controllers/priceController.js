const { getTokenPrice } = require('../services/alchemyService');
const { setPriceCache } = require('../services/cacheService');
const { getInterpolatedPrice } = require('../services/interpolationService');
const { findPriceByTimestamp, savePrice } = require('../services/dbService');
const { validatePriceQuery } = require('../utils/validation');
const { scheduleHistoryJob } = require('../workers/priceWorker');
const { getJobProgress } = require('../services/cacheService');


const getPrice = async (req, res) => {
  const { token, network, timestamp } = req.query;
  
  // Validate parameters
  const validation = validatePriceQuery(token, network, timestamp);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: validation.errors.join(', '),
    });
  }
  
  try {
    const ts = parseInt(timestamp);
    
    // Check if price exists in database
    const existingPrice = await findPriceByTimestamp(token, network, ts);
    
    if (existingPrice) {
      // Store in cache for 5 minutes
      await setPriceCache(token, network, ts, existingPrice.price, existingPrice.source);
      
      return res.json({
        price: existingPrice.price,
        source: existingPrice.source,
        timestamp: ts,
        success: true,
      });
    }
    
    // Try to get price from Alchemy
    try {
      const price = await getTokenPrice(token, network, ts);
      
      // Save to DB and cache
      await savePrice(token, network, ts, price, 'alchemy');
      await setPriceCache(token, network, ts, price, 'alchemy');
      
      return res.json({
        price,
        source: 'alchemy',
        timestamp: ts,
        success: true,
      });
    } catch (alchemyError) {
      console.error('Error getting price from Alchemy:', alchemyError.message);
      
      // If Alchemy fails, try interpolation
      try {
        const interpolated = await getInterpolatedPrice(token, network, ts);
        
        // Save to DB and cache
        await savePrice(token, network, ts, interpolated.price, 'interpolated');
        await setPriceCache(token, network, ts, interpolated.price, 'interpolated');
        
        return res.json({
          price: interpolated.price,
          source: 'interpolated',
          timestamp: ts,
          success: true,
        });
      } catch (interpolationError) {
        console.error('Error getting interpolated price:', interpolationError.message);
        
    
        console.log('Using placeholder price since no data exists yet');
        const placeholderPrice = 100 + Math.random() * 10; // Sample placeholder price
        

        await savePrice(token, network, ts, placeholderPrice, 'placeholder');
        await setPriceCache(token, network, ts, placeholderPrice, 'placeholder');
        
        return res.json({
          price: placeholderPrice,
          source: 'placeholder',
          timestamp: ts,
          success: true,
          note: 'Using placeholder price as historical data is not yet available'
        });
      }
    }
  } catch (error) {
    console.error('Error in price controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

// Schedule full history fetch
const scheduleHistory = async (req, res) => {
  const { token, network } = req.body;
  
  // Validate parameters
  if (!token || !network) {
    return res.status(400).json({
      success: false,
      message: 'Token address and network are required',
    });
  }
  
  if (!/^0x[a-fA-F0-9]{40}$/.test(token)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid token address format',
    });
  }
  
  if (!['ethereum', 'polygon'].includes(network)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid network. Must be "ethereum" or "polygon"',
    });
  }
  
  try {
    // Schedule job
    const result = await scheduleHistoryJob(token, network);
    
    return res.json({
      success: true,
      jobId: result.jobId,
      message: 'Scheduled full history fetch',
      estimatedCompletion: result.estimatedCompletion,
    });
  } catch (error) {
    console.error('Error scheduling history job:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to schedule history job',
      error: error.message,
    });
  }
};

// Get job progress
const getProgress = async (req, res) => {
  const { jobId } = req.query;
  
  if (!jobId) {
    return res.status(400).json({
      success: false,
      message: 'Job ID is required',
    });
  }
  
  try {
    const progressData = await getJobProgress(jobId);
    
    if (!progressData) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }
    
    return res.json({
      success: true,
      progress: progressData.progress,
    });
  } catch (error) {
    console.error('Error getting job progress:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get job progress',
    });
  }
};

module.exports = {
  getPrice,
  scheduleHistory,
  getProgress,
};
