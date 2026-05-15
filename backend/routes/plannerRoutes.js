const express = require('express');
const router = express.Router();
const plannerController = require('../controllers/plannerController');
const { protect } = require('../middleware/auth');

router.post('/generate', protect, plannerController.generateStudyPlan);

module.exports = router;
