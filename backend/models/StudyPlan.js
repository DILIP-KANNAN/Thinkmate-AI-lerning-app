const mongoose = require('mongoose');

const studyPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  deadline: {
    type: Date,
    required: true
  },
  totalTasks: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
