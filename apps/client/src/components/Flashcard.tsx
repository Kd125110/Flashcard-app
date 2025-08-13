import React, { useState } from 'react';
import '../App.css';
import '../flashcard.css';

interface FlashcardProps {
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
  blurred: boolean;
  box?: number;
}

const Flashcard: React.FC<FlashcardProps> = ({
  question,
  answer,
  category,
  sourceLang,
  targetLang,
  box,
  blurred = false,
}) => {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-[260px] h-[170px] sm:w-[300px] sm:h-[200px] perspective cursor-pointer"
      onClick={() => setFlipped(!flipped)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${
          flipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front side */}
        <div className="absolute w-full h-full bg-yellow-300 border border-brown rounded-xl text-[#3e2f1c] backface-hidden flex flex-col justify-center items-center p-4 shadow-lg">
          <div className="text-lg font-bold text-black mb-2">{category}</div>
          <div className="text-xl text-center">{question}</div>
          <div className="text-sm text-center mt-2">Język źródłowy: {sourceLang}</div>
          <div className="text-sm text-gray-500 mt-2">📦 Poziom: {box ?? 1}</div>

        </div>

        {/* Back side */}
        <div className="absolute w-full h-full bg-green-300 border border-brown rounded-xl text-[#3e2f1c] backface-hidden rotate-y-180 flex flex-col justify-center items-center p-4 shadow-lg">
          <div className="text-lg font-bold text-black mb-2">{category}</div>
          <div className={`${blurred ? 'blur-sm' : ''} text-xl text-center`}>{answer}</div>
          <div className="text-sm text-center mt-2">Język docelowy: {targetLang}</div>
          <div className="text-sm text-gray-500 mt-2">📦 Poziom: {box ?? 1}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
