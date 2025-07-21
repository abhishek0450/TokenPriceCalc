const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  token: {
    type: String,
    required: true,
    index: true,
  },
  network: {
    type: String,
    required: true,
    enum: ['ethereum', 'polygon'],
    index: true,
  },
  timestamp: {
    type: Number,
    required: true,
    index: true,
  },
  date: {
    type: String,
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  source: {
    type: String,
    enum: ['alchemy', 'interpolated'],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

priceSchema.index({ token: 1, network: 1, timestamp: 1 });

const Price = mongoose.model('Price', priceSchema);

module.exports = Price;
