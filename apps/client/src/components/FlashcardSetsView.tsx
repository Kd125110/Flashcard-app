import React from "react";
import { Link } from "react-router-dom";
import { FiPlus, FiX } from "react-icons/fi";
import FlashcardForm from "./FlashcardForm";
import FlashcardSet from "./FlashcardSet";
import EmptyState from "./EmptyState";
import type { Flashcard, LanguageOption } from "../hooks/useFlashcardSets";

interface FlashcardSetsViewProps {
  flashcards: Flashcard[];
  grouped: Record<string, Flashcard[]>;
  newCard: Partial<Flashcard>;
  editingCardId: string | null;
  categories: string[];
  expandedSets: Record<string, boolean>;
  isFormVisible: boolean;
  isLoading: boolean;
  error: string | null;
  languageOptions: LanguageOption[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddOrUpdate: (e: React.FormEvent) => Promise<void>;
  handleEdit: (card: Flashcard) => void;
  handleDelete: (id: string) => void;
  handleDeleteSet: (category: string) => void;
  toggleSetExpansion: (category: string) => void;
  resetForm: () => void;
  toggleFormVisibility: () => void;
  clearError: () => void;
  getLanguageName: (code: string) => string;
}

const FlashcardSetsView: React.FC<FlashcardSetsViewProps> = ({
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
}) => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 mt-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mr-6">Zbiory fiszek</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
          <button
            onClick={toggleFormVisibility}
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
            onClick={clearError}
          >
            <FiX />
          </button>
        </div>
      )}
      
      {/* Flashcard Form */}
      {isFormVisible && (
        <FlashcardForm
          newCard={newCard}
          editingCardId={editingCardId}
          categories={categories}
          languageOptions={languageOptions}
          handleInputChange={handleInputChange}
          handleAddOrUpdate={handleAddOrUpdate}
          resetForm={resetForm}
        />
      )}
      
      {/* Flashcard Sets */}
      {isLoading ? (
        <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : Object.entries(grouped).length === 0 ? (
        <EmptyState toggleFormVisibility={toggleFormVisibility} />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, cards]) => (
            <FlashcardSet
              key={category}
              category={category}
              cards={cards}
              isExpanded={expandedSets[category] !== false}
              toggleSetExpansion={toggleSetExpansion}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              handleDeleteSet={handleDeleteSet}
              getLanguageName={getLanguageName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSetsView;