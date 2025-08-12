const util = require('util');
global.TextDecoder = util.TextDecoder;
global.TextEncoder = util.TextEncoder;

import { render, screen } from '@testing-library/react';
import EditFlashcardPage from '../../pages/EditFlashcardPage';
import { MemoryRouter } from 'react-router-dom';

// Mock Navbar
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Mocked Navbar</div>);

describe('EditFlashcardPage', () => {
  test('renders header and Navbar', () => {
    render(
      <MemoryRouter>
        <EditFlashcardPage />
      </MemoryRouter>
    );

    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByText('Tutaj będzie edycja fiszek')).toBeInTheDocument();
  });
});
