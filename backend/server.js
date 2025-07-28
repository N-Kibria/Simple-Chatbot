const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = 'mongodb+srv://nafisa21:nafisa21@cluster0.dumg660.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';

mongoose.connect(mongoURI, {
})
.then(() => {
  console.log("MongoDB connected");
})
.catch((err) => {
  console.error("MongoDB connection error:", err);
});

// Routes
const chatRoutes = require('./routes/chat');
app.use('/chat', chatRoutes);

// Server
app.listen(3001, () => console.log("Server running on http://localhost:3001"));
