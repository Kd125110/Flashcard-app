/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useFlashcardGuessing } from '../../hooks/useFlashcardGuessing';
import { useNavigate } from 'react-router-dom';

jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('useFlashcardGuessing', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    global.fetch = jest.fn();
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'fake-token'),
      },
      writable: true,
    });
  });

  it('fetches flashcards and sets categories', async () => {
    const mockFlashcards = [
      { id: '1', question: 'Q1', answer: 'A1', category: 'Animals', sourceLang: 'en', targetLang: 'pl' },
      { id: '2', question: 'Q2', answer: 'A2', category: 'Food', sourceLang: 'en', targetLang: 'pl' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flashcards: mockFlashcards }),
    });

    const { result } = renderHook(() => useFlashcardGuessing());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.flashcards.length).toBe(2);
    expect(result.current.categories).toContain('Animals');
    expect(result.current.categories).toContain('Food');
    expect(result.current.error).toBeNull();
  });

  it('navigates to login if no token', async () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);

    renderHook(() => useFlashcardGuessing());

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('handles category change and sets current card', async () => {
    const mockFlashcards = [
      { id: '1', question: 'Q1', answer: 'A1', category: 'Animals', sourceLang: 'en', targetLang: 'pl' },
      { id: '2', question: 'Q2', answer: 'A2', category: 'Animals', sourceLang: 'en', targetLang: 'pl' },
    ];

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ flashcards: mockFlashcards }),
    });

    const { result } = renderHook(() => useFlashcardGuessing());

    await waitFor(() => expect(result.current.loading).toBe(false));

    act(() => {
      result.current.handleCategoryChange({ target: { value: 'Animals' } } as React.ChangeEvent<HTMLSelectElement>);
    });

    expect(result.current.selectedCategory).toBe('Animals');
    expect(result.current.currentCard?.question).toBe('Q1');
  });
});
