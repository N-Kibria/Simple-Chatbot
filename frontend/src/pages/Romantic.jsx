import React from 'react';
import QuoteCard from '../components/QuoteCard';

const Romantic = () => {
  const quotes = [
    "Love is composed of a single soul inhabiting two bodies.",
    "You are my today and all of my tomorrows.",
    "I have found the one whom my soul loves.",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-pink-600 mb-4">Romantic Quotes</h1>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
};

export default Romantic;
