const express = require('express');
const router = express.Router();
const dashboardController = require('./dashboard.controller');

router.get('/', dashboardController.getTotalCounts);


module.exports = router;
