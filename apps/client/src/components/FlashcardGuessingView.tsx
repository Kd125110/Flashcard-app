import React from 'react';
import Flashcard from './Flashcard';
import type { Flashcard as FlashcardType } from '../hooks/useFlashcardGuessing';

interface FlashcardGuessingViewProps {
  selectedCategory: string;
  currentCard: FlashcardType | null;
  userGuess: string;
  feedback: string;
  blurred: boolean;
  correctCount: number;
  incorrectCount: number;
  loading: boolean;
  error: string | null;
  categories: string[];
  boxStats: { level: number; count: number }[];
  percentage: string | null;
  handleCategoryChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleGuessChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  checkAnswer: () => Promise<void>;
}

const FlashcardGuessingView: React.FC<FlashcardGuessingViewProps> = ({
  selectedCategory,
  currentCard,
  userGuess,
  feedback,
  blurred,
  correctCount,
  incorrectCount,
  loading,
  error,
  categories,
  boxStats,
  percentage,
  handleCategoryChange,
  handleGuessChange,
  checkAnswer
}) => {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen bg-white p-4">
      <h1 className="text-2xl font-bold mb-4 mt-10">Zgadnij tłumaczenie</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          <span className="ml-3 text-gray-600">Ładowanie fiszek...</span>
        </div>
      ) : (
        <>
          <select
            className="mb-4 p-2 border rounded"
            value={selectedCategory}
            onChange={handleCategoryChange}
          >
            <option value="">Wybierz kategorię</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <div className='flex gap-2 mt-4'>
            {boxStats.map(stat => (
              <div key={stat.level} className='text-sm'>
                📦 {stat.level}: {stat.count}
              </div>
            ))}
          </div>

          <div className='mt-2 text-sm mb-4'>
            ✅ Poprawne: {correctCount} | ❌ Błędne: {incorrectCount}
            {percentage !== null && (
              <div className="text-sm mt-1">🎯 Skuteczność: {percentage}%</div>
            )}
          </div>

          {currentCard && (
            <Flashcard
              question={currentCard.question}
              answer={currentCard.answer}
              category={currentCard.category}
              sourceLang={currentCard.sourceLang}
              targetLang={currentCard.targetLang}
              blurred={blurred}
              box={currentCard.box}
            />
          )}

          {currentCard && (
            <>
              <input
                type="text"
                className="mt-6 p-2 border rounded mb-4"
                placeholder="Twoja odpowiedź"
                value={userGuess}
                onChange={handleGuessChange}
              />
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded"
                onClick={checkAnswer}
              >
                Sprawdź
              </button>
              {feedback && <p className="mt-2 text-lg">{feedback}</p>}
            </>
          )}

          {selectedCategory && !currentCard && (
            <div className="text-center py-6">
              <p className="text-lg text-gray-600">Brak fiszek w tej kategorii</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FlashcardGuessingView;