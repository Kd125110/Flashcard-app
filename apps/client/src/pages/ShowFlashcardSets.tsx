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
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]); // Add this state
  const [grouped, setGrouped] = useState<Record<string, Flashcard[]>>({});
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    fetchFlashcards();
  }, []);

  // Group flashcards by category whenever flashcards change
  useEffect(() => {
    const groupedByCategory = flashcards.reduce((acc, card) => {
      const category = card.category || 'Uncategorized';
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(card);
      return acc;
    }, {} as Record<string, Flashcard[]>);
    
    setGrouped(groupedByCategory);
  }, [flashcards]);

  useEffect(() => {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
      console.error('No authentication token found');
      return;
    }
    
    fetch('http://localhost:3001/flashcards/categories', {
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
        console.log('Categories data:', data);
        setCategories(data || []);
      })
      .catch(err => {
        console.error('Błąd podczas pobierania kategorii: ', err);
        // Fallback: If categories endpoint fails, try to get categories from flashcards
        fetchFlashcards();
      });
  }, []);

  const fetchFlashcards = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      const response = await axios.get('http://localhost:3001/flashcards/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Flashcards response:', response.data);
      
      if (response.data.flashcards) {
        setFlashcards(response.data.flashcards);
        
        // Extract categories if the categories endpoint failed
        const uniqueCategories = [...new Set(response.data.flashcards
         .filter((card: any): card is Flashcard => typeof card === 'object' && card !== null && 'category' in card)
         .map((card: Flashcard) => card.category))] as string[];
        if (categories.length === 0) {
          setCategories(uniqueCategories);
        }
      } else {
        setFlashcards([]);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania fiszek:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent form submission
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      if (editingCardId) {
        // Update existing flashcard
        await axios.put(`http://localhost:3001/flashcards/${editingCardId}`, newCard, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEditingCardId(null);
      } else {
        // Add new flashcard
        await axios.post("http://localhost:3001/flashcards/add", newCard, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
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
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      await axios.delete(`http://localhost:3001/flashcards/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchFlashcards();
    } catch (error) {
      console.error("Błąd podczas usuwania fiszki:", error);
    }
  };

  const handleDeleteSet = async (category: string) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      await axios.delete(`http://localhost:3001/flashcards/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchFlashcards();
    } catch (error) {
      console.error("Błąd podczas usuwania zestawu fiszek:", error);
    }
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
              required
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
              required
            />
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Kategoria</label>
            <select
              name="category"
              value={newCard.category || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required
              >
                <option value="">Wybierz kategorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="new">+ Nowa kategoria</option>
            </select>
            {newCard.category === 'new' && (
              <input
                type="text"
                name="category"
                placeholder="Wpisz nazwę nowej kategorii"
                onChange={handleInputChange}
                className="w-full border p-2 rounded mt-2"
                required
              />
            )}
          </div>
          <div className="mb-4">
            <label className="block mb-1 font-medium">Język źródłowy</label>
            <select
              name="sourceLang"
              value={newCard.sourceLang || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required
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
              name="targetLang"
              value={newCard.targetLang || ""}
              onChange={handleInputChange}
              className="w-full border p-2 rounded"
              required
              >
              <option value="">Wybierz język docelowy</option>
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
          {editingCardId && (
            <button
              type="button"
              onClick={() => {
                setEditingCardId(null);
                setNewCard({});
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 ml-2">
                Anuluj edycję
            </button>
          )}
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
                <button 
                  onClick={() => handleDeleteSet(category)} 
                  className="text-red-600 text-sm hover:underline"
                >
                  Usuń cały zestaw
                </button>
              </div>
              <ul className="list-disc list-inside">
                {cards.map((card) => (
                  <li key={card.id} className="mb-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <div>
                        <strong>{card.question}</strong> → {card.answer} 
                        <span className="text-gray-500 text-sm ml-1">
                          ({card.sourceLang} → {card.targetLang})
                        </span>
                      </div>
                      <div className="mt-1 sm:mt-0">
                        <button 
                          onClick={() => handleEdit(card)} 
                          className="text-blue-500 hover:underline mr-2"
                        >
                          Edytuj
                        </button>
                        <button 
                          onClick={() => handleDelete(card.id)} 
                          className="text-red-500 hover:underline"
                        >
                          Usuń
                        </button>
                      </div>
                    </div>
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