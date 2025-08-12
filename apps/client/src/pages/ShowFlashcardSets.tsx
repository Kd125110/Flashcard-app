import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { FiEdit2, FiTrash2, FiChevronDown, FiChevronUp, FiPlus, FiX, FiSave } from "react-icons/fi";

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
}

const ShowFlashcardSets: React.FC = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Flashcard[]>>({});
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchFlashcards();
  }, []);

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
    
    // Initialize all sets as expanded
    const initialExpandedState = Object.keys(groupedByCategory).reduce((acc, category) => {
      acc[category] = true;
      return acc;
    }, {} as Record<string, boolean>);
    
    setExpandedSets(initialExpandedState);
  }, [flashcards]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      const response = await fetch('http://localhost:3001/flashcards/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      setCategories(data || []);
    } catch (err) {
      console.error('Error fetching categories:', err);
      // Fallback: If categories endpoint fails, try to get categories from flashcards
      fetchFlashcards();
    }
  };

  const fetchFlashcards = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        setIsLoading(false);
        return;
      }
      
      const response = await axios.get('http://localhost:3001/flashcards/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
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
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to load flashcards. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setNewCard({ ...newCard, [e.target.name]: e.target.value });
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      if (editingCardId) {
        await axios.put(`http://localhost:3001/flashcards/${editingCardId}`, newCard, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setEditingCardId(null);
      } else {
        await axios.post("http://localhost:3001/flashcards/add", newCard, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
      
      setNewCard({});
      setIsFormVisible(false);
      fetchFlashcards();
      fetchCategories();
    } catch (error) {
      console.error("Error saving flashcard:", error);
      setError('Failed to save flashcard. Please try again.');
    }
  };

  const handleEdit = (card: Flashcard) => {
    setNewCard(card);
    setEditingCardId(card.id);
    setIsFormVisible(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this flashcard?')) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      await axios.delete(`http://localhost:3001/flashcards/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchFlashcards();
    } catch (error) {
      console.error("Error deleting flashcard:", error);
      setError('Failed to delete flashcard. Please try again.');
    }
  };

  const handleDeleteSet = async (category: string) => {
    if (!window.confirm(`Are you sure you want to delete the entire "${category}" set?`)) {
      return;
    }
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      await axios.delete(`http://localhost:3001/flashcards/category/${category}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      fetchFlashcards();
      fetchCategories();
    } catch (error) {
      console.error("Error deleting flashcard set:", error);
      setError('Failed to delete flashcard set. Please try again.');
    }
  };

  const toggleSetExpansion = (category: string) => {
    setExpandedSets(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const resetForm = () => {
    setNewCard({});
    setEditingCardId(null);
    setIsFormVisible(false);
  };

  const languageOptions = [
    { value: "pl", label: "Polski" },
    { value: "en", label: "Angielski" },
    { value: "de", label: "Niemiecki" },
    { value: "fr", label: "Francuski" },
    { value: "es", label: "Hiszpański" },
    { value: "it", label: "Włoski" },
  ];

  const getLanguageName = (code: string) => {
    const language = languageOptions.find(lang => lang.value === code);
    return language ? language.label : code;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mr-6">Zbiory fiszek</h1>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
            <button
              onClick={() => setIsFormVisible(!isFormVisible)}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              {isFormVisible ? (
                <>
                  <FiX className="mr-2" /> Ukryj formularz
                </>
              ) : (
                <>
                  <FiPlus className="mr-2" /> Dodaj fiszkę
                </>
              )}
            </button>
            
            <Link
              to="/add-bulk-flashcards"
              className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            >
              <FiPlus className="mr-2" /> Dodaj zestaw fiszek
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6 relative">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 bottom-0 right-0 px-4"
              onClick={() => setError(null)}
            >
              <FiX />
            </button>
          </div>
        )}
        
        {/* Flashcard Form */}
        {isFormVisible && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800">
                {editingCardId ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}
              </h2>
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAddOrUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Pytanie
                  </label>
                  <input
                    type="text"
                    name="question"
                    placeholder="Wpisz pytanie lub słowo"
                    value={newCard.question || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Odpowiedź
                  </label>
                  <input
                    type="text"
                    name="answer"
                    placeholder="Wpisz odpowiedź lub tłumaczenie"
                    value={newCard.answer || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kategoria
                  </label>
                  <select
                    name="category"
                    value={newCard.category || ""}
                    onChange={handleInputChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Wybierz kategorię</option>
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Język źródłowy
                    </label>
                    <select
                      name="sourceLang"
                      value={newCard.sourceLang || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                      <option value="">Wybierz język</option>
                      {languageOptions.map(lang => (
                        <option key={`source-${lang.value}`} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Język docelowy
                    </label>
                    <select
                      name="targetLang"
                      value={newCard.targetLang || ""}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    >
                    <option value="">Wybierz język</option>
                     {languageOptions.map(lang => (
                        <option key={`target-${lang.value}`} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                {editingCardId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Anuluj
                  </button>
                )}
                
                <button
                  type="submit"
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <FiSave className="mr-2" />
                  {editingCardId ? "Zapisz zmiany" : "Dodaj fiszkę"}
                </button>
              </div>
            </form>
          </div>
        )}
        
        {/* Flashcard Sets */}
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : Object.entries(grouped).length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <div className="flex justify-center mb-4">
              <svg className="h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Brak fiszek do wyświetlenia</h3>
            <p className="text-gray-500 mb-6">Dodaj swoją pierwszą fiszkę, aby rozpocząć naukę</p>
            <div className="flex flex-col sm:flex-row justify-center gap-3">
              <button
                onClick={() => setIsFormVisible(true)}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Dodaj fiszkę
              </button>
              <Link
                to="/add-bulk-flashcards"
                className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <FiPlus className="mr-2" /> Dodaj zestaw fiszek
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([category, cards]) => {
              const isExpanded = expandedSets[category] !== false;
              
              return (
                <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div 
                    className="px-6 py-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => toggleSetExpansion(category)}
                  >
                    <div className="flex items-center space-x-3">
                      {isExpanded ? 
                        <FiChevronUp className="text-gray-500" /> : 
                        <FiChevronDown className="text-gray-500" />
                      }
                      <h2 className="text-xl font-medium text-gray-800">{category}</h2>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        {cards.length}
                      </span>
                    </div>
                    
                    <div className="flex items-center">
                      <Link
                        to={`/guess`}
                        className="mr-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Ucz się
                      </Link>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSet(category);
                        }} 
                        className="text-red-500 hover:text-red-700 text-sm font-medium flex items-center"
                      >
                        <FiTrash2 className="mr-1" />
                        <span className="hidden sm:inline">Usuń zestaw</span>
                      </button>
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="divide-y divide-gray-100">
                      {cards.map((card) => (
                        <div key={card.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                            <div className="flex-grow">
                              <div className="flex flex-col sm:flex-row sm:items-baseline">
                                <span className="font-medium text-gray-900">{card.question}</span>
                                <span className="mx-0 sm:mx-2 text-gray-400">→</span>
                                <span className="text-gray-800">{card.answer}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                {getLanguageName(card.sourceLang)} → {getLanguageName(card.targetLang)}
                              </div>
                            </div>
                            <div className="flex space-x-2 mt-2 sm:mt-0">
                              <button 
                                onClick={() => handleEdit(card)} 
                                className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50 transition-colors"
                                title="Edytuj"
                              >
                                <FiEdit2 size={18} />
                              </button>
                              <button 
                                onClick={() => handleDelete(card.id)} 
                                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                title="Usuń"
                              >
                                <FiTrash2 size={18} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowFlashcardSets;