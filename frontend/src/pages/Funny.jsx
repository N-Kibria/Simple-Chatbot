import React from 'react';
import QuoteCard from '../components/QuoteCard';

const Funny = () => {
  const quotes = [
    "I'm not lazy, I'm on energy-saving mode.",
    "If life gives you lemons, add vodka.",
    "I'm not arguing, I'm just explaining why I'm right.",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-yellow-500 mb-4">Funny Quotes</h1>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
};

export default Funny;
