/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import FlashcardForm from '../../components/FlashcardForm';

describe('FlashcardForm Component', () => {
  // Default props for most tests
  const defaultProps = {
    newCard: {},
    editingCardId: null,
    categories: ['Vocabulary', 'Grammar', 'Phrases'],
    languageOptions: [
      { value: 'pl', label: 'Polski' },
      { value: 'en', label: 'Angielski' },
      { value: 'de', label: 'Niemiecki' }
    ],
    handleInputChange: jest.fn(),
    handleAddOrUpdate: jest.fn().mockImplementation(e => {
      e.preventDefault();
      return Promise.resolve();
    }),
    resetForm: jest.fn()
  };

  test('renders form with correct title for adding new flashcard', () => {
    render(<FlashcardForm {...defaultProps} />);
    
    // Check title
    expect(screen.getByText('Dodaj nową fiszkę')).toBeTruthy();
    
    // Check submit button text
    expect(screen.getByText('Dodaj fiszkę')).toBeTruthy();
  });

  test('renders form with correct title for editing flashcard', () => {
    const editingProps = {
      ...defaultProps,
      editingCardId: '123',
      newCard: {
        question: 'Test Question',
        answer: 'Test Answer',
        category: 'Vocabulary',
        sourceLang: 'en',
        targetLang: 'pl'
      }
    };
    
    render(<FlashcardForm {...editingProps} />);
    
    // Check title
    expect(screen.getByText('Edytuj fiszkę')).toBeTruthy();
    
    // Check submit button text
    expect(screen.getByText('Zapisz zmiany')).toBeTruthy();
    
    // Check cancel button is present when editing
    expect(screen.getByText('Anuluj')).toBeTruthy();
  });

  test('calls resetForm when close button is clicked', () => {
    const { container } = render(<FlashcardForm {...defaultProps} />);
    
    // Find and click the close button (FiX icon)
    const closeButton = container.querySelector('button[aria-label="close"]') || 
                       container.querySelector('button:first-of-type'); // Fallback
    
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(defaultProps.resetForm).toHaveBeenCalled();
    } else {
      throw new Error('Close button not found');
    }
  });

  test('calls handleAddOrUpdate when form is submitted', () => {
    const { container } = render(<FlashcardForm {...defaultProps} />);
    
    // Find and submit the form
    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
      expect(defaultProps.handleAddOrUpdate).toHaveBeenCalled();
    } else {
      throw new Error('Form not found');
    }
  });

  test('calls handleInputChange when inputs change', () => {
    render(<FlashcardForm {...defaultProps} />);
    
    // Find and change question input
    const questionInput = screen.getByPlaceholderText('Wpisz pytanie lub słowo');
    fireEvent.change(questionInput, { target: { value: 'New Question' } });
    
    expect(defaultProps.handleInputChange).toHaveBeenCalled();
    
    // Find and change answer input
    const answerInput = screen.getByPlaceholderText('Wpisz odpowiedź lub tłumaczenie');
    fireEvent.change(answerInput, { target: { value: 'New Answer' } });
    
    expect(defaultProps.handleInputChange).toHaveBeenCalledTimes(2);
    
    // Find and change category select using a more reliable selector
    const categorySelect = screen.getByText('Wybierz kategorię').closest('select');
    if (categorySelect) {
      fireEvent.change(categorySelect, { target: { value: 'Grammar' } });
      expect(defaultProps.handleInputChange).toHaveBeenCalledTimes(3);
    } else {
      throw new Error('Category select not found');
    }
  });

  test('displays input fields with correct values', () => {
    const filledProps = {
      ...defaultProps,
      newCard: {
        question: 'Test Question',
        answer: 'Test Answer',
        category: 'Vocabulary',
        sourceLang: 'en',
        targetLang: 'pl'
      }
    };
    
    const { container } = render(<FlashcardForm {...filledProps} />);
    
    // Check input values with proper type casting
    const questionInput = screen.getByPlaceholderText('Wpisz pytanie lub słowo') as HTMLInputElement;
    expect(questionInput.value).toBe('Test Question');
    
    const answerInput = screen.getByPlaceholderText('Wpisz odpowiedź lub tłumaczenie') as HTMLInputElement;
    expect(answerInput.value).toBe('Test Answer');
    
    // Find selects using container queries
    const selects = container.querySelectorAll('select');
    
    // Assuming the first select is category, second is sourceLang, third is targetLang
    if (selects.length >= 3) {
      const categorySelect = selects[0] as HTMLSelectElement;
      const sourceLangSelect = selects[1] as HTMLSelectElement;
      const targetLangSelect = selects[2] as HTMLSelectElement;
      
      expect(categorySelect.value).toBe('Vocabulary');
      expect(sourceLangSelect.value).toBe('en');
      expect(targetLangSelect.value).toBe('pl');
    } else {
      throw new Error('Not all select elements found');
    }
  });

  test('renders category input when "new" category is selected', () => {
    const newCategoryProps = {
      ...defaultProps,
      newCard: {
        category: 'new'
      }
    };
    
    render(<FlashcardForm {...newCategoryProps} />);
    
    // Check that the category input is displayed instead of select
    expect(screen.getByPlaceholderText('Wpisz nazwę nowej kategorii')).toBeTruthy();
    expect(screen.getByText('Wróć do wyboru kategorii')).toBeTruthy();
    
    // Category select should not be visible - check by looking for the default option
    expect(screen.queryByText('Wybierz kategorię')).toBeNull();
  });

  test('switches back to category select when "Wróć do wyboru kategorii" is clicked', () => {
    const newCategoryProps = {
      ...defaultProps,
      newCard: {
        category: 'new'
      }
    };
    
    render(<FlashcardForm {...newCategoryProps} />);
    
    // Find and click the "back to select" button
    const backButton = screen.getByText('Wróć do wyboru kategorii');
    fireEvent.click(backButton);
    
    expect(defaultProps.handleInputChange).toHaveBeenCalledWith({
      target: { name: 'category', value: '' }
    });
  });

  test('renders all language options', () => {
    const { container } = render(<FlashcardForm {...defaultProps} />);
    
    // Find selects using container queries
    const selects = container.querySelectorAll('select');
    
    // Check that we have at least 3 selects (category, sourceLang, targetLang)
    expect(selects.length).toBeGreaterThanOrEqual(3);
    
    // Assuming the second select is sourceLang and the third is targetLang
    const sourceLangSelect = selects[1] as HTMLSelectElement;
    const targetLangSelect = selects[2] as HTMLSelectElement;
    
    // Check number of options
    expect(sourceLangSelect.children.length).toBe(4); // 3 languages + default option
    expect(targetLangSelect.children.length).toBe(4); // 3 languages + default option
    
    // Check specific language options
    expect(screen.getAllByText('Polski').length).toBe(2); // One in each select
    expect(screen.getAllByText('Angielski').length).toBe(2);
    expect(screen.getAllByText('Niemiecki').length).toBe(2);
  });

  test('renders all category options', () => {
    const { container } = render(<FlashcardForm {...defaultProps} />);
    
    // Find the category select using container query
    const categorySelect = container.querySelector('select') as HTMLSelectElement;
    
    // Check that it exists
    expect(categorySelect).toBeTruthy();
    
    // Check number of options
    expect(categorySelect.children.length).toBe(5); // 3 categories + default option + "new" option
    
    // Check specific category options
    expect(screen.getByText('Vocabulary')).toBeTruthy();
    expect(screen.getByText('Grammar')).toBeTruthy();
    expect(screen.getByText('Phrases')).toBeTruthy();
    expect(screen.getByText('+ Nowa kategoria')).toBeTruthy();
  });

  test('cancel button is only shown when editing', () => {
    // Render with editingCardId = null (adding new)
    const { rerender } = render(<FlashcardForm {...defaultProps} />);
    expect(screen.queryByText('Anuluj')).toBeNull();
    
    // Render with editingCardId set (editing)
    const editingProps = {
      ...defaultProps,
      editingCardId: '123'
    };
    
    rerender(<FlashcardForm {...editingProps} />);
    
    const cancelButton = screen.getByText('Anuluj');
    expect(cancelButton).toBeTruthy();
    
    // Test that cancel button calls resetForm
    fireEvent.click(cancelButton);
    expect(defaultProps.resetForm).toHaveBeenCalled();
  });

  test('renders required field indicators', () => {
    render(<FlashcardForm {...defaultProps} />);
    
    // Check that all required field indicators are present
    const requiredIndicators = screen.getAllByText('*');
    expect(requiredIndicators.length).toBe(5); // Question, Answer, Category, Source Lang, Target Lang
  });
});