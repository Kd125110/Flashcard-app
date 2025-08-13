import React from "react";
import Navbar from "../components/Navbar";
import FlashcardSetsView from "../components/FlashcardSetsView";
import useFlashcardSets from "../hooks/useFlashcardSets";

const ShowFlashcardSets: React.FC = () => {
  const flashcardSetsProps = useFlashcardSets();
  
  return (
    <div className="min-h-screen">
      <Navbar />
      <FlashcardSetsView {...flashcardSetsProps} />
    </div>
  );
};

export default ShowFlashcardSets;