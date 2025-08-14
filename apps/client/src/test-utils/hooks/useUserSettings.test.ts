/**
 * @jest-environment jsdom
 */
import { renderHook, act, waitFor } from '@testing-library/react';
import { useUserSettings, getUserIdFromToken } from '../../hooks/useUserSettings';
import { jwtDecode } from 'jwt-decode';

jest.mock('jwt-decode', () => ({
  jwtDecode: jest.fn(),
}));

describe('getUserIdFromToken', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    });
  });

  it('returns null if no token', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    expect(getUserIdFromToken()).toBeNull();
  });

  it('returns null if token expired', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('fake-token');
    (jwtDecode as jest.Mock).mockReturnValue({ exp: Date.now() / 1000 - 100, userId: 1 });

    expect(getUserIdFromToken()).toBeNull();
    expect(localStorage.removeItem).toHaveBeenCalledWith('authToken');
  });

  it('returns userId if token is valid', () => {
    (localStorage.getItem as jest.Mock).mockReturnValue('valid-token');
    (jwtDecode as jest.Mock).mockReturnValue({ exp: Date.now() / 1000 + 1000, userId: 42 });

    expect(getUserIdFromToken()).toBe(42);
  });
});

describe('useUserSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (jwtDecode as jest.Mock).mockReturnValue({ exp: Date.now() / 1000 + 1000, userId: 1 });

    Object.defineProperty(global, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'valid-token'),
      },
      writable: true,
    });

    global.fetch = jest.fn();
  });

  it('fetches user data successfully', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        name: 'Jan',
        surname: 'Kowalski',
        email: 'jan@example.com',
      }),
    });

    const { result } = renderHook(() => useUserSettings());

    await waitFor(() => expect(result.current.name).toBe('Jan'));
    expect(result.current.surname).toBe('Kowalski');
    expect(result.current.email).toBe('jan@example.com');
  });


it('handles invalid email in handleSubmit', async () => {
  // blokujemy fetch z useEffect
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });

  const { result } = renderHook(() => useUserSettings());

  act(() => {
    result.current.setEmail('invalid-email');
  });

  await act(async () => {
    await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  });

  expect(result.current.message).toBe('Nie poprawny adres email');
  expect(result.current.messageType).toBe('error');
});


  it('handles short password in handleSubmit', async () => {
      // blokujemy fetch z useEffect
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });
    const { result } = renderHook(() => useUserSettings());

    act(() => {
      result.current.setPassword('123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.message).toBe('Hasło musi mieć co najmniej 6 znaków');
    expect(result.current.messageType).toBe('error');
  });

  it('submits valid data successfully', async () => {
      // blokujemy fetch z useEffect
  (global.fetch as jest.Mock).mockResolvedValueOnce({
    ok: true,
    json: async () => ({}),
  });
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({}),
    });

    const { result } = renderHook(() => useUserSettings());

    act(() => {
      result.current.setName('Jan');
      result.current.setSurname('Kowalski');
      result.current.setEmail('jan@example.com');
      result.current.setPassword('secure123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.message).toBe('Dane zostały pomyślnie zaktualizowane');
    expect(result.current.messageType).toBe('success');
    expect(result.current.password).toBe('');
  });

  it('handles connection error in handleSubmit', async () => {
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useUserSettings());

    act(() => {
      result.current.setEmail('jan@example.com');
      result.current.setPassword('secure123');
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: () => {} } as React.FormEvent);
    });

    expect(result.current.message).toBe('Błąd połączenia z serwerem');
    expect(result.current.messageType).toBe('error');
  });

  it('handleCancel clears password and message', () => {
    const { result } = renderHook(() => useUserSettings());

    act(() => {
      result.current.setPassword('secret');
      result.current.handleCancel();
    });

    expect(result.current.password).toBe('');
    expect(result.current.message).toBe('');
  });
});
