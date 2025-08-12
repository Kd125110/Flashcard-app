const util = require('util');
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

import { render, screen, waitFor, act} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import AddFlashcardPage from '../../pages/AddFlashcardPage';
import { BrowserRouter } from 'react-router-dom';
import { jest } from '@jest/globals';

//Mock the Navbar
jest.mock('../../components/Navbar', () => {
    return function MockNavbar(){
        return <div data-testid = "Navbar">Navbar component</div>
    };
});

//Mock the Flashcard Component 
jest.mock('../../components/Flashcard', () => {
    return function newFlashcard({question, answer, category, sourceLang, targetLang} : any){
        return(
            <div data-testid='flashcard'>
                <div data-testid='flashcard-question'>{question}</div>
                <div data-testid='flashcard-answer'>{answer}</div>
                <div data-testid='flashcard-category'>{category}</div>
                <div data-testid='flashcard-sourceLang'>{sourceLang}</div>
                <div data-testid='flashcard-targetLang'>{targetLang}</div>
            </div>
        )
    }
});

// Properly type the mock function
// jest.MockedFunction<typeof fetch> ensures TypeScript understands the mock has the same signature as fetch.
const mockFetch = jest.fn() as jest.MockedFunction<typeof fetch>
// Assign the mock to the global Fetch
//global.fetch = mockFetch replaces the global fetch with your mock, useful for testing code that relies on fetch.
global.fetch = mockFetch;

const localStorageMock = {
    getItem: jest.fn(() => 'fake-token'),
    setItem: jest.fn(),
    clear: jest.fn()
} as unknown as Storage;

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

const renderComponent = () => {
    return render(
        <BrowserRouter>
            <AddFlashcardPage/>
        </BrowserRouter>
    );
};

