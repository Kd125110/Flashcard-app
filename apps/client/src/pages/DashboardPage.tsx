import React, { useEffect, useState } from 'react';
import '../output.css';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  interface FlashcardStat {
    category: string;
    numberOfFlashcards: number;
    averageBoxLevel: number;
    sourceLanguages: string[];
    targetLanguages: string[];
  }

  const [stats, setStats] = useState<FlashcardStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch('http://localhost:3001/flashcards/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        const data = await response.json();
        
        if (data?.stats) {
          setStats(data.stats);
        } else {
          console.warn('Brak danych statystyk w odpowiedzi:', data);
          setStats([]);
        }
      } catch (error) {
        console.error('Błąd podczas pobierania statystyk: ', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Witaj w aplikacji do tworzenia fiszek!</h1>
          <p className="mt-2 text-gray-600">Jesteś zalogowany.</p>
        </div>
        </div>
        <div className='container mx-auto px-4 py-8'> 
            {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Ładowanie statystyk...</span>
          </div>
        ) : stats.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-600">Brak fiszek do wyświetlenia</p>
            <Link to='/show-flashcards-sets'>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Dodaj pierwsze fiszki
            </button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {stats.map((item) => (
              <div key={item.category} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <div className="bg-blue-500 text-white py-3 px-4">
                  <h3 className="text-lg font-bold truncate">{item.category}</h3>
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Liczba fiszek:</span>
                    <span className="font-semibold text-gray-800">{item.numberOfFlashcards}</span>
                  </div>
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-gray-600">Średni poziom:</span>
                    <span className="font-semibold text-gray-800">
                      {item.averageBoxLevel ? item.averageBoxLevel.toFixed(1) : 'Brak danych'}
                    </span>
                  </div>
                  <div className="mb-3">
                    <p className="text-gray-600 mb-1">Języki źródłowe:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.sourceLanguages.map(lang => (
                        <span key={lang} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Języki docelowe:</p>
                    <div className="flex flex-wrap gap-2">
                      {item.targetLanguages.map(lang => (
                        <span key={lang} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Przeglądaj fiszki
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div> 
  );
};

export default DashboardPage;