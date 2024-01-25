const express = require('express');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/sendOtp', authController.sendOtp);
router.post('/verifyOtp', authController.verifyOtp);

module.exports = router;