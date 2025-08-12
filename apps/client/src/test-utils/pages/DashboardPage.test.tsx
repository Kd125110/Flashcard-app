import { render, screen } from '@testing-library/react';
import DashboardPage from '../../pages/DashboardPage';


// Mock the Navbar component
jest.mock('../../components/Navbar', () => () => <div data-testid="navbar">Mocked Navbar</div>);

describe('DashboardPage', () => {
  test('renders without crashing', () => {
    render(<DashboardPage />);
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
  });

  test('displays welcome message', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Witaj w aplikacji fiszek!/i)).toBeInTheDocument();
  });

  test('displays login confirmation', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Jesteś zalogowany./i)).toBeInTheDocument();
  });

  test('displays placeholder for stats', () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Tutaj będą statystki kiedyś/i)).toBeInTheDocument();
  });
});
