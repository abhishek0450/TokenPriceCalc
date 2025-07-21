const Redis = require('ioredis');
const dotenv = require('dotenv');

dotenv.config();

let redisClient;

const initializeRedis = () => {
  redisClient = new Redis(process.env.REDIS_URL);
  
  redisClient.on('connect', () => {
    console.log('Connected to Redis');
  });
  
  redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
  });
  
  return redisClient;
};


const getRedisClient = () => {
  if (!redisClient) {
    return initializeRedis();
  }
  return redisClient;
};

const setCacheData = async (key, data, ttlSeconds = 300) => {
  const client = getRedisClient();
  try {
    await client.set(key, JSON.stringify(data), 'EX', ttlSeconds);
    return true;
  } catch (error) {
    console.error('Redis set error:', error);
    return false;
  }
};

const getCacheData = async (key) => {
  const client = getRedisClient();
  try {
    const data = await client.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Redis get error:', error);
    return null;
  }
};

const setPriceCache = (token, network, timestamp, price, source) => {
  const key = `price:${token}:${network}:${timestamp}`;
  // Cache exact timestamps for 5 minutes (300 seconds)
  // Cache interpolated results for 1 minute (60 seconds)
  const ttl = source === 'interpolated' ? 60 : 300;
  return setCacheData(key, { price, source }, ttl);
};

// Get price from cache
const getPriceCache = (token, network, timestamp) => {
  const key = `price:${token}:${network}:${timestamp}`;
  return getCacheData(key);
};

// Set job progress
const setJobProgress = (jobId, progress) => {
  const key = `job:${jobId}:progress`;
  // Store for 1 day (86400 seconds)
  return setCacheData(key, { progress }, 86400);
};

// Get job progress
const getJobProgress = (jobId) => {
  const key = `job:${jobId}:progress`;
  return getCacheData(key);
};

module.exports = {
  initializeRedis,
  getRedisClient,
  setCacheData,
  getCacheData,
  setPriceCache,
  getPriceCache,
  setJobProgress,
  getJobProgress,
};
