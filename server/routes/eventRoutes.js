const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Event routes (authentication is handled in server.js)
router.post('/', eventController.createEvent);
router.get('/', eventController.getAllEvents);
router.get('/my-events', eventController.getMyEvents);

// IMPORTANT: Place specific routes BEFORE routes with path parameters
router.get('/joined', eventController.getJoinedEvents);

// Routes with path parameters
router.get('/:eventId', eventController.getEventById);
router.post('/:eventId/join', eventController.joinEvent);
router.get('/:eventId/joined', eventController.checkEventJoined);

module.exports = router;