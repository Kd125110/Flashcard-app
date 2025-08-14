// const util = require('util');
// global.TextDecoder = util.TextDecoder;
// global.TextEncoder = util.TextEncoder;

// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import '@testing-library/jest-dom';
// import ShowFlashcardSets from '../../pages/ShowFlashcardSets';
// import { BrowserRouter } from 'react-router-dom';
// import axios from 'axios';

// // Mock axios
// jest.mock('axios');
// const mockedAxios = axios as jest.Mocked<typeof axios>;

// // Mock localStorage
// const localStorageMock = {
//   getItem: jest.fn(),
//   setItem: jest.fn(),
//   clear: jest.fn()
// };
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// // Mock fetch
// global.fetch = jest.fn();

// // Mock Navbar component
// jest.mock('../../components/Navbar', () => {
//   return function DummyNavbar() {
//     return <div data-testid="navbar">Navbar</div>;
//   };
// });

// // Sample data for tests
// const mockFlashcards = {
//   flashcards: [
//     {
//       id: '1',
//       question: 'Hello',
//       answer: 'Hola',
//       category: 'Spanish',
//       sourceLang: 'en',
//       targetLang: 'es'
//     },
//     {
//       id: '2',
//       question: 'Goodbye',
//       answer: 'Adiós',
//       category: 'Spanish',
//       sourceLang: 'en',
//       targetLang: 'es'
//     },
//     {
//       id: '3',
//       question: 'Cat',
//       answer: 'Chat',
//       category: 'French',
//       sourceLang: 'en',
//       targetLang: 'fr'
//     }
//   ]
// };

// const mockCategories = ['Spanish', 'French', 'German'];

// describe('ShowFlashcardSets Component', () => {
//   beforeEach(() => {
//     jest.clearAllMocks();
//     localStorageMock.getItem.mockReturnValue('fake-token');
    
//     // Mock fetch for categories
//     (global.fetch as jest.Mock).mockResolvedValue({
//       ok: true,
//       json: async () => mockCategories
//     });
    
//     // Mock axios for flashcards
//     mockedAxios.get.mockResolvedValue({ data: mockFlashcards });
//   });

// test('renders the component with initial state', async () => {
//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Check if the title is rendered
//     expect(screen.getByText('Zbiory fiszek')).toBeInTheDocument();
    
//     // Check if the "Add new set" link is rendered
//     expect(screen.getByText(/Dodaj nowy zestaw fiszek/)).toBeInTheDocument();
    
