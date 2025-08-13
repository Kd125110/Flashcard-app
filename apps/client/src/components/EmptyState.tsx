import React from "react";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";

interface EmptyStateProps {
  toggleFormVisibility: () => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({ toggleFormVisibility }) => {
  return (
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
          onClick={toggleFormVisibility}
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
  );
};

export default EmptyState;