const express = require('express');
const router = express.Router();
const controller = require('../controllers/passwordResetController');

router.post('/request-reset', controller.requestReset);
router.post('/verify-code', controller.verifyCode);
router.post('/reset-password', controller.resetPassword);

module.exports = router;
