import React from 'react';
import '../App.css'
import Navbar from '../components/Navbar';

const DashboardPage: React.FC = () => {
 
 return(
 <div style={{ display: 'flex', height: '100vh',width: '100vw', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
    <Navbar />
    <div className='content'>
        <h1>Witaj w aplikacji fiszek!</h1>
        <p>Jesteś zalogowany.</p>
    </div>
 </div>
);
};

export default DashboardPage;