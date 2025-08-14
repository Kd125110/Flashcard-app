/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import axios from 'axios';
import useFlashcardSets from '../../hooks/useFlashcardSets';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = { authToken: 'fake-token' };
  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock fetch API
global.fetch = jest.fn();

// Improved helper function to wait for hook effects to complete
const waitForHookToUpdate = async () => {
  // Wait for all promises to resolve
  await new Promise(resolve => setTimeout(resolve, 100)); // Increased timeout
  // Run another tick to ensure all effects have completed
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 0));
  });
};

describe('useFlashcardSets Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock responses
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ['Category1', 'Category2'],
    });
    
    mockedAxios.get.mockResolvedValue({
      data: {
        flashcards: [
          {
            id: '1',
            question: 'Question 1',
            answer: 'Answer 1',
            category: 'Category1',
            sourceLang: 'en',
            targetLang: 'pl',
          },
          {
            id: '2',
            question: 'Question 2',
            answer: 'Answer 2',
            category: 'Category2',
            sourceLang: 'pl',
            targetLang: 'en',
          },
        ],
      },
    });
    
    mockedAxios.post.mockResolvedValue({
      data: { message: 'Flashcard added successfully' },
    });
    
    mockedAxios.put.mockResolvedValue({
      data: { message: 'Flashcard updated successfully' },
    });
    
    mockedAxios.delete.mockResolvedValue({
      data: { message: 'Flashcard deleted successfully' },
    });
    
    // Mock window.confirm
    window.confirm = jest.fn(() => true);
    
    // Mock window.scrollTo
    window.scrollTo = jest.fn();
  });

  test('initializes with default values', async () => {
    const { result, rerender } = renderHook(() => useFlashcardSets());
    
    // Initial state before data fetching completes
    expect(result.current.flashcards).toEqual([]);
    expect(result.current.grouped).toEqual({});
    expect(result.current.newCard).toEqual({});
    expect(result.current.editingCardId).toBeNull();
    expect(result.current.categories).toEqual([]);
    expect(result.current.expandedSets).toEqual({});
    expect(result.current.isFormVisible).toBe(false);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Force a re-render to ensure state is updated
    rerender();
    
    // State after data fetching
    expect(result.current.isLoading).toBe(false);
    expect(result.current.flashcards).toHaveLength(2);
    expect(result.current.categories).toEqual(['Category1', 'Category2']);
  });

  test('fetches flashcards on initialization', async () => {
    renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/flashcards/', {
      headers: {
        'Authorization': 'Bearer fake-token',
      },
    });
  });

  test('fetches categories on initialization', async () => {
    renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/flashcards/categories', {
      headers: {
        'Authorization': 'Bearer fake-token',
      },
    });
  });

  test('groups flashcards by category', async () => {
    const { result, rerender } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Force a re-render to ensure state is updated
    rerender();
    
    expect(Object.keys(result.current.grouped).sort()).toEqual(['Category1', 'Category2'].sort());
    expect(result.current.grouped['Category1']).toHaveLength(1);
    expect(result.current.grouped['Category2']).toHaveLength(1);
  });

  test('handles input change', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    act(() => {
      result.current.handleInputChange({
        target: { name: 'question', value: 'New Question' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    expect(result.current.newCard.question).toBe('New Question');
  });

  test('adds a new flashcard', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Set up form data
    act(() => {
      result.current.handleInputChange({
        target: { name: 'question', value: 'New Question' },
      } as React.ChangeEvent<HTMLInputElement>);
      
      result.current.handleInputChange({
        target: { name: 'answer', value: 'New Answer' },
      } as React.ChangeEvent<HTMLInputElement>);
      
      result.current.handleInputChange({
        target: { name: 'category', value: 'Category1' },
      } as React.ChangeEvent<HTMLSelectElement>);
      
      result.current.handleInputChange({
        target: { name: 'sourceLang', value: 'en' },
      } as React.ChangeEvent<HTMLSelectElement>);
      
      result.current.handleInputChange({
        target: { name: 'targetLang', value: 'pl' },
      } as React.ChangeEvent<HTMLSelectElement>);
    });
    
    // Submit the form
    await act(async () => {
      await result.current.handleAddOrUpdate({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });
    
    // Check if API was called correctly
    expect(mockedAxios.post).toHaveBeenCalledWith(
      'http://localhost:3001/flashcards/add',
      {
        question: 'New Question',
        answer: 'New Answer',
        category: 'Category1',
        sourceLang: 'en',
        targetLang: 'pl',
      },
      {
        headers: {
          'Authorization': 'Bearer fake-token',
          'Content-Type': 'application/json',
        },
      }
    );
    
    // Form should be reset and hidden
    expect(result.current.newCard).toEqual({});
    expect(result.current.isFormVisible).toBe(false);
  });

  test('updates an existing flashcard', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Set up edit mode
    act(() => {
      result.current.handleEdit({
        id: '1',
        question: 'Question 1',
        answer: 'Answer 1',
        category: 'Category1',
        sourceLang: 'en',
        targetLang: 'pl',
      });
    });
    
    expect(result.current.editingCardId).toBe('1');
    expect(result.current.isFormVisible).toBe(true);
    
    // Change a field
    act(() => {
      result.current.handleInputChange({
        target: { name: 'question', value: 'Updated Question' },
      } as React.ChangeEvent<HTMLInputElement>);
    });
    
    // Submit the form
    await act(async () => {
      await result.current.handleAddOrUpdate({ preventDefault: jest.fn() } as unknown as React.FormEvent);
    });
    
    // Check if API was called correctly
    expect(mockedAxios.put).toHaveBeenCalledWith(
      'http://localhost:3001/flashcards/1',
      expect.objectContaining({
        question: 'Updated Question',
      }),
      expect.any(Object)
    );
    
    // Edit mode should be cleared
    expect(result.current.editingCardId).toBeNull();
  });

  test('deletes a flashcard', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    await act(async () => {
      await result.current.handleDelete('1');
    });
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      'http://localhost:3001/flashcards/1',
      {
        headers: {
          'Authorization': 'Bearer fake-token',
        },
      }
    );
  });

  test('deletes a flashcard set', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    await act(async () => {
      await result.current.handleDeleteSet('Category1');
    });
    
    expect(window.confirm).toHaveBeenCalled();
    expect(mockedAxios.delete).toHaveBeenCalledWith(
      'http://localhost:3001/flashcards/category/Category1',
      {
        headers: {
          'Authorization': 'Bearer fake-token',
        },
      }
    );
  });

  test('toggles set expansion', async () => {
    const { result, rerender } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Force a re-render to ensure state is updated
    rerender();
    
    // Manually set expandedSets since it might not be initialized yet
    act(() => {
      result.current.toggleSetExpansion('Category1');
      result.current.toggleSetExpansion('Category1'); // Toggle twice to ensure it's set
    });
    
    // Now check the state
    expect(result.current.expandedSets['Category1']).toBeDefined();
    
    // Get the current state
    const initialState = result.current.expandedSets['Category1'];
    
    // Toggle it
    act(() => {
      result.current.toggleSetExpansion('Category1');
    });
    
    // It should be the opposite of what it was
    expect(result.current.expandedSets['Category1']).toBe(!initialState);
  });

  test('toggles form visibility', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    expect(result.current.isFormVisible).toBe(false);
    
    act(() => {
      result.current.toggleFormVisibility();
    });
    
    expect(result.current.isFormVisible).toBe(true);
    
    act(() => {
      result.current.toggleFormVisibility();
    });
    
    expect(result.current.isFormVisible).toBe(false);
  });

  test('resets form', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    // Set up some form data and edit mode
    act(() => {
      result.current.handleEdit({
        id: '1',
        question: 'Question 1',
        answer: 'Answer 1',
        category: 'Category1',
        sourceLang: 'en',
        targetLang: 'pl',
      });
    });
    
    expect(result.current.newCard).not.toEqual({});
    expect(result.current.editingCardId).not.toBeNull();
    expect(result.current.isFormVisible).toBe(true);
    
    act(() => {
      result.current.resetForm();
    });
    
    expect(result.current.newCard).toEqual({});
    expect(result.current.editingCardId).toBeNull();
    expect(result.current.isFormVisible).toBe(false);
  });

  test('gets language name from code', async () => {
    const { result } = renderHook(() => useFlashcardSets());
    
    // Wait for async operations to complete
    await waitForHookToUpdate();
    
    expect(result.current.getLanguageName('pl')).toBe('Polski');
    expect(result.current.getLanguageName('en')).toBe('Angielski');
    expect(result.current.getLanguageName('de')).toBe('Niemiecki');
    expect(result.current.getLanguageName('fr')).toBe('fr'); // Unknown code returns the code itself
  });
});