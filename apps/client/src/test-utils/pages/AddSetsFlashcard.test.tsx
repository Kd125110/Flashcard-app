const util = require('util');
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import type { NavigateFunction } from 'react-router-dom';
import axios from 'axios';
import AddBulkFlashcards from '../../pages/AddSetsFlashcards';

// Properly type the mocks for TypeScript
jest.mock('axios', () => ({
  post: jest.fn()
}));

// Properly type the useNavigate mock
const mockNavigate = jest.fn() as jest.MockedFunction<NavigateFunction>;
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate
}));

describe('AddBulkFlashcards Component', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('authToken', 'fake-token');
    jest.clearAllMocks();
  });

  test('renders initial form correctly', () => {
    render(
      <MemoryRouter>
        <AddBulkFlashcards />
      </MemoryRouter>
    );
    
    // Check for main elements
    expect(screen.getByText('Dodaj zestaw fiszek')).toBeInTheDocument();
    expect(screen.getByText(/Dodajesz fiszkę 1 z 1/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Pytanie')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Odpowiedź')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Kategoria')).toBeInTheDocument();
    expect(screen.getByText('💾 Zapisz zestaw')).toBeInTheDocument();
    
    // Check navigation buttons
    const previousButton = screen.getByText('⬅️ Poprzednia');
    expect(previousButton).toBeDisabled();
    expect(screen.getByText('➡️ Następna')).toBeInTheDocument();
  });

  test('displays validation error when trying to navigate with empty fields', () => {
    render(
      <MemoryRouter>
        <AddBulkFlashcards />
      </MemoryRouter>
    );
    
    // Try to move to next card without filling fields
    fireEvent.click(screen.getByText('➡️ Następna'));
    
    // Check for error message
    expect(screen.getByText('Proszę wypełnić wszystkie pola przed przejściem dalej')).toBeInTheDocument();
  });

  test('displays authentication error when token is missing', async () => {
    // Remove the auth token
    localStorage.removeItem('authToken');
    
    render(
      <MemoryRouter>
        <AddBulkFlashcards />
      </MemoryRouter>
    );
    
    // Fill in minimal required fields
    fireEvent.change(screen.getByPlaceholderText('Pytanie'), { target: { value: 'Test Question' } });
    fireEvent.change(screen.getByPlaceholderText('Odpowiedź'), { target: { value: 'Test Answer' } });
    fireEvent.change(screen.getByPlaceholderText('Kategoria'), { target: { value: 'Test Category' } });
    
    // Also need to select values for the dropdowns
    const sourceLangSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(sourceLangSelect, { target: { value: 'pl' } });
    
    const targetLangSelect = screen.getAllByRole('combobox')[1];
    fireEvent.change(targetLangSelect, { target: { value: 'en' } });
    
    // Submit the form by clicking the button
    fireEvent.click(screen.getByText('💾 Zapisz zestaw'));
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText(/Nie znaleziono tokenu uwierzytelniającego/i)).toBeInTheDocument();
    });
    
    // Also verify that axios.post wasn't called
    expect(axios.post).not.toHaveBeenCalled();
  });
});