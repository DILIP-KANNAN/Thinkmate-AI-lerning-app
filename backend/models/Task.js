const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  task: {
    type: String,
    required: true
  },
  priority: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium'
  },
  time: {
    type: String,
    default: '1h 00m'
  },
  color: {
    type: String,
    default: 'bg-indigo-100 text-indigo-700'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
