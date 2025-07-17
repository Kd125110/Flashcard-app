import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Flashcard from '../components/Flashcard';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
}

const GuessFlashcard: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [flipped, setFlipped] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [blurred, setBlurred] = useState(true);

  // Fetch flashcards from backend
  useEffect(() => {
    fetch('http://localhost:3001/flashcards')
      .then(res => res.json())
      .then(data => setFlashcards(data.flashcards))
      .catch(err => console.error('Error fetching flashcards:', err));
  }, []);

  // Extract unique categories from flashcards
  const categories = Array.from(new Set(flashcards.map(card => card.category)));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    const cards = flashcards.filter(card => card.category === category);
    setCardIndex(0)
    setCurrentCard(cards[0]);
    setUserGuess('');
    setFeedback('');
    setBlurred(true);

  };

  const checkAnswer = () => {
    if (!currentCard) return;
    if (userGuess.trim().toLowerCase() === currentCard.answer.toLowerCase()) {
      setFeedback('✅ Nice one!');
      setFlipped(true);
      setBlurred(false); 

      setTimeout(() => {
        const cards = flashcards.filter(card => card.category === selectedCategory);
        const nextCard = (cardIndex + 1) % cards.length;
        setCardIndex(nextCard);
        setCurrentCard(cards[nextCard]);
        setUserGuess('');
        setFeedback('');
        setFlipped(true);
        setBlurred(true); 
      }, 2000)
    } else {
      setFlipped(false);  
      setFeedback('❌ Try again!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-4">
      <Navbar />
      <h1 className="text-2xl font-bold mb-4 mt-10">Zgadnij tłumaczenie</h1>

      <select
        className="mb-4 p-2 border rounded"
        value={selectedCategory}
        onChange={handleCategoryChange}
      >
        <option value="">Wybierz kategorię</option>
        {categories.map(cat => (
          <option key={cat} value={cat}>{cat}</option>
        ))}
      </select>

      {currentCard && (
       <Flashcard
        question={currentCard.question}
        answer={currentCard.answer}
        category={currentCard.category}
        sourceLang={currentCard.sourceLang}
        targetLang={currentCard.targetLang}
        blurred={blurred} 
        />
   
      )}

      {currentCard && (
        <>
          <input
            
            type="text"
            className="mt-6 p-2 border rounded mb-4"
            placeholder="Twoja odpowiedź"
            value={userGuess}
            onChange={e => setUserGuess(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={checkAnswer}
          >
            Sprawdź
          </button>
          {feedback && <p className="mt-2 text-lg">{feedback}</p>}
        </>
      )}
    </div>
  );
};

export default GuessFlashcard;
