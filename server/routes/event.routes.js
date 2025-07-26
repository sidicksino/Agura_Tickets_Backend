const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Routes
router.post('/event', eventController.event);

module.exports = router;
