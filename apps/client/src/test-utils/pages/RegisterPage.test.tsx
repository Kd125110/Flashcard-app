const util = require('util');
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RegisterPage from '../../pages/RegisterPage';
import { MemoryRouter } from 'react-router-dom';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('heading', { name: 'Register' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('surname')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Register' })).toBeInTheDocument();
  });

 test('successful registration navigates to login', async () => {
  jest.useFakeTimers(); // ⏱️ kontrolujemy czas

  global.fetch = jest.fn(() =>
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve({}),
    })
  ) as jest.Mock;

  render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );

  fireEvent.change(screen.getByPlaceholderText('name'), {
    target: { value: 'Jan' },
  });
  fireEvent.change(screen.getByPlaceholderText('surname'), {
    target: { value: 'Kowalski' },
  });
  fireEvent.change(screen.getByPlaceholderText('Email'), {
    target: { value: 'jan@example.com' },
  });
  fireEvent.change(screen.getByPlaceholderText('Password'), {
    target: { value: 'securepass' },
  });

  fireEvent.click(screen.getByRole('button', { name: 'Register' }));

  await waitFor(() => {
    expect(screen.getByText('Register successful!')).toBeInTheDocument();
  });

  jest.runAllTimers(); // ⏩ uruchamiamy opóźnione akcje

  await waitFor(() => {
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
});


  test('failed registration shows error message', async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Email already exists' }),
      })
    ) as jest.Mock;

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Anna' },
    });
    fireEvent.change(screen.getByPlaceholderText('surname'), {
      target: { value: 'Nowak' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'anna@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'password123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(screen.getByText('Email already exists')).toBeInTheDocument();
    });
  });

  test('network error shows fallback message', async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error('Network error'))) as jest.Mock;

    render(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    fireEvent.change(screen.getByPlaceholderText('name'), {
      target: { value: 'Piotr' },
    });
    fireEvent.change(screen.getByPlaceholderText('surname'), {
      target: { value: 'Zieliński' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'piotr@example.com' },
    });
    fireEvent.change(screen.getByPlaceholderText('Password'), {
      target: { value: 'pass123' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Register' }));

    await waitFor(() => {
      expect(
        screen.getByText('An error occurred while logging in. Please try again later.')
      ).toBeInTheDocument();
    });
  });
});
