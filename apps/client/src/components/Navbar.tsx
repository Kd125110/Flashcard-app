import React from "react";
import { useNavigate } from 'react-router-dom';
import '../App.css'

const Navbar: React.FC = () => {
const navigate = useNavigate();

const handleLogout = () => {
    navigate('/login'); 
}

const handleDashboard = () => {
    navigate('/dashboard');
};

const handleAddFlashcard = () => {
    navigate('/add-flashcard');
};
const handleShowFlashcardSets = () => {
    navigate('/show-flashcards-sets');
};
const handleGuessFishcard = () => {
    navigate('/guess');
};
const handleEditFishcard = () => {
    navigate('/edit');
}
const handleUserSetting = () => {
    navigate('/usersetting');
}
return(
    <div className="w-full h-[50px] bg-[#1976d2] text-white flex items-center px-8 text-[1.2rem] box-border fixed top-0 left-0 z-[1000]">
  <button onClick={handleDashboard} className="bg-transparent text-white border-none text-[1.2rem] cursor-pointer p-0 mr-4">
    Flashcard App
  </button>

  <div className="flex gap-4">
    <button onClick={handleAddFlashcard} className="bg-transparent text-white border-none text-[1.1rem] cursor-pointer hover:text-gray-500">
      Dodaj fiszkę
    </button>
     <button onClick={handleEditFishcard} className="bg-transparent text-white border-none text-[1.1rem] cursor-pointer hover:text-gray-500">
      Edytuj fiszke
    </button>
    <button onClick={handleShowFlashcardSets} className="bg-transparent text-white border-none text-[1.1rem] cursor-pointer hover:text-gray-500">
      Zobacz zbiory fiszek
    </button>
    <button onClick={handleGuessFishcard} className="bg-transparent text-white border-none text-[1.1rem] cursor-pointer hover:text-gray-500">
      Zgadnij fiszke
    </button>
  </div>

  <button onClick={handleUserSetting} className="ml-auto bg-transparent text-white border-none text-[1.1rem] cursor-pointer z-[1100] hover:underline hover:text-gray-500">
    Konto
  </button>
  <button onClick={handleLogout} className="ml-4 bg-transparent text-white border-none text-[1.1rem] cursor-pointer z-[1100] hover:underline hover:text-gray-500">
    Wyloguj
  </button>
</div>
);
};

export default Navbar;