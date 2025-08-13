import { useState, useEffect } from 'react';

export interface FlashcardStat {
  category: string;
  numberOfFlashcards: number;
  averageBoxLevel: number;
  sourceLanguages: string[];
  targetLanguages: string[];
}

export interface StatsData {
  stats: FlashcardStat[];
  correctAnswers: number;
  wrongAnswers: number;
  correctPercentage: number | null;
}

export const useDashboardStats = () => {
  const [statsData, setStatsData] = useState<StatsData>({
    stats: [],
    correctAnswers: 0,
    wrongAnswers: 0,
    correctPercentage: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('authToken');
        
        if (!token) {
          setError('Brak tokenu uwierzytelniającego');
          setLoading(false);
          return;
        }
        
        const response = await fetch('http://localhost:3001/flashcards/stats', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error(`Błąd HTTP: ${response.status}`);
        }

        const data = await response.json();
        
        if (data) {
          setStatsData({
            stats: data.stats || [],
            correctAnswers: data.correctAnswers || 0,
            wrongAnswers: data.wrongAnswers || 0,
            correctPercentage: data.correctPercentage
          });
          setError(null);
        } else {
          console.warn('Brak danych w odpowiedzi:', data);
          setStatsData({
            stats: [],
            correctAnswers: 0,
            wrongAnswers: 0,
            correctPercentage: null
          });
        }
      } catch (error) {
        console.error('Błąd podczas pobierania statystyk: ', error);
        setError('Nie udało się pobrać statystyk. Spróbuj ponownie później.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return {
    statsData,
    loading,
    error
  };
};

export default useDashboardStats;