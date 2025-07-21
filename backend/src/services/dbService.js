const Price = require('../models/Price');


const savePrice = async (token, network, timestamp, price, source) => {
  try {
    // Format date as YYYY-MM-DD for indexing
    const date = new Date(timestamp * 1000).toISOString().split('T')[0];
    
    const priceData = {
      token: token.toLowerCase(),
      network,
      timestamp,
      date,
      price,
      source,
    };
    
    const existingPrice = await Price.findOne({
      token: token.toLowerCase(),
      network,
      timestamp,
    });
    
    if (existingPrice) {

      if (source === 'alchemy' && existingPrice.source !== 'alchemy') {
        existingPrice.price = price;
        existingPrice.source = source;
        await existingPrice.save();
        return existingPrice;
      }
      return existingPrice;
    }
    

    const newPrice = new Price(priceData);
    await newPrice.save();
    return newPrice;
  } catch (error) {
    console.error('Error saving price to database:', error);
    throw error;
  }
};

const findPriceByTimestamp = async (token, network, timestamp) => {
  try {
    return await Price.findOne({
      token: token.toLowerCase(),
      network,
      timestamp,
    });
  } catch (error) {
    console.error('Error finding price by timestamp:', error);
    return null;
  }
};

const findPriceBefore = async (token, network, timestamp) => {
  try {
    return await Price.findOne({
      token: token.toLowerCase(),
      network,
      timestamp: { $lt: timestamp },
    }).sort({ timestamp: -1 });
  } catch (error) {
    console.error('Error finding price before timestamp:', error);
    return null;
  }
};

const findPriceAfter = async (token, network, timestamp) => {
  try {
    return await Price.findOne({
      token: token.toLowerCase(),
      network,
      timestamp: { $gt: timestamp },
    }).sort({ timestamp: 1 });
  } catch (error) {
    console.error('Error finding price after timestamp:', error);
    return null;
  }
};

// Save multiple prices in batch
const savePrices = async (pricesData) => {
  try {
    const operations = pricesData.map((data) => {
      return {
        updateOne: {
          filter: {
            token: data.token.toLowerCase(),
            network: data.network,
            timestamp: data.timestamp,
          },
          update: {
            $set: {
              date: data.date,
              price: data.price,
              source: data.source,
            },
          },
          upsert: true,
        },
      };
    });
    
    if (operations.length > 0) {
      return await Price.bulkWrite(operations);
    }
    return null;
  } catch (error) {
    console.error('Error saving prices in batch:', error);
    throw error;
  }
};

module.exports = {
  savePrice,
  findPriceByTimestamp,
  findPriceBefore,
  findPriceAfter,
  savePrices,
};
