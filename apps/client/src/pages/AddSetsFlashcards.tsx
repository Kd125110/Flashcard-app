import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';

interface Flashcard {
    id: string;
    question: string;
    answer: string;
    category: string;
    sourceLang: string;
    targetLang: string;
}

const AddBulkFlashcards: React.FC = () => {
    const [bulkCards, setBulkCards] = useState<Flashcard[]>([
        {id: "", question: "", answer: "", category: "", sourceLang: "", targetLang: ""}
    ]);
    const [currentIndex, setCurrentIndex] = useState(0);

    const navigate = useNavigate();

    const handleBulkChange = (index: number, field: keyof Flashcard, value: string) => {
        const updated = [...bulkCards];
        updated[index][field] = value;
        setBulkCards(updated);
    };

    const handleNext = () => {
        if(currentIndex === bulkCards.length -1 ){
            setBulkCards(prev =>[
                  ...prev,
                    {id: "", question: "", answer: "", category: "", sourceLang: "", targetLang: ""}
            ])
        }
        setCurrentIndex(prev => prev + 1);
    };

    const handlePrevious = () => {
        if(currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleBulkSubmit = async () => {
        try{
            await axios.post("http://localhost:3001/flashcards/add-bulk", bulkCards);
            navigate("/show-flashcards-sets");
        }catch(error){
            console.error("Błąd podczas dodawania zestawu: ", error);
        }
    }

    const currentCard = bulkCards[currentIndex]
   
return (
 
<div className="p-6 max-w-4xl mx-auto">
      <Navbar />
      <h1 className="text-2xl font-bold mb-6">Dodaj zestaw fiszek</h1>

      <form onSubmit={handleBulkSubmit} className="space-y-6">
        <fieldset className="border border-gray-300 p-4 rounded-md">
          <legend className="font-semibold text-lg mb-2">Fiszka {currentIndex + 1}</legend>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Pytanie</label>
            <input
              type="text"
              placeholder="Pytanie"
              value={currentCard.question}
              onChange={(e) => handleBulkChange(currentIndex, "question", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Odpowiedź</label>
            <input
              type="text"
              placeholder="Odpowiedź"
              value={currentCard.answer}
              onChange={(e) => handleBulkChange(currentIndex, "answer", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Kategoria</label>
            <input
              type="text"
              placeholder="Kategoria"
              value={currentCard.category}
              onChange={(e) => handleBulkChange(currentIndex, "category", e.target.value)}
              className="w-full border p-2 rounded"
            />
          </div>

          <div className="mb-4">
            <label className="block mb-1 font-medium">Język źródłowy</label>
            <select
              value={currentCard.sourceLang}
              onChange={(e) => handleBulkChange(currentIndex, "sourceLang", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Wybierz język źródłowy</option>
              <option value="pl">Polski</option>
              <option value="en">Angielski</option>
              <option value="de">Niemiecki</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Język docelowy</label>
            <select
              value={currentCard.targetLang}
              onChange={(e) => handleBulkChange(currentIndex, "targetLang", e.target.value)}
              className="w-full border p-2 rounded"
            >
              <option value="">Wybierz język docelowy</option>
              <option value="pl">Polski</option>
              <option value="en">Angielski</option>
              <option value="de">Niemiecki</option>
            </select>
          </div>
        </fieldset>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="bg-gray-200 px-4 py-2 rounded disabled:opacity-50"
          >
            ⬅️ Poprzednia
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="bg-gray-200 px-4 py-2 rounded"
          >
            ➡️ Następna
          </button>
        </div>

        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            💾 Zapisz zestaw
          </button>
        </div>
      </form>
    </div>
  );




}


export default AddBulkFlashcards;