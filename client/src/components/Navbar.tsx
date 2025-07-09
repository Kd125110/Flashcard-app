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
        <button onClick={handleDashboard} className='btn'>Flashcard App</button>
        <button onClick={handleAddFlashcard}className='add-flashcard-btn'>Dodaj fiszkę</button>
        <button onClick={handleLogout} className='logout-btn'>Wyloguj</button>
    </div>
);
};

export default Navbar;