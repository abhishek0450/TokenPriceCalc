const { Queue, Worker } = require('bullmq');
const { v4: uuidv4 } = require('uuid');
const { getTokenCreationDate, getTokenPrice } = require('../services/alchemyService');
const { savePrice, savePrices } = require('../services/dbService');
const { setJobProgress } = require('../services/cacheService');
const dotenv = require('dotenv');

dotenv.config();

// Redis connection options
const redisUrl = new URL(process.env.REDIS_URL);
const redisOptions = {
  connection: {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port),
    username: redisUrl.username || undefined,
    password: redisUrl.password || undefined,
    db: redisUrl.pathname ? parseInt(redisUrl.pathname.substring(1)) || 0 : 0,
    tls: redisUrl.protocol === 'rediss:' ? {} : undefined,
  },
};

// Create queues
let priceQueue;
let priceWorker;

// Setup queues and workers
const setupQueues = () => {
  // Create the queue
  priceQueue = new Queue('price-history-queue', redisOptions);
  

  priceWorker = new Worker('price-history-queue', processHistoryJob, {
    ...redisOptions,
    concurrency: 1,
    // Enable job persistence after server restarts
    autorun: true,
    removeOnComplete: false,
    removeOnFail: false,
  });
  
  priceWorker.on('completed', (job) => {
    console.log(`Job ${job.id} completed`);
  });
  
  priceWorker.on('failed', (job, error) => {
    console.error(`Job ${job?.id} failed with error: ${error.message}`);
  });
  
  priceWorker.on('progress', (job, progress) => {
    console.log(`Job ${job.id} progress: ${progress}%`);
  });
  
  return { priceQueue, priceWorker };
};

const processHistoryJob = async (job) => {
  try {
    const { token, network } = job.data;
    
    console.log(`Getting creation date for token ${token} on ${network}`);
    job.updateProgress(5);
    await setJobProgress(job.id, 5);
    
    const creationTimestamp = await getTokenCreationDate(token, network);
    console.log(`Token creation date: ${new Date(creationTimestamp * 1000).toISOString()}`);
    
    job.updateProgress(10);
    await setJobProgress(job.id, 10);
    
    // Generate daily timestamps from creation to today
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const dailyTimestamps = generateDailyTimestamps(creationTimestamp, currentTimestamp);
    
    console.log(`Generated ${dailyTimestamps.length} daily timestamps`);
    job.updateProgress(15);
    await setJobProgress(job.id, 15);
    
    // Batch timestamps in groups to respect rate limits
    const batchSize = 10;
    const batches = [];
    
    for (let i = 0; i < dailyTimestamps.length; i += batchSize) {
      batches.push(dailyTimestamps.slice(i, i + batchSize));
    }
    
    // Process batches with rate limiting
    console.log(`Processing ${batches.length} batches`);
    
    const progressPerBatch = 85 / batches.length; // 85% remaining progress
    let currentProgress = 15;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      const pricesData = [];
      
      // Process each timestamp in the batch
      for (const timestamp of batch) {
        try {
          const price = await getTokenPrice(token, network, timestamp);
          const date = new Date(timestamp * 1000).toISOString().split('T')[0];
          
          pricesData.push({
            token,
            network,
            timestamp,
            date,
            price,
            source: 'alchemy',
          });
        } catch (error) {
          console.error(`Error getting price at timestamp ${timestamp}:`, error.message);
          // Continue with the next timestamp
        }
      }
      
      // Save batch results
      if (pricesData.length > 0) {
        await savePrices(pricesData);
      }
      
      // Update progress
      currentProgress += progressPerBatch;
      job.updateProgress(Math.min(Math.floor(currentProgress), 99));
      await setJobProgress(job.id, Math.min(Math.floor(currentProgress), 99));
      
      // Add delay between batches for rate limiting
      if (i < batches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    // Mark job as completed
    job.updateProgress(100);
    await setJobProgress(job.id, 100);
    
    return { completed: true, processedTimestamps: dailyTimestamps.length };
  } catch (error) {
    console.error('Error processing history job:', error);
    
    // Update progress to indicate failure but don't throw
    // This allows the job to be marked as "completed with errors" rather than failed
    try {
      await setJobProgress(job.id, 100);
      job.updateProgress(100);
    } catch (progressError) {
      console.error('Error updating progress after failure:', progressError);
    }
    
    return {
      completed: false,
      error: error.message,
      errorDetails: error.toString()
    };
  }
};

// Generate array of daily timestamps between two dates
const generateDailyTimestamps = (startTimestamp, endTimestamp) => {
  const timestampsArray = [];
  
  // Convert to milliseconds for Date objects
  let currentDate = new Date(startTimestamp * 1000);
  const endDate = new Date(endTimestamp * 1000);
  
  // Set both dates to start of day (midnight)
  currentDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);
  
  // Add a timestamp for each day
  while (currentDate <= endDate) {
    timestampsArray.push(Math.floor(currentDate.getTime() / 1000));
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return timestampsArray;
};

// Schedule a price history job
const scheduleHistoryJob = async (token, network) => {
  try {
    const jobId = uuidv4();
    
    // Add job to queue
    await priceQueue.add(
      'price-history',
      { token, network },
      { 
        jobId,
        removeOnComplete: false,
        removeOnFail: false,
      }
    );
    
    // Initialize progress
    await setJobProgress(jobId, 0);
    
    // Estimate completion time (30 seconds per batch of 10 days + overhead)
    const estimatedDays = 365; // Assume 1 year of history
    const estimatedBatches = Math.ceil(estimatedDays / 10);
    const estimatedSecondsPerBatch = 30;
    const estimatedSeconds = estimatedBatches * estimatedSecondsPerBatch + 60; // Add 1 minute overhead
    
    const estimatedCompletion = new Date(Date.now() + estimatedSeconds * 1000).toISOString();
    
    return { 
      jobId, 
      estimatedCompletion 
    };
  } catch (error) {
    console.error('Error scheduling history job:', error);
    throw error;
  }
};

module.exports = {
  setupQueues,
  scheduleHistoryJob,
};
