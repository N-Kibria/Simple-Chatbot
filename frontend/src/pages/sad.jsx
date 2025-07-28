import React from 'react';
import QuoteCard from '../components/QuoteCard';

const Sad = () => {
  const quotes = [
    "Tears are words that need to be written.",
    "The pain I feel today is the happiness I had yesterday.",
    "Sometimes, the person you'd take a bullet for ends up being the one behind the gun.",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-600 mb-4">Sad Quotes</h1>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
};

export default Sad;