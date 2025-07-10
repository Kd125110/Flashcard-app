import React, { useState } from 'react';
import Flashcard from '../components/Flashcard';
import Navbar from '../components/Navbar';

interface FlashcardData {
  question: string;
  answer: string;
  category: string;
}

const AddFlashcardPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('');
  const [message, setMessage] = useState('');
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/flashcards/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, category }),
      });

      if (response.ok) {
        setMessage('Dodano fiszkę!');
        setFlashcards(prev => [...prev, { question, answer, category }]);
        setQuestion('');
        setAnswer('');
        setCategory('');
      } else {
        setMessage('Błąd podczas dodawania fiszki.');
      }
    } catch {
      setMessage('Błąd połączenia z serwerem.');
    }
  };

  return (
    <div className="flashcard-layout">
      <Navbar />
      <form
        onSubmit={handleSubmit}
        className='bg-white p-8 rounded shadow min-w-[300px] flex flex-col gap-4'
      >
        <h2>Dodaj nową fiszkę</h2>
        <input
          className="p-2 border border-gray-300 rounded text-base"
          type="text"
          placeholder="Słowo"
          value={question}
          onChange={e => setQuestion(e.target.value)}
          required
        />
        <input
          className="p-2 border border-gray-300 rounded text-base"
          type="text"
          placeholder="Tłumaczenie"
          value={answer}
          onChange={e => setAnswer(e.target.value)}
          required
        />
        <input
          className="p-2 border border-gray-300 rounded text-base"
          type="text"
          placeholder="Kategoria"
          value={category}
          onChange={e => setCategory(e.target.value)}
          required
        />
        <button type="submit" className="p-3 rounded border-none bg-[#007bff] text-white font-bold cursor-pointer text-base">
          Dodaj fiszkę</button>
        {message && <p>{message}</p>}
      </form>

      <div className="flex-1 flex justify-end">
        {flashcards.length > 0 && (
          <Flashcard
            question={flashcards[flashcards.length - 1].question}
            answer={flashcards[flashcards.length - 1].answer}
            category={flashcards[flashcards.length - 1].category}
          />
        )}
      </div>
    </div>
  );
};

export default AddFlashcardPage;
