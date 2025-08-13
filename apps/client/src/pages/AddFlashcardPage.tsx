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
    ["Polish", "English"],
    ["English", "Polish"],
    ["Polish", "German"],
    ["German", "Polish"],
    ["German", "English"],
    ["English", "German"]
  ];

  const isValidPair = allowedPairs.some(
    ([src, tgt]) => src === sourceLang && tgt === targetLang
  );
  
  if (!isValidPair) {
    setMessage("Dozwolone są tylko pary językowe: PL-EN, EN-PL, PL-DE, DE-PL");
    return;
  }
  
  try {
    // Get the authentication token from localStorage or wherever you store it
    const token = localStorage.getItem('authToken');
    
    const response = await fetch('http://localhost:3001/flashcards/add', {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ question, answer, category, sourceLang, targetLang }),
    credentials: 'include'
  });
    if (response.ok) {
      const data = await response.json();
      setMessage('Dodano fiszkę!');
      setFlashcards(prev => [...prev, { 
        question, 
        answer, 
        category, 
        sourceLang, 
        targetLang 
      }]);
      setQuestion('');
      setAnswer('');
      setCategory('');
      setSourceLang('');
      setTargetLang('');
    } else {
      // Try to get more detailed error message from the server
      const errorData = await response.json().catch(() => ({}));
      setMessage(`Błąd podczas dodawania fiszki: ${errorData.message || response.statusText}`);
    }
  } catch (error) {
    console.error('Error adding flashcard:', error);
    setMessage('Błąd połączenia z serwerem.');
  }
};

return (
  <div className="min-h-screen bg-white mt-10">
    {/* Navbar jako element nadrzędny */}
    <Navbar />

    {/* Główny układ strony */}
    <div className="bg-white flex flex-col lg:flex-row justify-center items-start gap-10 p-6 max-w-screen-xl mx-auto">
      
      {/* Formularz dodawania fiszki */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-6 md:p-8 rounded shadow min-w-[100px] sm:min-w-[150px] md:min-w-[300px] flex flex-col gap-4 w-full sm:w-3/4 md:w-2/3 lg:w-1/2 xl:w-1/3"

      >
        <h2 className="text-xl font-semibold">Dodaj nową fiszkę</h2>

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
        <select
          className="p-2 border border-gray-300 rounded text-base"
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
          className="p-2 border border-gray-300 rounded text-base"
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
          className="p-3 rounded bg-blue-600 text-white font-bold hover:bg-blue-700"
        >
          Dodaj fiszkę
        </button>

        {message && <p className="text-sm text-center">{message}</p>}
      </form>

      {/* Podgląd ostatnio dodanej fiszki */}
      <div className="w-full lg:w-1/2 flex justify-center items-start mt-10">
        {flashcards.length > 0 && (
          <Flashcard
            question={flashcards[flashcards.length - 1].question}
            answer={flashcards[flashcards.length - 1].answer}
            category={flashcards[flashcards.length - 1].category}
            sourceLang={flashcards[flashcards.length - 1].sourceLang}
            targetLang={flashcards[flashcards.length - 1].targetLang}
          />
        )}
      </div>
    </div>
  </div>
);

};

export default AddFlashcardPage;
