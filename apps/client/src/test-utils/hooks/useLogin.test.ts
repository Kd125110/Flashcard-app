/**
 * @jest-environment jsdom
 */
import { renderHook, act } from '@testing-library/react';
import { useLogin } from '../../hooks/useLogin';
import { useNavigate } from 'react-router-dom';

// Mock the react-router-dom module
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));

describe('useLogin', () => {
  const mockNavigate = jest.fn();

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    
    // Set up the navigate mock
    (useNavigate as jest.Mock).mockReturnValue(mockNavigate);
    
    // Mock fetch
    global.fetch = jest.fn();
    
    // Mock localStorage
    Object.defineProperty(global, 'localStorage', {
      value: {
        setItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('should login successfully and navigate to dashboard', async () => {
    const mockResponse = {
      token: 'fake-token',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.handleLogin({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith('authToken', 'fake-token');
    expect(result.current.message).toBe('Login successful!');
    expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
  });

  it('should handle failed login with message', async () => {
    const mockError = {
      message: 'Invalid credentials',
    };

    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: async () => mockError,
    });

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('wrong@example.com');
      result.current.setPassword('wrongpass');
    });

    await act(async () => {
      await result.current.handleLogin({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.message).toBe('Invalid credentials');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should handle fetch error', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.setEmail('test@example.com');
      result.current.setPassword('password123');
    });

    await act(async () => {
      await result.current.handleLogin({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.message).toBe('An error occurred while logging in. Please try again later.');
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should navigate to register page', () => {
    const { result } = renderHook(() => useLogin());

    act(() => {
      result.current.navigateToRegister();
    });

    expect(mockNavigate).toHaveBeenCalledWith('/register');
  });
});