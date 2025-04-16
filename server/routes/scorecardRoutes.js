const express = require('express');
const router = express.Router();
const scorecardController = require('../controllers/scorecardController');

// Scorecard routes (authentication is handled in server.js)
router.get('/performance', scorecardController.getUserPerformance);
router.post('/performance', scorecardController.logPerformance);

// Routes with path parameters
router.get('/performance/event/:eventId', scorecardController.getEventPerformance);
router.delete('/performance/:performanceId', scorecardController.deletePerformance);

module.exports = router;