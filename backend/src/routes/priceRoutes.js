const express = require('express');
const { priceCache } = require('../middleware/cache');
const { getPrice, scheduleHistory, getProgress } = require('../controllers/priceController');

const router = express.Router();


router.get('/price', priceCache, getPrice);

router.post('/schedule', scheduleHistory);

router.get('/schedule/progress', getProgress);

module.exports = router;
