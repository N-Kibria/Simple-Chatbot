import React from 'react';
import { Link } from 'react-router-dom';
import Chatbot from './components/Chatbot';

const App = () => {
  return (
    <div className="p-6">
      <h1 className="text-4xl font-bold mb-6">Welcome to QuoteBot </h1>
      <ul className="space-y-2">
        <li><Link className="text-blue-500" to="/motivational">Motivational Quotes</Link></li>
        <li><Link className="text-pink-500" to="/romantic">Romantic Quotes</Link></li>
        <li><Link className="text-yellow-500" to="/funny">Funny Quotes</Link></li>
        <li><Link className="text-gray-500" to="/sad">Sad Quotes</Link></li>
        <li><Link className="text-green-500" to="/happy">Happy Quotes</Link></li>
        
      </ul>

      <Chatbot />
    </div>
  );
};

export default App;
