
// import { render, screen, fireEvent, waitFor } from '@testing-library/react';
// import UserSettingPage, { getUserIdFromToken } from '../../pages/UserSettingPage';
// import { jwtDecode } from 'jwt-decode';

// // Mock the jwt-decode library
// jest.mock('jwt-decode', () => ({
//   jwtDecode: jest.fn()
// }));

// // Mock Navbar component
// jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Mocked Navbar</div>);

// // Mock console methods
// const originalConsoleError = console.error;
// const originalConsoleWarn = console.warn;

// describe('UserSettingPage Component', () => {
//   beforeAll(() => {
//     console.error = jest.fn();
//     console.warn = jest.fn();
//   });

//   afterAll(() => {
//     console.error = originalConsoleError;
//     console.warn = originalConsoleWarn;
//   });

//   beforeEach(() => {
//     jest.clearAllMocks();
//     localStorage.clear();
    
//     // Default mock for jwtDecode
//     (jwtDecode as jest.Mock).mockReturnValue({
//       userId: 123,
//       name: 'Test',
//       surname: 'User',
//       email: 'test@example.com',
//       exp: Math.floor(Date.now() / 1000) + 3600, // Valid for 1 hour
//       iat: Math.floor(Date.now() / 1000)
//     });
    
//     // Default mock for fetch
//     global.fetch = jest.fn().mockImplementation((url) => {
//       if (url.includes('/user/')) {
//         return Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({ email: 'test@example.com' })
//         });
//       } else if (url.includes('/edit/')) {
//         return Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({ message: 'User updated successfully' })
//         });
//       }
//       return Promise.reject(new Error('Unhandled fetch call'));
//     }) as jest.Mock;
    
//     // Set auth token in localStorage
//     localStorage.setItem('authToken', 'fake-token');
//   });

//   // Test getUserIdFromToken function (lines 20-31)
//   describe('getUserIdFromToken function', () => {
//     test('returns userId when token is valid', () => {
//       localStorage.setItem('authToken', 'valid-token');
//       (jwtDecode as jest.Mock).mockReturnValue({
//         userId: 123,
//         exp: Math.floor(Date.now() / 1000) + 3600
//       });
      
//       const result = getUserIdFromToken();
//       expect(result).toBe(123);
//     });
    
//     test('returns null when token is missing', () => {
//       localStorage.removeItem('authToken');
      
//       const result = getUserIdFromToken();
//       expect(result).toBeNull();
//     });
    
//     test('returns null and removes token when token is expired', () => {
//       localStorage.setItem('authToken', 'expired-token');
//       (jwtDecode as jest.Mock).mockReturnValue({
//         userId: 123,
//         exp: Math.floor(Date.now() / 1000) - 3600 // Expired 1 hour ago
//       });
      
//       const result = getUserIdFromToken();
//       expect(result).toBeNull();
//       expect(localStorage.getItem('authToken')).toBeNull();
//       expect(console.warn).toHaveBeenCalledWith('Token wygasł');
//     });
    
//     test('returns null when token decoding fails', () => {
//       localStorage.setItem('authToken', 'invalid-token');
//       (jwtDecode as jest.Mock).mockImplementation(() => {
//         throw new Error('Invalid token');
//       });
      
//       const result = getUserIdFromToken();
//       expect(result).toBeNull();
//       expect(console.error).toHaveBeenCalledWith('Błąd dekodowania tokena', expect.any(Error));
//     });
//   });

//   // Test fetchUserData function in useEffect (lines 46-61)
//   describe('fetchUserData in useEffect', () => {
//     test('fetches user data successfully', async () => {
//       render(<UserSettingPage />);
      
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledWith(
//           'http://localhost:3001/api/auth/user/123',
//           expect.any(Object)
//         );
//       });
      
//       // Email field should be populated with fetched data
//       const emailInput = screen.getByLabelText(/Email:/i);
//       expect(emailInput).toHaveValue('test@example.com');
//     });
    
//     test('handles missing token or userId', () => {
//       localStorage.removeItem('authToken');
      
//       render(<UserSettingPage />);
      
//       // Fetch should not be called
//       expect(global.fetch).not.toHaveBeenCalled();
//     });
    
//     test('handles API error response', async () => {
//       // Mock fetch to return an error response
//       global.fetch = jest.fn().mockImplementation(() => 
//         Promise.resolve({
//           ok: false,
//           json: () => Promise.resolve({ message: 'User not found' })
//         })
//       ) as jest.Mock;
      
//       render(<UserSettingPage />);
      
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalled();
//         expect(screen.getByText('User not found')).toBeInTheDocument();
//       });
//     });
    
//     test('handles API error with no message', async () => {
//       // Mock fetch to return an error response with no message
//       global.fetch = jest.fn().mockImplementation(() => 
//         Promise.resolve({
//           ok: false,
//           json: () => Promise.resolve({})
//         })
//       ) as jest.Mock;
      
//       render(<UserSettingPage />);
      
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalled();
//         expect(screen.getByText('Nie udało się pobrać danych użytkownika')).toBeInTheDocument();
//       });
//     });
    
//     test('handles network error', async () => {
//       // Mock fetch to throw a network error
//       global.fetch = jest.fn().mockImplementation(() => 
//         Promise.reject(new Error('Network error'))
//       ) as jest.Mock;
      
//       render(<UserSettingPage />);
      
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalled();
//         expect(console.error).toHaveBeenCalledWith('Błąd podczas łaczenia', expect.any(Error));
//         expect(screen.getByText('Błąd połączenia z serwerem')).toBeInTheDocument();
//       });
//     });
//   });

//   // Test handleSubmit function (lines 69-97)
//   describe('handleSubmit function', () => {
//     test('submits form data successfully', async () => {
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Fill out the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
//       // Submit the form
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Check if fetch was called with correct data
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(2);
//         expect(global.fetch).toHaveBeenCalledWith(
//           'http://localhost:3001/api/auth/edit/123',
//           expect.objectContaining({
//             method: 'PUT',
//             body: JSON.stringify({ email: 'new@example.com', password: 'newpassword123' })
//           })
//         );
//       });
      
//       // Check for success message
//       expect(screen.getByText('Dane zaktualizowane')).toBeInTheDocument();
//     });
    
//     test('handles missing userId', async () => {
//       // Mock getUserIdFromToken to return null
//       (jwtDecode as jest.Mock).mockReturnValue({
//         // No userId property
//         name: 'Test',
//         exp: Math.floor(Date.now() / 1000) + 3600
//       });
      
//       render(<UserSettingPage />);
      
//       // Fill out the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
//       // Submit the form
//       const form = screen.getByRole('form');
//       fireEvent.submit(form);
      
//       // Check for error message
//       expect(screen.getByText('Nie można pobrać ID użytkownika')).toBeInTheDocument();
      
//       // Fetch should not be called for update
//       expect(global.fetch).not.toHaveBeenCalled();
//     });
    
//     test('handles API error response', async () => {
//       // Mock fetch for initial data load and then error on update
//       global.fetch = jest.fn()
//         .mockImplementationOnce(() => 
//           Promise.resolve({
//             ok: true,
//             json: () => Promise.resolve({ email: 'test@example.com' })
//           })
//         )
//         .mockImplementationOnce(() => 
//           Promise.resolve({
//             ok: false,
//             json: () => Promise.resolve({ message: 'Email already in use' })
//           })
//         );
      
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Fill out the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
//       // Submit the form
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Check for error message
//       await waitFor(() => {
//         expect(screen.getByText('Email already in use')).toBeInTheDocument();
//       });
//     });
    
//     test('handles API error with no message', async () => {
//       // Mock fetch for initial data load and then error on update with no message
//       global.fetch = jest.fn()
//         .mockImplementationOnce(() => 
//           Promise.resolve({
//             ok: true,
//             json: () => Promise.resolve({ email: 'test@example.com' })
//           })
//         )
//         .mockImplementationOnce(() => 
//           Promise.resolve({
//             ok: false,
//             json: () => Promise.resolve({}) // No message
//           })
//         );
      
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Fill out the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
//       // Submit the form
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Check for generic error message
//       await waitFor(() => {
//         expect(screen.getByText('Wystąpił błąd')).toBeInTheDocument();
//       });
//     });
    
//     test('handles network error', async () => {
//       // Mock fetch for initial data load and then network error on update
//       global.fetch = jest.fn()
//         .mockImplementationOnce(() => 
//           Promise.resolve({
//             ok: true,
//             json: () => Promise.resolve({ email: 'test@example.com' })
//           })
//         )
//         .mockImplementationOnce(() => 
//           Promise.reject(new Error('Network error'))
//         );
      
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Fill out the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
      
//       // Submit the form
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Check for error message and console error
//       await waitFor(() => {
//         expect(console.error).toHaveBeenCalledWith('Błąd podczas łaczenia', expect.any(Error));
//         expect(screen.getByText('Błąd połączenia z serwerem')).toBeInTheDocument();
//       });
//     });
    
//     test('handles form submission with preventDefault', async () => {
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Create a mock event with preventDefault
//       const mockEvent = {
//         preventDefault: jest.fn()
//       };
      
//       // Get the form and submit it directly
//       const form = screen.getByRole('form');
//       fireEvent.submit(form, mockEvent);
      
//       // Check if preventDefault was called
//       expect(mockEvent.preventDefault).toHaveBeenCalledTimes(1);
//     });
//   });

//   // Test input handling (lines 116-126)
//   describe('Input handling', () => {
//     test('handles email input changes', async () => {
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       const emailInput = screen.getByLabelText(/Email:/i);
      
//       // Initial value from API
//       expect(emailInput).toHaveValue('test@example.com');
      
//       // Change value
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       expect(emailInput).toHaveValue('new@example.com');
      
//       // Change again
//       fireEvent.change(emailInput, { target: { value: '' } });
//       expect(emailInput).toHaveValue('');
//     });
//      test('handles password input changes', () => {
//       render(<UserSettingPage />);
      
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       // Initial value should be empty
//       expect(passwordInput).toHaveValue('');
      
//       // Change value
//       fireEvent.change(passwordInput, { target: { value: 'password123' } });
//       expect(passwordInput).toHaveValue('password123');
      
//       // Change again
//       fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
//       expect(passwordInput).toHaveValue('newpassword');
      
//       // Clear
//       fireEvent.change(passwordInput, { target: { value: '' } });
//       expect(passwordInput).toHaveValue('');
//     });
    
//     test('handles form submission with input values', async () => {
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Get input fields
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       // Change values
//       fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'updatedpassword' } });
      
//       // Submit form
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Check if fetch was called with the updated values
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(2);
//         expect(global.fetch).toHaveBeenLastCalledWith(
//           'http://localhost:3001/api/auth/edit/123',
//           expect.objectContaining({
//             method: 'PUT',
//             body: JSON.stringify({ 
//               email: 'updated@example.com', 
//               password: 'updatedpassword' 
//             })
//           })
//         );
//       });
//     });
//   });

//   // Additional tests to ensure full coverage
//   describe('Additional edge cases', () => {
//     test('renders with no initial user data', async () => {
//       // Mock fetch to return empty data
//       global.fetch = jest.fn().mockImplementation(() => 
//         Promise.resolve({
//           ok: true,
//           json: () => Promise.resolve({}) // Empty data
//         })
//       ) as jest.Mock;
      
//       render(<UserSettingPage />);
      
//       // Wait for fetch to be called
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Email field should be empty
//       const emailInput = screen.getByLabelText(/Email:/i);
//       expect(emailInput).toHaveValue('');
//     });
    
//     test('handles form submission with empty fields', async () => {
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Clear the email field
//       const emailInput = screen.getByLabelText(/Email:/i);
//       fireEvent.change(emailInput, { target: { value: '' } });
      
//       // Try to submit the form (should be prevented by HTML validation)
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Fetch should not be called again since HTML validation should prevent submission
//       expect(global.fetch).toHaveBeenCalledTimes(1);
//     });
    
//     test('handles token expiration during component lifecycle', async () => {
//       // Start with valid token
//       (jwtDecode as jest.Mock).mockReturnValue({
//         userId: 123,
//         exp: Math.floor(Date.now() / 1000) + 3600
//       });
      
//       render(<UserSettingPage />);
      
//       // Wait for initial data fetch
//       await waitFor(() => {
//         expect(global.fetch).toHaveBeenCalledTimes(1);
//       });
      
//       // Now simulate token expiration
//       (jwtDecode as jest.Mock).mockReturnValue({
//         userId: 123,
//         exp: Math.floor(Date.now() / 1000) - 3600 // Expired
//       });
      
//       // Try to submit the form
//       const emailInput = screen.getByLabelText(/Email:/i);
//       const passwordInput = screen.getByLabelText(/Hasło:/i);
      
//       fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
//       fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
      
//       const submitButton = screen.getByRole('button', { name: /Zapisz zmiany/i });
//       fireEvent.click(submitButton);
      
//       // Should show error message
//       await waitFor(() => {
//         expect(screen.getByText('Nie można pobrać ID użytkownika')).toBeInTheDocument();
//       });
//     });
//   });
// });