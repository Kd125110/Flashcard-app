import React from 'react';
import Navbar from '../components/Navbar';
import FlashcardGuessingView from '../components/FlashcardGuessingView';
import RequireAuth from '../components/RequireAuth';
import useFlashcardGuessing from '../hooks/useFlashcardGuessing';

const GuessFlashcard: React.FC = () => {
  const flashcardGuessingProps = useFlashcardGuessing();
  
  return (
    <RequireAuth>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <FlashcardGuessingView {...flashcardGuessingProps} />
      </div>
    </RequireAuth>
  );
};

export default GuessFlashcard;