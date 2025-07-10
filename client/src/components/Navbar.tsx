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

return(
    <div className="navbar">
        <button onClick={handleDashboard} className="bg-transparent text-white border-none text-[1.2rem] cursor-pointer p-0 mr-auto">Flashcard App</button>
        <button onClick={handleAddFlashcard}className="ml-[-256px] mr-auto bg-transparent text-white border-none text-[1.1rem] cursor-pointer hover:text-gray-500">Dodaj fiszkę</button>
        <button onClick={handleLogout} className="ml-auto bg-transparent text-white border-none text-[1.1rem] cursor-pointer z-[1100] hover:underline hover:text-gray-500">Wyloguj</button>
    </div>
);
};

export default Navbar;