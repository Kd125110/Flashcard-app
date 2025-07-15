import React from 'react';
import '../output.css'
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
 
 return(
 <div className="flex items-center justify-center mx-auto bg-transparent">
    <Navbar />
    <div>
        <h1>Witaj w aplikacji fiszek!</h1>
        <p>Jesteś zalogowany.</p>
        <p>Tutaj będą statystki kiedyś</p>
    </div>
 </div>
);
};

export default DashboardPage;