//     // Wait for the flashcards to be loaded
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalledWith('http://localhost:3001/flashcards/', {
//         headers: {
//           'Authorization': 'Bearer fake-token'
//         }
//       });
//     });
    
//     // Check if categories are fetched
//     await waitFor(() => {
//       expect(global.fetch).toHaveBeenCalledWith('http://localhost:3001/flashcards/categories', {
//         headers: {
//           'Authorization': 'Bearer fake-token'
//         }
//       });
//     });
//   });

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Check if category headers are displayed
// //     await waitFor(() => {
// //       // Find category headers - they should be h2 elements
// //       const categoryHeaders = screen.getAllByRole('heading', { level: 2 });
// //       const categoryTexts = categoryHeaders.map(header => header.textContent);
// //       expect(categoryTexts).toContain('Spanish');
// //       expect(categoryTexts).toContain('French');
// //     });

// //     // Check if flashcards are displayed
// //     expect(screen.getByText('Hello')).toBeInTheDocument();
// //     expect(screen.getByText('Hola')).toBeInTheDocument();
// //     expect(screen.getByText('Goodbye')).toBeInTheDocument();
// //     expect(screen.getByText('Adiós')).toBeInTheDocument();
// //     expect(screen.getByText('Cat')).toBeInTheDocument();
// //     expect(screen.getByText('Chat')).toBeInTheDocument();
// //   });

// //  test('handles adding a new flashcard', async () => {
// //     // Mock axios post for adding a flashcard
// //     mockedAxios.post.mockResolvedValue({ data: { success: true } });

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Fill in the form
// //     fireEvent.change(screen.getByLabelText('Pytanie'), { 
// //       target: { value: 'Dog' } 
// //     });
// //     fireEvent.change(screen.getByLabelText('Odpowiedź'), { 
// //       target: { value: 'Perro' } 
// //     });
    
// //     // Select category
// //     const categorySelect = screen.getByLabelText('Kategoria');
// //     fireEvent.change(categorySelect, { target: { value: 'Spanish' } });
    
// //     // Select source language
// //     const sourceLangSelect = screen.getByLabelText('Język źródłowy');
// //     fireEvent.change(sourceLangSelect, { target: { value: 'en' } });
    
// //     // Select target language
// //     const targetLangSelect = screen.getByLabelText('Język docelowy');
// //     fireEvent.change(targetLangSelect, { target: { value: 'es' } });

// //     // Submit the form - use the button inside the form
// //     const submitButton = screen.getByRole('button', { name: 'Dodaj fiszkę' });
// //     fireEvent.click(submitButton);

// //     // Check if the API was called with the correct data
// //     await waitFor(() => {
// //       expect(mockedAxios.post).toHaveBeenCalledWith(
// //         'http://localhost:3001/flashcards/add',
// //         {
// //           question: 'Dog',
// //           answer: 'Perro',
// //           category: 'Spanish',
// //           sourceLang: 'en',
// //           targetLang: 'es'
// //         },
// //         {
// //           headers: {
// //             'Authorization': 'Bearer fake-token'
// //           }
// //         }
// //       );
// //     });

// //     // Check if flashcards are refetched
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(2);
// //     });
// //   });

// //   test('handles editing a flashcard', async () => {
// //     // Mock axios put for editing a flashcard
// //     mockedAxios.put.mockResolvedValue({ data: { success: true } });

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Find and click the edit button for the first flashcard
// //     const editButtons = await screen.findAllByText('Edytuj');
// //     fireEvent.click(editButtons[0]);

// //     // Check if form is populated with flashcard data
// //     await waitFor(() => {
// //       expect(screen.getByLabelText('Pytanie')).toHaveValue('Hello');
// //       expect(screen.getByLabelText('Odpowiedź')).toHaveValue('Hola');
// //     });

// //     // Modify the answer
// //     fireEvent.change(screen.getByLabelText('Odpowiedź'), { 
// //       target: { value: 'Hola Modificado' } 
// //     });

// //     // Submit the form - use the button with text 'Zapisz zmiany'
// //     const saveButton = screen.getByRole('button', { name: 'Zapisz zmiany' });
// //     fireEvent.click(saveButton);

// //     // Check if the API was called with the correct data
// //     await waitFor(() => {
// //       expect(mockedAxios.put).toHaveBeenCalledWith(
// //         'http://localhost:3001/flashcards/1',
// //         expect.objectContaining({
// //           question: 'Hello',
// //           answer: 'Hola Modificado',
// //           category: 'Spanish',
// //         }),
// //         {
// //           headers: {
// //             'Authorization': 'Bearer fake-token'
// //           }
// //         }
// //       );
// //     });

// //     // Check if flashcards are refetched
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalledTimes(2);
// //     });
// //   });
//   test('handles deleting a flashcard', async () => {
//     // Mock axios delete for deleting a flashcard
//     mockedAxios.delete.mockResolvedValue({ data: { success: true } });

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Find and click the delete button for the first flashcard
//     const deleteButtons = await screen.findAllByText('Usuń');
//     // Filter out "Usuń cały zestaw" buttons
//     const deleteCardButtons = deleteButtons.filter(button => 
//       !button.textContent?.includes('cały zestaw')
//     );
//     fireEvent.click(deleteCardButtons[0]);

//     // Check if the API was called with the correct ID
//     await waitFor(() => {
//       expect(mockedAxios.delete).toHaveBeenCalledWith(
//         'http://localhost:3001/flashcards/1',
//         {
//           headers: {
//             'Authorization': 'Bearer fake-token'
//           }
//         }
//       );
//     });

//     // Check if flashcards are refetched
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalledTimes(2);
//     });
//   });

//   test('handles deleting a flashcard set', async () => {
//     // Mock axios delete for deleting a flashcard set
//     mockedAxios.delete.mockResolvedValue({ data: { success: true } });

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Find and click the "Delete entire set" button for Spanish
//     const deleteSetButtons = await screen.findAllByText('Usuń cały zestaw');
//     fireEvent.click(deleteSetButtons[0]);

//     // Check if the API was called with the correct category
//     await waitFor(() => {
//       expect(mockedAxios.delete).toHaveBeenCalledWith(
//         'http://localhost:3001/flashcards/category/Spanish',
//         {
//           headers: {
//             'Authorization': 'Bearer fake-token'
//           }
//         }
//       );
//     });

//     // Check if flashcards are refetched
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalledTimes(2);
//     });
//   });

// //   test('handles adding a new category', async () => {
// //     // Mock axios post for adding a flashcard
// //     mockedAxios.post.mockResolvedValue({ data: { success: true } });

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Fill in the form
// //     fireEvent.change(screen.getByLabelText('Pytanie'), { 
// //       target: { value: 'Apple' } 
// //     });
// //     fireEvent.change(screen.getByLabelText('Odpowiedź'), { 
// //       target: { value: 'Manzana' } 
// //     });
    
// //     // Select "new category" option
// //     const categorySelect = screen.getByLabelText('Kategoria');
// //     fireEvent.change(categorySelect, { target: { value: 'new' } });
    
// //     // Wait for the new category input to appear
// //     await waitFor(() => {
// //       const newCategoryInput = screen.getByPlaceholderText('Wpisz nazwę nowej kategorii');
// //       fireEvent.change(newCategoryInput, { target: { value: 'Fruits' } });
// //     });
    
// //     // Select source language
// //     const sourceLangSelect = screen.getByLabelText('Język źródłowy');
// //     fireEvent.change(sourceLangSelect, { target: { value: 'en' } });
    
// //     // Select target language
// //     const targetLangSelect = screen.getByLabelText('Język docelowy');
// //     fireEvent.change(targetLangSelect, { target: { value: 'es' } });

// //     // Submit the form - use the button inside the form
// //     const submitButton = screen.getByRole('button', { name: 'Dodaj fiszkę' });
// //     fireEvent.click(submitButton);

// //     // Check if the API was called with the correct data including the new category
// //     await waitFor(() => {
// //       expect(mockedAxios.post).toHaveBeenCalledWith(
// //         'http://localhost:3001/flashcards/add',
// //         expect.objectContaining({
// //           question: 'Apple',
// //           answer: 'Manzana',
// //           category: 'Fruits',
// //           sourceLang: 'en',
// //           targetLang: 'es'
// //         }),
// //         expect.anything()
// //       );
// //     });
// //   });

//   test('handles missing auth token', async () => {
//     // Mock console.error to prevent error messages in test output
//     const originalConsoleError = console.error;
//     console.error = jest.fn();

//     // Mock localStorage to return null for authToken
//     localStorageMock.getItem.mockReturnValue(null);

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Check if error was logged
//     await waitFor(() => {
//       expect(console.error).toHaveBeenCalledWith('No authentication token found');
//     });

//     // Verify API calls were not made
//     expect(mockedAxios.get).not.toHaveBeenCalled();

//     // Restore console.error
//     console.error = originalConsoleError;
//   });

//   test('handles missing auth token', async () => {
//     // Mock console.error to prevent error messages in test output
//     const originalConsoleError = console.error;
//     console.error = jest.fn();

//     // Mock localStorage to return null for authToken
//     localStorageMock.getItem.mockReturnValue(null);

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Check if error was logged
//     await waitFor(() => {
//       expect(console.error).toHaveBeenCalledWith('No authentication token found');
//     });

//     // Verify API calls were not made
//     expect(mockedAxios.get).not.toHaveBeenCalled();

//     // Restore console.error
//     console.error = originalConsoleError;
//   });

// // test('handles API error when fetching flashcards', async () => {
// //     // Mock console.error to prevent error messages in test output
// //     const originalConsoleError = console.error;
// //     console.error = jest.fn();

// //     // Mock axios to throw an error
// //     mockedAxios.get.mockRejectedValue(new Error('API Error'));

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Check if error was logged
// //     await waitFor(() => {
// //       expect(console.error).toHaveBeenCalledWith('Błąd podczas pobierania fiszek:', expect.any(Error));
// //     });

// //     // Restore console.error
// //     console.error = originalConsoleError;
// //   });

// test('displays empty state when no flashcards are available', async () => {
//     // Mock axios to return empty flashcards
//     mockedAxios.get.mockResolvedValue({ data: { flashcards: [] } });

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Check if empty state message is displayed
//     await waitFor(() => {
//       expect(screen.getByText('Brak fiszek do wyświetlenia.')).toBeInTheDocument();
//     });
//   });

// //   test('handles canceling edit mode', async () => {
// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Find and click the edit button for the first flashcard
// //     const editButtons = await screen.findAllByText('Edytuj');
// //     fireEvent.click(editButtons[0]);

// //     // Check if form is populated with flashcard data
// //     await waitFor(() => {
// //       expect(screen.getByLabelText('Pytanie')).toHaveValue('Hello');
// //       expect(screen.getByLabelText('Odpowiedź')).toHaveValue('Hola');
// //     });

// //     // Click the cancel button
// //     fireEvent.click(screen.getByText('Anuluj edycję'));

// //     // Check if form is reset
// //     await waitFor(() => {
// //       expect(screen.getByLabelText('Pytanie')).toHaveValue('');
// //       expect(screen.getByLabelText('Odpowiedź')).toHaveValue('');
// //     });

// //     // Check if we're back in "add" mode
// //     expect(screen.getByRole('button', { name: 'Dodaj fiszkę' })).toBeInTheDocument();
// //     expect(screen.queryByText('Zapisz zmiany')).not.toBeInTheDocument();
// //   });

// //   test('handles API error when adding a flashcard', async () => {
// //     // Mock console.error to prevent error messages in test output
// //     const originalConsoleError = console.error;
// //     console.error = jest.fn();

// //     // Mock axios post to throw an error
// //     mockedAxios.post.mockRejectedValue(new Error('API Error'));

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Fill in the form
// //     fireEvent.change(screen.getByLabelText('Pytanie'), { 
// //       target: { value: 'Dog' } 
// //     });
// //     fireEvent.change(screen.getByLabelText('Odpowiedź'), { 
// //       target: { value: 'Perro' } 
// //     });
    
// //     // Select category
// //     const categorySelect = screen.getByLabelText('Kategoria');
// //     fireEvent.change(categorySelect, { target: { value: 'Spanish' } });
    
// //     // Select source language
// //     const sourceLangSelect = screen.getByLabelText('Język źródłowy');
// //     fireEvent.change(sourceLangSelect, { target: { value: 'en' } });
    
// //     // Select target language
// //     const targetLangSelect = screen.getByLabelText('Język docelowy');
// //     fireEvent.change(targetLangSelect, { target: { value: 'es' } });

// //     // Submit the form
// //     const submitButton = screen.getByRole('button', { name: 'Dodaj fiszkę' });
// //     fireEvent.click(submitButton);

// //     // Check if error was logged
// //     await waitFor(() => {
// //       expect(console.error).toHaveBeenCalledWith('Błąd podczas zapisywania fiszki:', expect.any(Error));
// //     });

// //     // Restore console.error
// //     console.error = originalConsoleError;
// //   });

// //   test('handles API error when updating a flashcard', async () => {
// //     // Mock console.error to prevent error messages in test output
// //     const originalConsoleError = console.error;
// //     console.error = jest.fn();

// //     // Mock axios put to throw an error
// //     mockedAxios.put.mockRejectedValue(new Error('API Error'));

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Wait for flashcards to load
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Find and click the edit button for the first flashcard
// //     const editButtons = await screen.findAllByText('Edytuj');
// //     fireEvent.click(editButtons[0]);

// //     // Submit the form without changing anything
// //     const saveButton = screen.getByRole('button', { name: 'Zapisz zmiany' });
// //     fireEvent.click(saveButton);

// //     // Check if error was logged
// //     await waitFor(() => {
// //       expect(console.error).toHaveBeenCalledWith('Błąd podczas zapisywania fiszki:', expect.any(Error));
// //     });

// //     // Restore console.error
// //     console.error = originalConsoleError;
// //   });

//   test('handles API error when deleting a flashcard', async () => {
//     // Mock console.error to prevent error messages in test output
//     const originalConsoleError = console.error;
//     console.error = jest.fn();

//     // Mock axios delete to throw an error
//     mockedAxios.delete.mockRejectedValue(new Error('API Error'));

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Find and click the delete button for the first flashcard
//     const deleteButtons = await screen.findAllByText('Usuń');
//     // Filter out "Usuń cały zestaw" buttons
//     const deleteCardButtons = deleteButtons.filter(button => 
//       !button.textContent?.includes('cały zestaw')
//     );
//     fireEvent.click(deleteCardButtons[0]);

//     // Check if error was logged
//     await waitFor(() => {
//       expect(console.error).toHaveBeenCalledWith('Błąd podczas usuwania fiszki:', expect.any(Error));
//     });

//     // Restore console.error
//     console.error = originalConsoleError;
//   });

//   test('handles API error when deleting a flashcard set', async () => {
//     // Mock console.error to prevent error messages in test output
//     const originalConsoleError = console.error;
//     console.error = jest.fn();

//     // Mock axios delete to throw an error
//     mockedAxios.delete.mockRejectedValue(new Error('API Error'));

//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Find and click the "Delete entire set" button for Spanish
//     const deleteSetButtons = await screen.findAllByText('Usuń cały zestaw');
//     fireEvent.click(deleteSetButtons[0]);

//     // Check if error was logged
//     await waitFor(() => {
//       expect(console.error).toHaveBeenCalledWith('Błąd podczas usuwania zestawu fiszek:', expect.any(Error));
//     });

//     // Restore console.error
//     console.error = originalConsoleError;
//   });

// //   test('handles API error when fetching categories', async () => {
// //     // Mock console.error to prevent error messages in test output
// //     const originalConsoleError = console.error;
// //     console.error = jest.fn();

// //     // Mock fetch to throw an error for categories
// //     (global.fetch as jest.Mock).mockRejectedValue(new Error('API Error'));

// //     // But still return flashcards successfully
// //     mockedAxios.get.mockResolvedValue({ data: mockFlashcards });

// //     render(
// //       <BrowserRouter>
// //         <ShowFlashcardSets />
// //       </BrowserRouter>
// //     );

// //     // Check if error was logged
// //     await waitFor(() => {
// //       expect(console.error).toHaveBeenCalledWith('Błąd podczas pobierania kategorii: ', expect.any(Error));
// //     });

// //     // Check if it falls back to extracting categories from flashcards
// //     await waitFor(() => {
// //       expect(mockedAxios.get).toHaveBeenCalled();
// //     });

// //     // Check if the categories dropdown still has options
// //     await waitFor(() => {
// //       const categorySelect = screen.getByLabelText('Kategoria');
// //       expect(categorySelect).toBeInTheDocument();
      
// //       // Check if Spanish and French options are available (extracted from flashcards)
// //       const options = screen.getAllByRole('option');
// //       const optionValues = options.map(option => option.textContent);
// //       expect(optionValues).toContain('Spanish');
// //       expect(optionValues).toContain('French');
// //     });

// //     // Restore console.error
// //     console.error = originalConsoleError;
// //   });

//   test('validates required fields when submitting the form', async () => {
//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Try to submit the form without filling required fields
//     // Use the button role with name to be more specific
//     const submitButton = screen.getByRole('button', { name: 'Dodaj fiszkę' });
//     fireEvent.click(submitButton);

//     // Check if the form validation prevents submission
//     expect(mockedAxios.post).not.toHaveBeenCalled();
    
//     // HTML5 validation should prevent the form from submitting
//     // We can check if the form is still in the document
//     expect(screen.getByRole('button', { name: 'Dodaj fiszkę' })).toBeInTheDocument();
//   });

//   test('displays language codes correctly', async () => {
//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Wait for flashcards to load
//     await waitFor(() => {
//       expect(mockedAxios.get).toHaveBeenCalled();
//     });

//     // Check if language codes are displayed correctly
//     // Use getAllByText and then check if at least one element exists
//     await waitFor(() => {
//       // Look for the text that contains language codes
//       const enToEsElements = screen.getAllByText(/en → es/);
//       expect(enToEsElements.length).toBeGreaterThan(0);
      
//       const enToFrElements = screen.getAllByText(/en → fr/);
//       expect(enToFrElements.length).toBeGreaterThan(0);
//     });
//   });

//   test('navigates to add bulk flashcards page when link is clicked', async () => {
//     render(
//       <BrowserRouter>
//         <ShowFlashcardSets />
//       </BrowserRouter>
//     );

//     // Find and click the "Add new set" link
//     const addNewSetLink = screen.getByText(/Dodaj nowy zestaw fiszek/);
//     expect(addNewSetLink).toHaveAttribute('href', '/add-bulk-flashcards');
//   });
// });