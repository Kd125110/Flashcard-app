import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Flashcard from '../components/Flashcard';
import RequireAuth from '../components/RequireAuth';

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
  const [incorrectCount, setIncorrectCount] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/login');
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
        const withBox = data.flashcards.map((card: Flashcard) => ({
          ...card,
          box: card.box ?? 1
        }));
        setFlashcards(withBox);
      })
      .catch(err => {
        console.error('Błąd pobierania fiszek:', err);
        navigate('/login');
      });
  }, [navigate]);

  const categories = Array.from(new Set(flashcards.map(card => card.category)));

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const category = e.target.value;
    setSelectedCategory(category);
    const cards = flashcards.filter(card => card.category === category);
    setCardIndex(0);
    setCurrentCard(cards[0]);
    setUserGuess('');
    setFeedback('');
    setBlurred(true);
  };

const updateFlashcardBox = async (id: string, newBox: number): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    console.error('Brak tokenu');
    return false;
  }

  try {
    const res = await fetch(`http://localhost:3001/flashcards/${id}/box`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ box: newBox })
    });

    if (!res.ok) {
      setFeedback('⚠️ Nie udało się zapisać postępu.');
      return false;
    }

    const text = await res.text();
    let data;
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse response:', text);
      return false;
    }

    if (data.flashcard && typeof data.flashcard.box === 'number') {
      setFlashcards(prev =>
        prev.map(card => (card.id === id ? data.flashcard : card))
      );
      setCurrentCard(data.flashcard);
      return true;
    }
    return false;
  } catch (err) {
    console.error('Błąd aktualizacji boxa:', err);
    setFeedback('⚠️ Nie udało się zapisać postępu.');
    return false;
  }
};

const saveAnswerStats = async (isCorrect: boolean): Promise<boolean> => {
  const token = localStorage.getItem('authToken');
  if (!token) return false;

  try {
    const res = await fetch('http://localhost:3001/api/auth/answers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ isCorrect })
    });
    
    return res.ok;
  } catch (err) {
    console.error('Błąd zapisu statystyk odpowiedzi:', err);
    return false;
  }
};

const checkAnswer = async () => {  // Make this function async
  if (!currentCard) return;

  const isCorrect = userGuess.trim().toLowerCase() === currentCard.answer.toLowerCase();
  const currentBox = typeof currentCard.box === 'number' ? currentCard.box : 1;

  const newBox = isCorrect
    ? Math.min(currentBox + 1, 5)
    : Math.max(currentBox - 1, 1);

  if (isCorrect) {
    setCorrectCount(prev => prev + 1);
  } else {
    setIncorrectCount(prev => prev + 1);
  }

  // Save stats first
  await saveAnswerStats(isCorrect);
  
  // Wait for the box update to complete
  const updateSuccess = await updateFlashcardBox(currentCard.id, newBox);
  
  // Only proceed if the update was successful
  if (updateSuccess) {
    setFeedback(isCorrect ? '✅ Nice one!' : '❌ Try again!');
    setBlurred(!isCorrect);

    if (isCorrect) {
      setTimeout(() => {
        const cards = flashcards
          .filter(card => card.category === selectedCategory)
          .sort((a, b) => (a.box || 1) - (b.box || 1));

        const nextCard = cards[(cardIndex + 1) % cards.length];
        setCardIndex((cardIndex + 1) % cards.length);
        setCurrentCard(nextCard);
        setUserGuess('');
        setFeedback('');
        setBlurred(true);
      }, 2000);
    }
  } else {
    setFeedback('⚠️ Nie udało się zapisać postępu. Spróbuj ponownie.');
  }
};

  const boxStats = [1, 2, 3, 4, 5].map(level => ({
    level,
    count: flashcards.filter(card => card.box === level).length,
  }));

  const totalAnswers = correctCount + incorrectCount;
  const percentage = totalAnswers > 0 ? ((correctCount / totalAnswers) * 100).toFixed(2) : null;

  return (
    <RequireAuth>
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
          {percentage !== null && (
            <div className="text-sm mt-1">🎯 Skuteczność: {percentage}%</div>
          )}
        </div>

        {currentCard && (
          <Flashcard
            question={currentCard.question}
            answer={currentCard.answer}
            category={currentCard.category}
            sourceLang={currentCard.sourceLang}
            targetLang={currentCard.targetLang}
            blurred={blurred}
            box={currentCard.box}
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
    </RequireAuth>
  );
};

export default GuessFlashcard;