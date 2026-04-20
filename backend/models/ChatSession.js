const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  module: {
    type: String,
    enum: ['exam-assistance', 'concept-explanation', 'question-generator', 'summary-creator'],
    required: true
  },
  selectedNotes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document'
  }],
  history: [{
    role: {
      type: String,
      enum: ['user', 'ai'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatSession', chatSessionSchema);
