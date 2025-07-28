const mongoose = require('mongoose');
const chatSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sender: { type: String, required: true },
  message: { type: String, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Chat', chatSchema);