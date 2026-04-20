const express = require('express');
const router = express.Router();
const { getChatSessions, getChatSessionById, saveChatSession, syncSelectedNotesToRag } = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.route('/')
  .get(protect, getChatSessions)
  .post(protect, saveChatSession);

router.post('/sync-rag', protect, syncSelectedNotesToRag);

router.route('/:id')
  .get(protect, getChatSessionById);

module.exports = router;
