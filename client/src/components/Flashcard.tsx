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
    <div className="flashcard-container" onClick={() => setFlipped(!flipped)}>
      <div className={`flashcard ${flipped ? 'flipped' : ''}`}>
        <div className="front">
          <div className="category">{category}</div>
          <div className="content">{question}</div>
        </div>
        <div className="back">
          <div className="category">{category}</div>
          <div className="content">{answer}</div>
        </div>
      </div>
    </div>
  );
};

export default Flashcard;
