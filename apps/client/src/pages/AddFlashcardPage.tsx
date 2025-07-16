import React, { useState } from 'react';
import Flashcard from '../components/Flashcard';
import Navbar from '../components/Navbar';

interface FlashcardData {
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
}

const AddFlashcardPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [message, setMessage] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');

    const allowedPairs = [
      ['Polish', 'English'],
      ['English', 'Polish'],
      ['Polish', 'German'],
      ['German', 'Polish'],
    ];

    const isValidPair = allowedPairs.some(
      ([src, tgt]) => src === sourceLang && tgt === targetLang
    );

    if (!isValidPair) {
      setMessage('Dozwolone są tylko pary językowe: PL-EN, EN-PL, PL-DE, DE-PL');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/flashcards/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category, sourceLang, targetLang }),
      });

      if (response.ok) {
        const newCard = { question, answer, category, sourceLang, targetLang };
        setFlashcards(prev => [...prev, newCard]);
        setMessage('Dodano fiszkę!');

        // Clear form fields
        setQuestion('');
        setAnswer('');
        setCategory('');
        setSourceLang('');
        setTargetLang('');
      } else {
        setMessage('Błąd podczas dodawania fiszki.');
      }
    } catch {
      setMessage('Błąd połączenia z serwerem.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 flex flex-col items-center">
      <Navbar />

      <div className="flex flex-col lg:flex-row items-start justify-center gap-8 p-6 w-full">
        {/* Form Section */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md w-full max-w-md flex flex-col gap-4"
        >
          <h2 className="text-xl font-semibold">Dodaj nową fiszkę</h2>

          <input
            className="w-full p-2 border border-gray-300 rounded text-base"
            type="text"
            placeholder="Słowo"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border border-gray-300 rounded text-base"
            type="text"
            placeholder="Tłumaczenie"
            value={answer}
            onChange={e => setAnswer(e.target.value)}
            required
          />
          <input
            className="w-full p-2 border border-gray-300 rounded text-base"
            type="text"
            placeholder="Kategoria"
            value={category}
            onChange={e => setCategory(e.target.value)}
            required
          />

          <select
            className="w-full p-2 border border-gray-300 rounded text-base"
            value={sourceLang}
            onChange={e => setSourceLang(e.target.value)}
            required
          >
            <option value="">Wybierz język źródłowy</option>
            <option value="Polish">Polski</option>
            <option value="English">Angielski</option>
            <option value="German">Niemiecki</option>
          </select>

          <select
            className="w-full p-2 border border-gray-300 rounded text-base"
            value={targetLang}
            onChange={e => setTargetLang(e.target.value)}
            required
          >
            <option value="">Wybierz język docelowy</option>
            <option value="Polish">Polski</option>
            <option value="English">Angielski</option>
            <option value="German">Niemiecki</option>
          </select>

          <button
            type="submit"
            className="w-full p-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700 transition"
          >
            Dodaj fiszkę
          </button>

          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>

        {/* Flashcard Preview */}
        <div className="w-full max-w-xs sm:max-w-sm md:max-w-md self-center lg:self-start min-h-[200px]">
          {flashcards.length > 0 ? (
            <Flashcard
              question={flashcards[flashcards.length - 1].question}
              answer={flashcards[flashcards.length - 1].answer}
              category={flashcards[flashcards.length - 1].category}
              sourceLang={flashcards[flashcards.length - 1].sourceLang}
              targetLang={flashcards[flashcards.length - 1].targetLang}
            
            />
          ) : (
            <div className="w-full h-full rounded-xl border border-dashed border-gray-300 flex items-center justify-center text-gray-400">
              Podgląd fiszki pojawi się tutaj
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddFlashcardPage;
