const ChatSession = require('../models/ChatSession');
const Document = require('../models/Document');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');
const SystemConfig = require('../models/SystemConfig');

async function getRagApiUrl() {
  try {
     const config = await SystemConfig.findOne({ name: 'production_config' });
     if (config && config.ragApiUrl) return config.ragApiUrl;
  } catch(e) {}
  return process.env.RAG_API_URL || 'http://127.0.0.1:8000';
}

// @desc    Get all chat sessions for user
// @route   GET /api/chats
// @access  Private
const getChatSessions = async (req, res) => {
  try {
    const chats = await ChatSession.find({ user: req.user._id })
        .populate('selectedNotes', 'title url topic subject')
        .sort('-updatedAt');
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get specific chat session by ID
// @route   GET /api/chats/:id
// @access  Private
const getChatSessionById = async (req, res) => {
  try {
    const chat = await ChatSession.findById(req.params.id)
        .populate('selectedNotes', 'title url topic subject');
    if (chat && chat.user.toString() === req.user._id.toString()) {
      res.json(chat);
    } else {
      res.status(404).json({ message: 'Chat session not found or unauthorized' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create or update a chat session
// @route   POST /api/chats
// @access  Private
const saveChatSession = async (req, res) => {
  try {
    const { chatId, module, selectedNotes, history } = req.body;

    let validNotes = [];
    if (Array.isArray(selectedNotes)) {
      validNotes = selectedNotes.filter(id => /^[0-9a-fA-F]{24}$/.test(id));
    }

    if (chatId) {
      // Update existing chat
      const chat = await ChatSession.findById(chatId);
      if (chat && chat.user.toString() === req.user._id.toString()) {
        chat.history = history;
        if (selectedNotes) {
            chat.selectedNotes = validNotes;
        }
        const updatedChat = await chat.save();
        res.json(updatedChat);
      } else {
        res.status(404).json({ message: 'Chat session not found or unauthorized' });
      }
    } else {
      // Create new chat
      const newChat = new ChatSession({
        user: req.user._id,
        module,
        selectedNotes: validNotes,
        history
      });
      const createdChat = await newChat.save();
      res.status(201).json(createdChat);
    }
  } catch (error) {
    console.error("ChatSession Error:", error.message);
    if (error.name === 'ValidationError') {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
};

// @desc    Explicitly sync selected documents to RAG fast api backend
// @route   POST /api/chats/sync-rag
// @access  Private
const syncSelectedNotesToRag = async (req, res) => {
  try {
    const { selectedNotes } = req.body;
    if (!selectedNotes || !Array.isArray(selectedNotes)) {
      return res.status(400).json({ message: 'selectedNotes must be an array of Document IDs' });
    }

    const userId = req.user._id.toString();
    const docs = await Document.find({ 
      _id: { $in: selectedNotes },
      $or: [
        { isPersonal: { $ne: true } },
        { isPersonal: true, uploadedBy: req.user._id }
      ]
    });

    let totalChunks = 0;
    let isFirst = true;

    for (const doc of docs) {
      if (!doc.url) continue;
      
      const urlObj = new URL(doc.url);
      const decodedPathname = decodeURIComponent(urlObj.pathname);
      const rawPathname = urlObj.pathname;
      
      let localPath = path.join(__dirname, '../public', decodedPathname.replace('/docs/', 'docs/'));
      let rawLocalPath = path.join(__dirname, '../public', rawPathname.replace('/docs/', 'docs/'));
      
      let targetPath = null;
      if (fs.existsSync(localPath)) targetPath = localPath;
      else if (fs.existsSync(rawLocalPath)) targetPath = rawLocalPath;
      
      console.log("SYNC-RAG DEBUG: Verifying document for extraction");
      console.log("Original URL:", doc.url);
      console.log("Calculated Decoded Path:", localPath);
      console.log("Calculated Raw Path:", rawLocalPath);
      console.log("File Found?", targetPath !== null);
      
      if (targetPath) {
        try {
          const formData = new FormData();
          formData.append('user_id', userId);
          formData.append('subject', doc.subject || 'General');
          formData.append('topic', doc.topic || 'General');
          formData.append('clear_first', isFirst ? 'true' : 'false');
          formData.append('file', fs.createReadStream(targetPath), doc.title);

          isFirst = false;

          const RAG_API_URL = await getRagApiUrl();
          const backendRes = await axios.post(`${RAG_API_URL}/upload`, formData, {
            headers: { ...formData.getHeaders() }
          });
          
          if (backendRes.data && backendRes.data.chunks_processed) {
             totalChunks += backendRes.data.chunks_processed;
          }
        } catch (err) {
          console.error(`Failed to sync to RAG backend for ${doc.title}:`, err.message);
        }
      }
    }

    res.status(200).json({ success: true, chunks_processed: totalChunks });

  } catch(error) {
    console.error("Sync RAG Error:", error.message);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatSessions, getChatSessionById, saveChatSession, syncSelectedNotesToRag };
