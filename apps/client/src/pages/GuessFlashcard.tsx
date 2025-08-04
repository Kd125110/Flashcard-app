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
  box?: number;
}

const GuessFlashcard: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [blurred, setBlurred] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorectCount] = useState(0);


  // Fetch flashcards from backend
useEffect(() => {
  const token = localStorage.getItem('authToken');
  
  if (!token) {
    console.error('No authentication token found');
    return;
  }
  
  fetch('http://localhost:3001/flashcards', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
    .then(res => {
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }
      return res.json();
    })
    .then(data => {
      console.log('Flashcards data:', data);
      setFlashcards(data.flashcards || []);
    })
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
    
    const isCorrect = userGuess.trim().toLocaleLowerCase() === currentCard.answer.toLocaleLowerCase();

    if (isCorrect) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorectCount(prev => prev + 1);
    }

    const updatedFlashcards = flashcards.map(card => {
      if(card.id === currentCard.id){
        const newBox = isCorrect ? Math.min((card.box || 1) + 1,5 ):1;
        return { ...card, box: newBox}
      }
      return card;
    })

    setFlashcards(updatedFlashcards);
    setFeedback(isCorrect ? '✅ Nice one!' : '❌ Try again!');
    setBlurred(!isCorrect);

    if(isCorrect){
      setTimeout(() => {
        const cards = updatedFlashcards
        .filter(card => card.category === selectedCategory)
        .sort((a, b) => (a.box || 1) - (b.box || 1));

        const nextCard = cards[(cardIndex + 1) % cards.length];
        setCardIndex((cardIndex + 1) % cards.length);
        setCurrentCard(nextCard);
        setUserGuess('');
        setFeedback('');
        setBlurred(true);
      }, 2000)
    }
  };

  const boxStats = [1, 2, 3, 4, 5].map(level => ({
    level,
    count: flashcards.filter(card => card.box === level).length,
  }));
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

      <div className='flex gap-2 mt-4'>
        {boxStats.map(stat => (
          <div key={stat.level} className='text-sm'>
              📦 {stat.level}: {stat.count}
          </div>
        ))}
      </div>
      <div className='mt-2 text-sm mb-4'>
          ✅ Poprawne: {correctCount} | ❌ Błędne: {incorrectCount}
      </div>
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
