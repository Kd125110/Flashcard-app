import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "axios";

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

  useEffect(() => {
    fetchFlashcards();
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const cardsToDelete = grouped[category];
    await Promise.all(cardsToDelete.map(card => axios.delete(`http://localhost:3001/flashcards/delete/${card.id}`)));
    fetchFlashcards();
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen min-w-screen bg-white p-4">
      <Navbar />
      <h1 className="mt-10 text-2xl font-bold mb-4">Zbiory fiszek</h1>
      <p className="text-gray-600 mb-6">Tutaj możesz zobaczyć, dodać, edytować lub usunąć fiszki pogrupowane według kategorii.</p>

      {/* Form */}
      <div className="mb-6 p-4 border rounded shadow bg-gray-50 w-full max-w-3xl">
        <h2 className="text-lg font-semibold mb-2">{editingCardId ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}</h2>
        <div className="grid grid-cols-2 gap-2">
          <input name="question" placeholder="Pytanie" value={newCard.question || ""} onChange={handleInputChange} className="border p-2 rounded" />
          <input name="answer" placeholder="Odpowiedź" value={newCard.answer || ""} onChange={handleInputChange} className="border p-2 rounded" />
          <input name="category" placeholder="Kategoria" value={newCard.category || ""} onChange={handleInputChange} className="border p-2 rounded" />
          <input name="sourceLang" placeholder="Język źródłowy" value={newCard.sourceLang || ""} onChange={handleInputChange} className="border p-2 rounded" />
          <input name="targetLang" placeholder="Język docelowy" value={newCard.targetLang || ""} onChange={handleInputChange} className="border p-2 rounded" />
        </div>
        <button onClick={handleAddOrUpdate} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          {editingCardId ? "Zapisz zmiany" : "Dodaj fiszkę"}
        </button>
      </div>

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
