import React from "react";
import Navbar from "../components/Navbar";

const ShowFlashcardSets: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen min-w-screen bg-white p-4">
        <Navbar />
      <h1 className="text-2xl font-bold mb-4">Zbiory fiszek</h1>
      <p className="text-gray-600">Tutaj możesz zobaczyć swoje zbiory fiszek.</p>
      {/* Add logic to fetch and display flashcard sets here */}
    </div>
  );
}

export default ShowFlashcardSets;
