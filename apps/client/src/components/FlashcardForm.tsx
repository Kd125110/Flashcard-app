import React from "react";
import { FiX, FiSave } from "react-icons/fi";
import type { Flashcard, LanguageOption } from "../hooks/useFlashcardSets";

interface FlashcardFormProps {
  newCard: Partial<Flashcard>;
  editingCardId: string | null;
  categories: string[];
  languageOptions: LanguageOption[];
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleAddOrUpdate: (e: React.FormEvent) => Promise<void>;
  resetForm: () => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({
  newCard,
  editingCardId,
  categories,
  languageOptions,
  handleInputChange,
  handleAddOrUpdate,
  resetForm
}) => {
  return (
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
              Pytanie <span className="text-red-500">*</span>
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
              Odpowiedź <span className="text-red-500">*</span>
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
              Kategoria <span className="text-red-500">*</span>
            </label>
            {newCard.category === 'new' ? (
              <div className="space-y-2">
                <input
                  type="text"
                  name="category"
                  placeholder="Wpisz nazwę nowej kategorii"
                  onChange={handleInputChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => handleInputChange({ target: { name: 'category', value: '' } } as React.ChangeEvent<HTMLInputElement>)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Wróć do wyboru kategorii
                </button>
              </div>
            ) : (
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
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Język źródłowy <span className="text-red-500">*</span>
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
                Język docelowy <span className="text-red-500">*</span>
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
  );
};

export default FlashcardForm;