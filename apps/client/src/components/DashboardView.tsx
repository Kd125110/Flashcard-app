import React from 'react';
import { Link } from 'react-router-dom';
import type{ StatsData } from '../hooks/useDashboardStats';

interface DashboardViewProps {
  statsData: StatsData;
  loading: boolean;
  error: string | null;
}

const DashboardView: React.FC<DashboardViewProps> = ({ statsData, loading }) => {
 return (
    <div className="flex flex-col min-h-screen  max-w-4xl mx-auto mt-4">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8 mt-8">
          <h1 className="text-3xl font-bold text-gray-800 ">Witaj w aplikacji do tworzenia fiszek!</h1>
        </div>
      </div>
        {/* Overall Statistics Card */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Ogólne statystyki</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Poprawne odpowiedzi</p>
              <p className="text-2xl font-bold text-blue-600">{statsData.correctAnswers}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Błędne odpowiedzi</p>
              <p className="text-2xl font-bold text-red-600">{statsData.wrongAnswers}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Procent poprawnych</p>
              <p className="text-2xl font-bold text-green-600">
                {statsData.correctPercentage !== null ? `${statsData.correctPercentage}%` : 'Brak danych'}
              </p>
            </div>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Kategorie fiszek</h2>
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Ładowanie statystyk...</span>
          </div>
        ) : statsData.stats.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-lg shadow-sm">
            <p className="text-lg text-gray-600">Brak fiszek do wyświetlenia</p>
            <Link to='/show-flashcards-sets'>
              <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
                Dodaj pierwsze fiszki
              </button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {statsData.stats.map((item, index) => (
              <div key={item.category || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
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
                    <div className="flex justify-center flex-wrap gap-2">
                      {item.sourceLanguages.map(lang => (
                        <span key={lang} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600 mb-1">Języki docelowe:</p>
                    <div className="flex justify-center flex-wrap gap-2">
                      {item.targetLanguages.map(lang => (
                        <span key={lang} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                          {lang}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Link to='/show-flashcards-sets'>
                  <button className="w-full mt-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                    Przeglądaj fiszki
                  </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
  );
};


export default DashboardView;