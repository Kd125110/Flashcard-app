import React from "react";
import { FiEdit2, FiTrash2 } from "react-icons/fi";
import type { Flashcard } from "../hooks/useFlashcardSets";

interface FlashcardCardProps {
  card: Flashcard;
  handleEdit: (card: Flashcard) => void;
  handleDelete: (id: string) => void;
  getLanguageName: (code: string) => string;
}

const FlashcardCard: React.FC<FlashcardCardProps> = ({
  card,
  handleEdit,
  handleDelete,
  getLanguageName
}) => {
  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
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
  );
};

export default FlashcardCard;