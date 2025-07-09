import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddFlashcardPage from './pages/AddFlashcardPage';
import RegisterPage from './pages/RegisterPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/add-flashcard" element={<AddFlashcardPage />}/>
        <Route path="/register" element={<RegisterPage />}/>
        {/* You can add more routes here as needed */}
        {/* <Route path="/add-flashcard" element={<AddFlashcardPage />} /> */}
        {/* Add other routes here as needed */}
      </Routes>
    </Router>
  );
}

export default App;