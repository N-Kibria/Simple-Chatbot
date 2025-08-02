import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Chatbot = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState('');
  const [awaitingMoodResponse, setAwaitingMoodResponse] = useState(false);
  const [detectedMood, setDetectedMood] = useState('');
  const [quotePage, setQuotePage] = useState('');
  const navigate = useNavigate();
  const chatRef = useRef(null);

  const GROQ_API_KEY = process.env.REACT_APP_GROQ_API_KEY;

  useEffect(() => {
    const sid = localStorage.getItem('sessionId') || Date.now().toString();
    setSessionId(sid);
    localStorage.setItem('sessionId', sid);
    fetchMessages(sid);
  }, []);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async (sid) => {
    try {
      const res = await axios.get(`http://localhost:3001/chat/${sid}`);
      const formattedMessages = res.data.map(msg => ({
        sender: msg.sender,
        text: msg.message || msg.text
      }));
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  };

  const saveMessage = async (sender, message) => {
    try {
      await axios.post('http://localhost:3001/chat', {
        sessionId,
        sender,
        message: message,
      });
    } catch (err) {
      console.error('Failed to save message:', err);
    }
  };

  const callGroqAPI = async (userText) => {
    try {
      // Create the request payload
      const requestPayload = {
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: `You are a warm, friendly chatbot for a quote application. 
Be conversational and respond naturally to user messages.While greeting dont ask if looking for quote.based on conversation flow ask later .

CRITICAL INSTRUCTIONS FOR MOOD DETECTION:
- You MUST call the detect_user_mood function whenever you detect ANY emotional language
- Trigger words/phrases that REQUIRE function calling: sad, happy, depressed, excited, motivated, romantic, funny, love, laugh, down, upset, anxious, worried, stressed, cheerful, joyful, etc.
- Examples that MUST trigger the function: "I'm sad", "feeling down", "I'm happy", "make me laugh", "I need motivation", "tell me something funny", "I feel useless", "I'm depressed"
- ALWAYS call the function first, then provide your response
- If unsure, err on the side of calling the function`,
          },
          { role: 'user', content: userText },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'detect_user_mood',
              description: 'Call this function whenever you detect any emotional content, mood, or feeling in the user message',
              parameters: {
                type: 'object',
                properties: {
                  mood: {
                    type: 'string',
                    enum: ['happy', 'sad', 'romantic', 'funny', 'motivated'],
                    description: 'The primary emotion/mood detected'
                  },
                },
                required: ['mood'],
              },
            },
          },
        ],
        tool_choice: 'auto',
        max_tokens: 300,
        temperature: 0.5,
      };

      console.log('Groq API Request:', JSON.stringify(requestPayload, null, 2));

      const res = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return res.data;
    } catch (error) {
      console.error('Groq API error:', error);
      console.error('Error response:', error.response?.data);
      return null;
    }
  };

  const handleMoodDetection = async (mood) => {
    // Map mood to corresponding page for all five pages
    const moodToPageMap = {
      'happy': 'happy',
      'sad': 'sad',
      'romantic': 'romantic',
      'funny': 'funny',
      'motivated': 'motivational'
    };
    
    const page = moodToPageMap[mood] || 'motivational';
    setDetectedMood(mood);
    setQuotePage(page);
    setAwaitingMoodResponse(true);

    // Get appropriate emoji for mood
    const moodEmoji = {
      'romantic': '💕',
      'sad': '😢',
      'funny': '😄',
      'happy': '😊',
      'motivated': '💪'
    };

    const moodQuestion = `${moodEmoji[mood] || '✨'} I detected you're feeling ${mood}! Would you like me to show you some inspiring ${mood} quotes to match your mood? Just reply with "yes" or "no". 😊`;
    
    const botMsg = { sender: 'Bot', text: moodQuestion };
    setMessages((prev) => [...prev, botMsg]);
    await saveMessage('Bot', moodQuestion);
  };

  const handleMoodResponse = async (userInput) => {
    const response = userInput.toLowerCase().trim();
    
    if (response.includes('yes') || response.includes('y') || response.includes('sure') || response.includes('okay') || response.includes('ok')) {
      const navText = `Great! Taking you to ${detectedMood} quotes! 🚀`;
      const botMsg = { sender: 'Bot', text: navText };
      setMessages((prev) => [...prev, botMsg]);
      await saveMessage('Bot', navText);
      
      setTimeout(() => {
        navigate(`/${quotePage}`);
      }, 1000);
      
      setAwaitingMoodResponse(false);
      setDetectedMood('');
      setQuotePage('');
      
    } else if (response.includes('no') || response.includes('n') || response.includes('nah') || response.includes('not')) {
      // User said no to quotes, so continue the conversation naturally
      // Reset the mood response state first
      setAwaitingMoodResponse(false);
      setDetectedMood('');
      setQuotePage('');
      
      // Continue the conversation naturally by calling the AI with the user's actual response
      try {
        const groqResponse = await callGroqAPI(userInput);
        if (!groqResponse) {
          const errorMsg = { sender: 'Bot', text: 'Sorry, I encountered an error. Please try again.' };
          setMessages((prev) => [...prev, errorMsg]);
          await saveMessage('Bot', errorMsg.text);
          return;
        }

        const reply = groqResponse.choices[0].message;
        const toolCalls = reply?.tool_calls;

        // Handle tool calls if any (mood detection)
        if (toolCalls && toolCalls.length > 0) {
          for (const tool of toolCalls) {
            if (tool.function.name === 'detect_user_mood') {
              try {
                const toolArgs = JSON.parse(tool.function.arguments);
                const { mood } = toolArgs;
                
                // Show the bot's regular response first, then ask about navigation
                if (reply?.content && reply.content.trim()) {
                  const botResponse = reply.content.trim();
                  const botMsg = { sender: 'Bot', text: botResponse };
                  setMessages((prev) => [...prev, botMsg]);
                  await saveMessage('Bot', botResponse);
                }
                
                // Then ask about navigation after a short delay
                setTimeout(async () => {
                  await handleMoodDetection(mood);
                }, 500);
                
                return;
                
              } catch (parseError) {
                console.error('Error parsing tool arguments:', parseError);
              }
            }
          }
        }

        // Handle the bot's main response (if no tool calls were made)
        if (reply?.content && reply.content.trim()) {
          const botResponse = reply.content.trim();
          const botMsg = { sender: 'Bot', text: botResponse };
          setMessages((prev) => [...prev, botMsg]);
          await saveMessage('Bot', botResponse);
        }

      } catch (err) {
        console.error('Error continuing conversation:', err);
        const errorMsg = { sender: 'Bot', text: 'Sorry, something went wrong. Please try again.' };
        setMessages((prev) => [...prev, errorMsg]);
        await saveMessage('Bot', errorMsg.text);
      }
      
    } else {
      // If response is unclear, ask for clarification
      const clarifyText = `I'm not sure what you meant. Would you like to see ${detectedMood} quotes (yes) or continue our chat (no)? 😊`;
      const botMsg = { sender: 'Bot', text: clarifyText };
      setMessages((prev) => [...prev, botMsg]);
      await saveMessage('Bot', clarifyText);
      return; // Don't reset the awaiting state, keep waiting for a clear answer
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input.trim();
    
    // Add user message to state and save to DB
    const userMsg = { sender: 'User', text: userText };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    
    // Save user message to database
    await saveMessage('User', userText);

    // If we're waiting for a mood response, handle it directly
    if (awaitingMoodResponse) {
      await handleMoodResponse(userText);
      return;
    }

    try {
      const groqResponse = await callGroqAPI(userText);
      if (!groqResponse) {
        const errorMsg = { sender: 'Bot', text: 'Sorry, I encountered an error. Please try again.' };
        setMessages((prev) => [...prev, errorMsg]);
        await saveMessage('Bot', errorMsg.text);
        return;
      }

      const reply = groqResponse.choices[0].message;
      const toolCalls = reply?.tool_calls;

      // Debug logging
      console.log('Full Groq Response:', JSON.stringify(groqResponse, null, 2));
      console.log('Message content:', reply?.content);
      console.log('Tool calls:', toolCalls);

      // Handle tool calls FIRST (mood detection)
      if (toolCalls && toolCalls.length > 0) {
        for (const tool of toolCalls) {
          if (tool.function.name === 'detect_user_mood') {
            try {
              const toolArgs = JSON.parse(tool.function.arguments);
              const { mood } = toolArgs;
              
              console.log('🎭 Mood detected:', mood);
              
              // Show the bot's regular response first, then ask about navigation
              if (reply?.content && reply.content.trim()) {
                const botResponse = reply.content.trim();
                const botMsg = { sender: 'Bot', text: botResponse };
                setMessages((prev) => [...prev, botMsg]);
                await saveMessage('Bot', botResponse);
              }
              
              // Then ask about navigation after a short delay
              setTimeout(async () => {
                await handleMoodDetection(mood);
              }, 500);
              
              return; // Exit early since we handled both response and mood detection
              
            } catch (parseError) {
              console.error('Error parsing tool arguments:', parseError);
            }
          }
        }
      }

      // Handle the bot's main response (only if no tool calls were made)
      if (reply?.content && reply.content.trim()) {
        const botResponse = reply.content.trim();
        const botMsg = { sender: 'Bot', text: botResponse };
        setMessages((prev) => [...prev, botMsg]);
        await saveMessage('Bot', botResponse);
      }

    } catch (err) {
      console.error('Error sending message:', err);
      const errorMsg = { sender: 'Bot', text: 'Sorry, something went wrong. Please try again.' };
      setMessages((prev) => [...prev, errorMsg]);
      await saveMessage('Bot', errorMsg.text);
    }
  };

  return (
    <div className="fixed bottom-0 right-0 w-1/2 h-2/3 bg-white p-4 rounded-tl-2xl shadow-2xl flex flex-col z-40">
      <div className="flex-1 overflow-y-auto pr-2" ref={chatRef}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`my-2 flex ${msg.sender === 'User' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-xs ${
                msg.sender === 'User' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-2">
        {awaitingMoodResponse && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-2 rounded">
            <p className="text-sm text-blue-700">
              💭 Waiting for your response about {detectedMood} quotes...
            </p>
          </div>
        )}
        <input
          className="border rounded p-2 w-full focus:outline-none focus:border-blue-500"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder={awaitingMoodResponse ? "Type 'yes' or 'no'..." : "Say something..."}
        />
      </div>
    </div>
  );
};

export default Chatbot;