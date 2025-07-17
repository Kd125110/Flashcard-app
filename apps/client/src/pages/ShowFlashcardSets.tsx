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

  useEffect(() => {
  axios.get("http://localhost:3001/flashcards")
    .then((res) => {
      console.log("Odpowiedź z backendu:", res.data);

      const data = Array.isArray(res.data) ? res.data : res.data.flashcards;

      const groupedByCategory = data.reduce((acc: Record<string, Flashcard[]>, card:Flashcard) => {
        const categoryKey = card.category || "Bez kategorii";
        if (!acc[categoryKey]) {
          acc[categoryKey] = [];
        }
        acc[categoryKey].push(card);
        return acc;
      }, {});

      setGrouped(groupedByCategory);
    })
    .catch((err) => console.error("Błąd podczas pobierania fiszek:", err));
}, []);


  return (
    <div className="flex flex-col items-center justify-start min-h-screen min-w-screen bg-white p-4">
      <Navbar />
      <h1 className="mt-10 text-2xl font-bold mb-4">Zbiory fiszek</h1>
      <p className="text-gray-600 mb-6">Tutaj możesz zobaczyć swoje zbiory fiszek pogrupowane według kategorii.</p>

      <div className="w-full max-w-3xl">
        {Object.entries(grouped).length === 0 ? (
          <p className="text-gray-500">Brak fiszek do wyświetlenia.</p>
        ) : (
          Object.entries(grouped).map(([category, cards]) => (
            <div key={category} className="mb-6 border rounded p-4 shadow">
              <h2 className="text-xl font-semibold mb-2">{category}</h2>
              <ul className="list-disc list-inside">
                {cards.map((card) => (
                  <li key={card.id}>
                    <strong>{card.question}</strong> → {card.answer} ({card.sourceLang} → {card.targetLang})
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
