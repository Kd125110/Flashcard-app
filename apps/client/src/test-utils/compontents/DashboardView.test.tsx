// /**
//  * @jest-environment jsdom
//  */

// // Polyfill TextEncoder and TextDecoder
// require('text-encoding');
// const util = require('util');
// global.TextDecoder = util.TextDecoder;
// global.TextEncoder = util.TextEncoder;

// // Then import React and other dependencies
// import React from 'react';
// import { render, screen } from '@testing-library/react';
// import { MemoryRouter } from 'react-router-dom';
// import DashboardView from '../../components/DashboardView';
// import type { StatsData } from '../../hooks/useDashboardStats';

// const mockStatsData: StatsData = {
//   correctAnswers: 10,
//   wrongAnswers: 5,
//   correctPercentage: 66.7,
//   stats: [
//     {
//       category: 'Niemiecki',
//       numberOfFlashcards: 20,
//       averageBoxLevel: 3.5,
//       sourceLanguages: ['PL'],
//       targetLanguages: ['DE'],
//     },
//   ],
// };

// describe('DashboardView', () => {
//   it('renders loading state', () => {
//     render(
//       <DashboardView statsData={{ ...mockStatsData, stats: [] }} loading={true} error={null} />,
//       { wrapper: MemoryRouter }
//     );
//     expect(screen.getByText(/Ładowanie statystyk/i)).toBeInTheDocument();
//   });

//   it('renders empty state when no flashcards', () => {
//     render(
//       <DashboardView statsData={{ ...mockStatsData, stats: [] }} loading={false} error={null} />,
//       { wrapper: MemoryRouter }
//     );
//     expect(screen.getByText(/Brak fiszek do wyświetlenia/i)).toBeInTheDocument();
//     expect(screen.getByRole('button', { name: /Dodaj pierwsze fiszki/i })).toBeInTheDocument();
//   });

//   it('renders statistics and categories correctly', () => {
//     render(
//       <DashboardView statsData={mockStatsData} loading={false} error={null} />,
//       { wrapper: MemoryRouter }
//     );

//     expect(screen.getByText(/Poprawne odpowiedzi/i)).toBeInTheDocument();
//     expect(screen.getByText('10')).toBeInTheDocument();
//     expect(screen.getByText(/Błędne odpowiedzi/i)).toBeInTheDocument();
//     expect(screen.getByText('5')).toBeInTheDocument();
//     expect(screen.getByText(/Procent poprawnych/i)).toBeInTheDocument();
//     expect(screen.getByText('66.7%')).toBeInTheDocument();

//     expect(screen.getByText(/Kategorie fiszek/i)).toBeInTheDocument();
//     expect(screen.getByText('Niemiecki')).toBeInTheDocument();
//     expect(screen.getByText('Liczba fiszek:')).toBeInTheDocument();
//     expect(screen.getByText('20')).toBeInTheDocument();
//     expect(screen.getByText('Średni poziom:')).toBeInTheDocument();
//     expect(screen.getByText('3.5')).toBeInTheDocument();
//   });
// });