describe('AddFlashcardPage Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Suppress console errors
        jest.spyOn(console, 'error').mockImplementation(() => {});
    })

    afterEach(() => {
        // Restore console.error
        (console.error as jest.Mock).mockRestore();
    });

    test('renders the form with all inputs and button', () => {
        renderComponent();

        expect(screen.getByPlaceholderText('Słowo')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tłumaczenie')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Kategoria')).toBeInTheDocument();
        expect(screen.getByText('Wybierz język źródłowy')).toBeInTheDocument();
        expect(screen.getByText('Wybierz język docelowy')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Dodaj fiszkę/i })).toBeInTheDocument();
    })

    test('renders the Navbar component', () => {
        renderComponent();
        expect(screen.getByTestId('Navbar')).toBeInTheDocument();
    });

    test('allows filling out the form', async() => {
        renderComponent();
        const user = userEvent.setup();

        await user.type(screen.getByPlaceholderText('Słowo'),'dog');
        await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
        await user.type(screen.getByPlaceholderText('Kategoria'),'animals');

        const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
        const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;

        await user.selectOptions(sourceSelect, 'English');
        await user.selectOptions(targetSelect, 'Polish');

        expect(screen.getByPlaceholderText('Słowo')).toHaveValue('dog');
        expect(screen.getByPlaceholderText('Tłumaczenie')).toHaveValue('pies');
        expect(screen.getByPlaceholderText('Kategoria')).toHaveValue('animals');
        expect(sourceSelect).toHaveValue('English');
        expect(targetSelect).toHaveValue('Polish');
    })

    test('validate language pairs and shows error message for invalid pairs', async () => {
        renderComponent();
        const user = userEvent.setup()

        await user.type(screen.getByPlaceholderText('Słowo'),'dog');
        await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
        await user.type(screen.getByPlaceholderText('Kategoria'),'animals');

        const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
        const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;

        await user.selectOptions(sourceSelect, 'Polish');
        await user.selectOptions(targetSelect, 'Polish');
        
        const submitButton = screen.getByRole('button', { name: /Dodaj fiszkę/i });
        await user.click(submitButton);

        expect(screen.getByText('Dozwolone są tylko pary językowe: PL-EN, EN-PL, PL-DE, DE-PL'));
        expect(mockFetch).not.toHaveBeenCalled();
    })

    test('successfully submits theform with valid date', async () => {
        mockFetch.mockImplementationOnce(() =>
        Promise.resolve(
            {
               ok:true,
               json: () => Promise.resolve({ message: 'Flashcard added successfully'}) 
            } as Response
        ))
        renderComponent();
        const user = userEvent.setup()

        await user.type(screen.getByPlaceholderText('Słowo'), 'dog');
        await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
        await user.type(screen.getByPlaceholderText('Kategoria'), 'animals');

        const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
        const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;

        await user.selectOptions(sourceSelect, 'English');
        await user.selectOptions(targetSelect, 'Polish');

        const submitButton = screen.getByRole('button', {name: /Dodaj fiszkę/i });
        await user.click(submitButton);

        expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/flashcards/add',{
            method: 'POST',
            headers :{
                'Content-Type': 'application/json',
                'Authorization': 'Bearer fake-token',
            },
            body: JSON.stringify({
                question: 'dog',
                answer: 'pies',
                category: 'animals',
                sourceLang: 'English',
                targetLang: 'Polish'
            }),
            credentials: 'include'
        });

        await waitFor(() => {
            expect(screen.getByText('Dodano fiszkę!')).toBeInTheDocument();
        });
    });

    test('displays the newly added flashcard', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Flashcard added successfully' })
      } as Response)
    );
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Słowo'), 'dog');
    await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
    await user.type(screen.getByPlaceholderText('Kategoria'), 'animals');
    
    const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
    const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;
    
    await user.selectOptions(sourceSelect, 'English');
    await user.selectOptions(targetSelect, 'Polish');
    
    const submitButton = screen.getByRole('button', { name: /Dodaj fiszkę/i });
    await user.click(submitButton);
    
    // Wait for the flashcard to appear
    await waitFor(() => {
      expect(screen.getByTestId('flashcard')).toBeInTheDocument();
    });
    
    expect(screen.getByTestId('flashcard-question')).toHaveTextContent('dog');
    expect(screen.getByTestId('flashcard-answer')).toHaveTextContent('pies');
    expect(screen.getByTestId('flashcard-category')).toHaveTextContent('animals');
    expect(screen.getByTestId('flashcard-sourceLang')).toHaveTextContent('English');
    expect(screen.getByTestId('flashcard-targetLang')).toHaveTextContent('Polish');
  });

  test('handles server error response', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: false,
        statusText: 'Internal Server Error',
        json: () => Promise.resolve({ message: 'Database error' })
      } as Response)
    );
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Słowo'), 'dog');
    await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
    await user.type(screen.getByPlaceholderText('Kategoria'), 'animals');
    
    const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
    const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;
    
    await user.selectOptions(sourceSelect, 'English');
    await user.selectOptions(targetSelect, 'Polish');
    
    const submitButton = screen.getByRole('button', { name: /Dodaj fiszkę/i });
    await user.click(submitButton);
    
    // Wait for the error message to appear
    await waitFor(() => {
      expect(screen.getByText('Błąd podczas dodawania fiszki: Database error')).toBeInTheDocument();
    });
  });

  test('handles network error', async () => {
    // Mock fetch to reject with an error
    mockFetch.mockImplementationOnce(() => Promise.reject(new Error('Network error')));
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Słowo'), 'dog');
    await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
    await user.type(screen.getByPlaceholderText('Kategoria'), 'animals');
    
    const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
    const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;
    
    await user.selectOptions(sourceSelect, 'English');
    await user.selectOptions(targetSelect, 'Polish');
    
    const submitButton = screen.getByRole('button', { name: /Dodaj fiszkę/i });
    
    // Click the submit button and wait for state updates
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Use findByText instead of getByText with waitFor
    const errorMessage = await screen.findByText('Błąd połączenia z serwerem.');
    expect(errorMessage).toBeInTheDocument();
  });

  test('clears form after successful submission', async () => {
    mockFetch.mockImplementationOnce(() => 
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Flashcard added successfully' })
      } as Response)
    );
    
    renderComponent();
    const user = userEvent.setup();
    
    await user.type(screen.getByPlaceholderText('Słowo'), 'dog');
    await user.type(screen.getByPlaceholderText('Tłumaczenie'), 'pies');
    await user.type(screen.getByPlaceholderText('Kategoria'), 'animals');
    
    const sourceSelect = screen.getByText('Wybierz język źródłowy').closest('select') as HTMLSelectElement;
    const targetSelect = screen.getByText('Wybierz język docelowy').closest('select') as HTMLSelectElement;
    
    await user.selectOptions(sourceSelect, 'English');
    await user.selectOptions(targetSelect, 'Polish');
    
    const submitButton = screen.getByRole('button', { name: /Dodaj fiszkę/i });
    
    // Use act to ensure all state updates are processed
    await act(async () => {
      await user.click(submitButton);
    });
    
    // Use findByText to wait for the success message
    await screen.findByText('Dodano fiszkę!');
    
    // Now check if the form has been cleared
    expect(screen.getByPlaceholderText('Słowo')).toHaveValue('');
    expect(screen.getByPlaceholderText('Tłumaczenie')).toHaveValue('');
    expect(screen.getByPlaceholderText('Kategoria')).toHaveValue('');
    expect(sourceSelect).toHaveValue('');
    expect(targetSelect).toHaveValue('');
  });
});