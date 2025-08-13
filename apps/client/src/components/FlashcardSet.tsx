import React from "react";
import { Link } from "react-router-dom";
import { FiChevronDown, FiChevronUp, FiTrash2 } from "react-icons/fi";
import FlashcardCard from "./FlashcardCard";
import type { Flashcard } from "../hooks/useFlashcardSets";

interface FlashcardSetProps {
  category: string;
  cards: Flashcard[];
  isExpanded: boolean;
  toggleSetExpansion: (category: string) => void;
  handleEdit: (card: Flashcard) => void;
  handleDelete: (id: string) => void;
  handleDeleteSet: (category: string) => void;
  getLanguageName: (code: string) => string;
}

const FlashcardSet: React.FC<FlashcardSetProps> = ({
  category,
  cards,
  isExpanded,
  toggleSetExpansion,
  handleEdit,
  handleDelete,
  handleDeleteSet,
  getLanguageName
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
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
            <FlashcardCard
              key={card.id}
              card={card}
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              getLanguageName={getLanguageName}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default FlashcardSet;