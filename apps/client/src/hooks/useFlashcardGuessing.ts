import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
  box?: number;
}

export const useFlashcardGuessing = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentCard, setCurrentCard] = useState<Flashcard | null>(null);
  const [userGuess, setUserGuess] = useState('');
  const [feedback, setFeedback] = useState('');
  const [cardIndex, setCardIndex] = useState(0);
  const [blurred, setBlurred] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchFlashcards = async () => {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await fetch('http://localhost:3001/flashcards', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const withBox = data.flashcards.map((card: Flashcard) => ({
          ...card,
          box: card.box ?? 1
        }));
        setFlashcards(withBox);
        setError(null);
      } catch (err) {
        console.error('Błąd pobierania fiszek:', err);
        setError('Nie udało się pobrać fiszek. Spróbuj ponownie później.');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
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

  const checkAnswer = async () => {
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

  const handleGuessChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserGuess(e.target.value);
  };

  return {
    flashcards,
    selectedCategory,
    currentCard,
    userGuess,
    feedback,
    blurred,
    correctCount,
    incorrectCount,
    loading,
    error,
    categories,
    boxStats,
    percentage,
    handleCategoryChange,
    handleGuessChange,
    checkAnswer
  };
};

export default useFlashcardGuessing;