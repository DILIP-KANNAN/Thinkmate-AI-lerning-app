const mongoose = require('mongoose');

const systemConfigSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  ragApiUrl: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SystemConfig', systemConfigSchema);
