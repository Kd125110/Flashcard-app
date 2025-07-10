import React, { useState } from 'react';
import '../App.css';

interface FlashcardProps {
  question: string;
  answer: string;
  category: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ question, answer, category }) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
  className="perspective-[200px] w-[300px] h-[200px]"
  onClick={() => setFlipped(!flipped)}
>
  <div
    className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
      flipped ? 'rotate-y-180' : ''
    }`}
  >
    {/* Front side - Question */}
    <div className="absolute w-full h-full bg-yellow-300 border border-brown rounded-xl text-[#3e2f1c] backface-hidden flex flex-col justify-center items-center p-4 shadow-lg">
      <div className="text-lg font-bold text-black mb-2">{category}</div>
      <div className="text-xl text-center">{question}</div>
    </div>

    {/* Back side - Answer */}
    <div className="absolute w-full h-full bg-green-300 border border-brown rounded-xl text-[#3e2f1c] backface-hidden flex flex-col justify-center items-center p-4 shadow-lg rotate-y-180">
      <div className="text-lg font-bold text-black mb-2">{category}</div>
      <div className="text-xl text-center">{answer}</div>
    </div>
  </div>
</div>


  );
};

export default Flashcard;
