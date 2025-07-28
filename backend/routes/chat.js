const express = require('express');
const router = express.Router();
const Chat = require('../models/Chat');


Chat.schema.index({ sessionId: 1 });


const isRedirectMessage = (message) => {
  if (!message || typeof message !== 'string') return false;
  
 
  const redirectPatterns = [
    /^redirect:/i,
    /redirecting now/i,
    /here's something .+ for you! redirecting now/i,
    /redirect me to/i
  ];
  
  return redirectPatterns.some(pattern => pattern.test(message.trim()));
};

router.get('/:sessionId', async (req, res) => {
  try {
    const messages = await Chat.find({ sessionId: req.params.sessionId })
      .sort({ createdAt: 1 })
      .select('sender message createdAt'); 
    res.json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ error: err.message });
  }
});


router.post('/', async (req, res) => {
  try {
    const { sessionId, sender, message } = req.body;

   
    if (!sessionId || !sender || !message) {
      return res.status(400).json({ 
        error: 'Missing required fields: sessionId, sender, message' 
      });
    }

    
    if (isRedirectMessage(message)) {
      console.log('Skipping redirect message:', message);
      return res.status(200).json({ 
        message: 'Redirect message ignored',
        skipped: true 
      });
    }

    
    const newMessage = new Chat({ 
      sessionId, 
      sender, 
      message
    });
    
    const savedMessage = await newMessage.save();
    
  
    res.status(201).json(savedMessage);
  } catch (err) {
    console.error('Error saving message:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;