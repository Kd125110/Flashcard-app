import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock the useNavigate hook
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

// Import the component after setting up the mocks
import Navbar from '../../components/Navbar';

describe('Navbar Component', () => {
  beforeEach(() => {
    // Clear mock calls between tests
    mockNavigate.mockClear();
    // Clear localStorage
    localStorage.clear();
  });

  test('renders the app title', () => {
    render(<Navbar />);
    expect(screen.getByText('Flashcard App')).toBeInTheDocument();
  });

  test('clicking app title navigates to dashboard', () => {
    render(<Navbar />);
    
    fireEvent.click(screen.getByText('Flashcard App'));
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  test('clicking logout removes auth token and navigates to login', () => {
    // Set a mock auth token
    localStorage.setItem('authToken', 'test-token');
    
    render(<Navbar />);
    
    // Find the logout button in the desktop menu
    const logoutButton = screen.getByText('Wyloguj');
    fireEvent.click(logoutButton);
    
    // Check if token was removed - accept either null or undefined
    const authToken = localStorage.getItem('authToken');
    expect(authToken === null || authToken === undefined).toBeTruthy();
    
    // Check if navigation happened
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  test('clicking navigation links navigates to correct routes', () => {
    render(<Navbar />);
    
    // Test each navigation link
    fireEvent.click(screen.getByText('Dodaj fiszkę'));
    expect(mockNavigate).toHaveBeenCalledWith('/add-flashcard');
    
    fireEvent.click(screen.getByText('Edytuj fiszke'));
    expect(mockNavigate).toHaveBeenCalledWith('/edit');
    
    fireEvent.click(screen.getByText('Zobacz zbiory fiszek'));
    expect(mockNavigate).toHaveBeenCalledWith('/show-flashcards-sets');
    
    fireEvent.click(screen.getByText('Zgadnij fiszke'));
    expect(mockNavigate).toHaveBeenCalledWith('/guess');
    
    fireEvent.click(screen.getByText('Konto'));
    expect(mockNavigate).toHaveBeenCalledWith('/usersetting');
  });

  test('hamburger button toggles mobile menu', () => {
    render(<Navbar />);
    
    // Initially, mobile menu should not be in the document
    // We'll check if there's only one instance of each menu item
    const initialAddButtons = screen.getAllByText('Dodaj fiszkę');
    expect(initialAddButtons.length).toBe(1);
    
    // Find the hamburger button using a more reliable selector
    const hamburgerButton = screen.getByRole('button', { 
      name: '' // The button doesn't have accessible text
    });
    expect(hamburgerButton).toBeInTheDocument();
    
    // Click the hamburger button
    fireEvent.click(hamburgerButton);
    
    // Now there should be two "Dodaj fiszkę" elements (desktop and mobile)
    const addButtonsAfterOpen = screen.getAllByText('Dodaj fiszkę');
    expect(addButtonsAfterOpen.length).toBe(2);
    
    // Click again to close
    fireEvent.click(hamburgerButton);
    
    // Should be back to one button
    const addButtonsAfterClose = screen.getAllByText('Dodaj fiszkę');
    expect(addButtonsAfterClose.length).toBe(1);
  });
});