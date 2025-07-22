import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";
import { Link } from "react-router-dom";


interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
}

const ShowFlashcardSets: React.FC = () => {
  const [grouped, setGrouped] = useState<Record<string, Flashcard[]>>({});
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  useEffect(() =>{
    fetch('http://localhost:3001/flashcards/categories')
      .then(res => res.json())
      .then(data => setCategories(data.categories))
      .catch(err => console.error('Błąd podzcas pobierania kategorii: ', err));
  }, []);  

  const fetchFlashcards = () => {
    axios.get("http://localhost:3001/flashcards/")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : res.data.flashcards;
        const groupedByCategory = data.reduce((acc: Record<string, Flashcard[]>, card: Flashcard) => {
          const categoryKey = card.category || "Bez kategorii";
          if (!acc[categoryKey]) acc[categoryKey] = [];
          acc[categoryKey].push(card);
          return acc;
        }, {});
        setGrouped(groupedByCategory);
      })
      .catch((err) => console.error("Błąd podczas pobierania fiszek:", err));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async () => {
    try {
      if (editingCardId) {
        await axios.put(`http://localhost:3001/flashcards/edit/${editingCardId}`, newCard);
        setEditingCardId(null);
      } else {
        await axios.post("http://localhost:3001/flashcards/add", newCard);
      }
      setNewCard({});
      fetchFlashcards();
    } catch (error) {
      console.error("Błąd podczas zapisywania fiszki:", error);
    }
  };

  const handleEdit = (card: Flashcard) => {
    setNewCard(card);
    setEditingCardId(card.id);
  };

  const handleDelete = async (id: string) => {
    await axios.delete(`http://localhost:3001/flashcards/delete/${id}`);
    fetchFlashcards();
  };

  const handleDeleteSet = async (category: string) => {
  await axios.delete(`http://localhost:3001/flashcards/delete/category/${category}`);
  fetchFlashcards();
};

  return (
    <div className="flex flex-col items-center justify-start min-h-screen min-w-screen bg-white p-4">
      <Navbar />
      <h1 className="mt-10 text-2xl font-bold mb-4">Zbiory fiszek</h1>
        <Link to="/add-bulk-flashcards" className="text-blue-600 underline mb-4 block">
          ➕ Dodaj nowy zestaw fiszek
        </Link>
      <p className="text-gray-600 mb-6">Tutaj możesz zobaczyć, dodać, edytować lub usunąć fiszki pogrupowane według kategorii.</p>

      {/* Form */}
      <form onSubmit={handleAddOrUpdate} className="space-y-6 mb-4">
        <fieldset className="border border-gray-300 p-4 rounded-md">
          <legend className="font-smeibold text-lg mb-2">
            {editingCardId ? "Edytuj fiszke" : "Dodaj fiszkę"}
          </legend>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Pytanie</label>
            <input
              type="text"
              name="question"
              placeholder="Pytanie"
              value={newCard.question || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Odpowiedź</label>
            <input
              type="text"
              name="answer"
              placeholder="Odpowiedź"
              value={newCard.answer || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Kategoria</label>
            <select
              name="category"
              value={newCard.category || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              >
                <option value="">Wybierz kategorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Język źródłowy</label>
            <select
              name="sourceLang"
              value={newCard.sourceLang || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              >
              <option value="">Wybierz język źródłowy</option>
              <option value="pl">Polski</option>
              <option value="en">Angielski</option>
              <option value="de">Niemiecki</option>
            </select>
          </div>
             <div className="mb-4">
            <label className="block mb-1 font-medium">Język docelowy</label>
            <select
              name="sourceLang"
              value={newCard.sourceLang || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              >
              <option value="">Wybierz język źródłowy</option>
              <option value="pl">Polski</option>
              <option value="en">Angielski</option>
              <option value="de">Niemiecki</option>
            </select>
          </div>
        </fieldset>
        <div className="mt-6">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              {editingCardId ? "Zapisz zmiany" : "Dodaj fiszkę"}   
          </button>
        </div>
      </form>

      {/* Flashcard Sets */}
      <div className="w-full max-w-3xl">
        {Object.entries(grouped).length === 0 ? (
          <p className="text-gray-500">Brak fiszek do wyświetlenia.</p>
        ) : (
          Object.entries(grouped).map(([category, cards]) => (
            <div key={category} className="mb-6 border rounded p-4 shadow">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-xl font-semibold">{category}</h2>
                <button onClick={() => handleDeleteSet(category)} className="text-red-600 text-sm">Usuń cały zestaw</button>
              </div>
              <ul className="list-disc list-inside">
                {cards.map((card) => (
                  <li key={card.id}>
                    <strong>{card.question}</strong> → {card.answer} ({card.sourceLang} → {card.targetLang})
                    <button onClick={() => handleEdit(card)} className="text-blue-500 ml-2">Edytuj</button>
                    <button onClick={() => handleDelete(card.id)} className="text-red-500 ml-2">Usuń</button>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShowFlashcardSets;
