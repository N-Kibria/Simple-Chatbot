import React from 'react';

const Motivational = () => {
  const quotes = [
    "Tough times never last, but tough people do.",
    "Believe in yourself and all that you are.",
  ];

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Motivational Quotes</h1>
      {quotes.map((q, i) => (
        <div key={i} className="bg-blue-100 p-3 my-2 rounded">{q}</div>
      ))}
    </div>
  );
};

export default Motivational;
