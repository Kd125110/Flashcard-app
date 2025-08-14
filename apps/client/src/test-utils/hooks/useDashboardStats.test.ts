
/**
 * @jest-environment jsdom
 */


import { renderHook, waitFor } from '@testing-library/react';
import useDashboardStats from '../../hooks/useDashboardStats';

describe('useDashboardStats', () => {
beforeEach(() => {
  global.fetch = jest.fn();

  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: jest.fn((key: string) => key === 'authToken' ? 'fake-token' : null),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    },
    writable: true,
  });
});



  it('should fetch stats successfully', async () => {
    const mockData = {
      stats: [
        {
          category: 'Grammar',
          numberOfFlashcards: 10,
          averageBoxLevel: 2,
          sourceLanguages: ['en'],
          targetLanguages: ['de'],
        },
      ],
      correctAnswers: 8,
      wrongAnswers: 2,
      correctPercentage: 80,
    };

    localStorage.setItem('authToken', 'fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.statsData).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

 it('should handle missing token', async () => {
  (localStorage.getItem as jest.Mock).mockReturnValueOnce(null); // <- kluczowe

  const { result } = renderHook(() => useDashboardStats());

  await waitFor(() => expect(result.current.loading).toBe(false));

  expect(result.current.error).toBe('Brak tokenu uwierzytelniającego');
  expect(result.current.statsData.correctAnswers).toBe(0);
});


  it('should handle HTTP error', async () => {
    localStorage.setItem('authToken', 'fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe('Nie udało się pobrać statystyk. Spróbuj ponownie później.');
  });

  it('should handle empty response', async () => {
    localStorage.setItem('authToken', 'fake-token');

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => null,
    });

    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.statsData.stats).toEqual([]);
    expect(result.current.statsData.correctAnswers).toBe(0);
    expect(result.current.statsData.correctPercentage).toBeNull();
  });
});
