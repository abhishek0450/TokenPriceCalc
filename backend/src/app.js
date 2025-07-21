const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const priceRoutes = require('./routes/priceRoutes');
const { setupQueues } = require('./workers/priceWorker');
const { initializeRedis } = require('./services/cacheService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });

initializeRedis();

setupQueues();

app.use('/api', priceRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);

});

// Graceful shutdown handler for BullMQ
const gracefulShutdown = async () => {
  console.log('Shutting down server...');
  
  try {
    // Get references to the worker and queue
    const { priceWorker, priceQueue } = require('./workers/priceWorker');
    
    if (priceWorker) {
      console.log('Closing BullMQ worker...');
      await priceWorker.close();
    }
    
    if (priceQueue) {
      console.log('Closing BullMQ queue...');
      await priceQueue.close();
    }
    
    console.log('Closed all BullMQ connections.');
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
  }
  
  process.exit(0);
};

// Listen for termination signals
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

module.exports = app;
