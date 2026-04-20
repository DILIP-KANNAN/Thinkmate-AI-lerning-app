const express = require('express');
const router = express.Router();
const taskController = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, taskController.getTasks)
  .post(protect, taskController.createTask);

module.exports = router;
