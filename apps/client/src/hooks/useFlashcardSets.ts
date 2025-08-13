import { useState, useEffect } from "react";
import axios from "axios";

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  category: string;
  sourceLang: string;
  targetLang: string;
}

export interface LanguageOption {
  value: string;
  label: string;
}

export const useFlashcardSets = () => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [grouped, setGrouped] = useState<Record<string, Flashcard[]>>({});
  const [newCard, setNewCard] = useState<Partial<Flashcard>>({});
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [expandedSets, setExpandedSets] = useState<Record<string, boolean>>({});
  const [isFormVisible, setIsFormVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const languageOptions: LanguageOption[] = [
    { value: "pl", label: "Polski" },
    { value: "en", label: "Angielski" },
    { value: "de", label: "Niemiecki" },
  ];

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
    const { name, value } = e.target;
    setNewCard(prev => ({ ...prev, [name]: value }));
  };

  const handleAddOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('No authentication token found');
        return;
      }
      
      // Validate required fields
      if (!newCard.question || !newCard.answer || 
          !newCard.sourceLang || !newCard.targetLang) {
        setError('Wszystkie pola są wymagane.');
        return;
      }
      
      // Handle category validation
      if (!newCard.category) {
        setError('Kategoria jest wymagana.');
        return;
      }
      
      // Special handling for new category
      let categoryToUse = newCard.category;
      
      // If it's not a new category, validate that it belongs to the user
      if (newCard.category !== 'new' && !categories.includes(newCard.category)) {
        setError('Wybrana kategoria jest nieprawidłowa. Wybierz kategorię z listy lub utwórz nową.');
        return;
      }
      
      // Prepare the flashcard data
      const flashcardData = {
        question: newCard.question,
        answer: newCard.answer,
        category: categoryToUse,
        sourceLang: newCard.sourceLang,
        targetLang: newCard.targetLang
      };
      
      if (editingCardId) {
        await axios.put(`http://localhost:3001/flashcards/${editingCardId}`, flashcardData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setEditingCardId(null);
      } else {
        const response = await axios.post("http://localhost:3001/flashcards/add", flashcardData, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Flashcard added successfully:", response.data);
      }
      
      setNewCard({});
      setIsFormVisible(false);
      fetchFlashcards();
      fetchCategories(); // Refresh categories to include any new ones
    } catch (error: any) {
      console.error("Error saving flashcard:", error);
      
      // More detailed error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Failed to save flashcard: ${error.response.data.message || error.response.statusText}`);
      } else if (error.request) {
        // The request was made but no response was received
        setError('Server did not respond. Please check your connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to save flashcard. Please try again.');
      }
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

  const toggleFormVisibility = () => {
    setIsFormVisible(!isFormVisible);
  };

  const clearError = () => {
    setError(null);
  };

  const getLanguageName = (code: string) => {
    const language = languageOptions.find(lang => lang.value === code);
    return language ? language.label : code;
  };

  return {
    flashcards,
    grouped,
    newCard,
    editingCardId,
    categories,
    expandedSets,
    isFormVisible,
    isLoading,
    error,
    languageOptions,
    handleInputChange,
    handleAddOrUpdate,
    handleEdit,
    handleDelete,
    handleDeleteSet,
    toggleSetExpansion,
    resetForm,
    toggleFormVisibility,
    clearError,
    getLanguageName
  };
};

export default useFlashcardSets;