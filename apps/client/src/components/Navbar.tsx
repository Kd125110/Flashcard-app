
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../output.css";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavigate = (path: string) => {
    navigate(path);
    setMenuOpen(false); 
  };
  
  const handleLogout = () => {
    localStorage.removeItem("authToken"); // usuń token
    setMenuOpen(false); // zamknij menu mobilne
    navigate("/login"); // przekieruj na stronę logowania
  };


  return (
    <nav className="w-full bg-[#1976d2] text-white fixed top-0 left-0 z-[1000] shadow-md">
      <div className="flex items-center justify-between px-4 py-3 md:px-8 h-[60px]">
        <button
          onClick={() => handleNavigate("/dashboard")}
          className="text-[1.2rem] sm:text-[1rem] font-semibold"
        >
          Flashcard App
        </button>

        {/* Hamburger Icon - Always visible on small screens */}
        <div className="block md:hidden z-[1100]">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="focus:outline-none"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d={
                  menuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {/* Desktop Menu */}
        <div className="hidden md:flex gap-4 items-center text-[1.1rem]">
          <button onClick={() => handleNavigate("/add-flashcard")} className="hover:text-gray-300">
            Dodaj fiszkę
          </button>
          <button onClick={() => handleNavigate("/edit")} className="hover:text-gray-300">
            Edytuj fiszke
          </button>
          <button onClick={() => handleNavigate("/show-flashcards-sets")} className="hover:text-gray-300">
            Zobacz zbiory fiszek
          </button>
          <button onClick={() => handleNavigate("/guess")} className="hover:text-gray-300">
            Zgadnij fiszke
          </button>
          <button onClick={() => handleNavigate("/usersetting")} className="ml-4 hover:underline">
            Konto
          </button>
          <button onClick={ handleLogout} className="ml-2 hover:underline">
            Wyloguj
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden flex flex-col gap-2 px-4 pb-4 text-[1.1rem] bg-[#1976d2] z-[1001]">
          <button onClick={() => handleNavigate("/add-flashcard")}>Dodaj fiszkę</button>
          <button onClick={() => handleNavigate("/edit")}>Edytuj fiszke</button>
          <button onClick={() => handleNavigate("/show-flashcards-sets")}>Zobacz zbiory fiszek</button>
          <button onClick={() => handleNavigate("/guess")}>Zgadnij fiszke</button>
          <button onClick={() => handleNavigate("/usersetting")}>Konto</button>
          <button onClick={handleLogout}>Wyloguj</button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
