const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const authController = require('../controllers/userController');

// Routes
router.post('/register', authController.register);
router.get('/me', authMiddleware, authController.getMe);
router.put('/me', authMiddleware, authController.updateMe);

module.exports = router;
