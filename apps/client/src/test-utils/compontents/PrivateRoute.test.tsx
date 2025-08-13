import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import PrivateRoute from '../../components/PrivateRoute';

// Mock localStorage
const mockLocalStorage = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key] || null),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

describe('PrivateRoute Component', () => {
  beforeEach(() => {
    // Clear localStorage and mocks before each test
    mockLocalStorage.clear();
    jest.clearAllMocks();
  });

  test('renders children when user is authenticated', () => {
    // Set up authentication token
    mockLocalStorage.setItem('authToken', 'test-token');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Protected Content</div>
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Protected content should be rendered
    expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
    
    // Login page should not be rendered
    expect(screen.queryByText('Login Page')).not.toBeInTheDocument();
    
    // Verify localStorage was checked
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
  });

  test('redirects to login page when user is not authenticated', () => {
    // No auth token set (unauthenticated)
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Protected Content</div>
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Protected content should not be rendered
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument();
    
    // Login page should be rendered (redirected)
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(screen.getByText('Login Page')).toBeInTheDocument();
    
    // Verify localStorage was checked
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
  });

  test('redirects to login page when auth token is empty string', () => {
    // Empty auth token
    mockLocalStorage.setItem('authToken', '');
    
    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <PrivateRoute>
                <div data-testid="protected-content">Protected Content</div>
              </PrivateRoute>
            } 
          />
          <Route path="/login" element={<div data-testid="login-page">Login Page</div>} />
        </Routes>
      </MemoryRouter>
    );

    // Should redirect to login page
    expect(screen.getByTestId('login-page')).toBeInTheDocument();
    expect(mockLocalStorage.getItem).toHaveBeenCalledWith('authToken');
  });

  test('renders nested components when authenticated', () => {
    // Set up authentication token
    mockLocalStorage.setItem('authToken', 'test-token');

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route 
            path="/protected" 
            element={
              <PrivateRoute>
                <div data-testid="parent">
                  <div data-testid="child">Nested Protected Content</div>
                </div>
              </PrivateRoute>
            } 
          />
        </Routes>
      </MemoryRouter>
    );

    // Both parent and child components should be rendered
    expect(screen.getByTestId('parent')).toBeInTheDocument();
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Nested Protected Content')).toBeInTheDocument();
  });
});