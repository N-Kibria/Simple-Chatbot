import React from 'react';
import QuoteCard from '../components/QuoteCard';

const Happy = () => {
  const quotes = [
    "Happiness is not something ready-made. It comes from your own actions.",
    "The best way to cheer yourself up is to cheer somebody else up.",
    "Today is a perfect day to be happy!",
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-green-500 mb-4">Happy Quotes</h1>
      {quotes.map((q, i) => (
        <QuoteCard key={i} quote={q} />
      ))}
    </div>
  );
};

export default Happy;