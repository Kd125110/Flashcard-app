import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddFlashcardPage from './pages/AddFlashcardPage';
import RegisterPage from './pages/RegisterPage';
import ShowFlashcardSets from './pages/ShowFlashcardSets';
import GuessFlashcard from './pages/GuessFlashcard';
import EditFlashcardPage from './pages/EditFlashcardPage';
import UserSettingPage from './pages/UserSettingPage';
import AddBulkFlashcards from './pages/AddSetsFlashcards';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Chronione trasy */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <DashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-flashcard"
          element={
            <PrivateRoute>
              <AddFlashcardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/show-flashcards-sets"
          element={
            <PrivateRoute>
              <ShowFlashcardSets />
            </PrivateRoute>
          }
        />
        <Route
          path='/add-bulk-flashcards'
          element={
            <PrivateRoute>
              <AddBulkFlashcards/>
            </PrivateRoute>
          }
        />
        <Route
          path="/guess"
          element={
            <PrivateRoute>
              <GuessFlashcard />
            </PrivateRoute>
          }
        />
        <Route
          path="/edit"
          element={
            <PrivateRoute>
              <EditFlashcardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/usersetting"
          element={
            <PrivateRoute>
              <UserSettingPage />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
