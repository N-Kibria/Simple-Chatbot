import React from 'react';

const QuoteCard = ({ quote }) => {
  return (
    <div className="bg-gray-100 border-l-4 border-blue-500 text-gray-700 p-4 my-2 rounded shadow">
      <p className="italic">“{quote}”</p>
    </div>
  );
};

export default QuoteCard;
