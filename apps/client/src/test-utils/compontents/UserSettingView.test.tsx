/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import UserSettingsView from '../../components/UserSettingsView';

describe('UserSettingsView Component', () => {
  // Default props for most tests
  const defaultProps = {
    name: '',
    setName: jest.fn(),
    surname: '',
    setSurname: jest.fn(),
    email: 'test@example.com',
    setEmail: jest.fn(),
    password: '',
    setPassword: jest.fn(),
    message: '',
    messageType: '' as 'success' | 'error' | '',
    isLoading: false,
    userData: { name: 'John', surname: 'Doe' },
    handleSubmit: jest.fn().mockImplementation(e => {
      e.preventDefault();
      return Promise.resolve();
    }),
    handleCancel: jest.fn()
  };

  test('renders user settings form with user data', () => {
    const { getByText, getByLabelText } = render(<UserSettingsView {...defaultProps} />);
    
    // Check header and user info
    expect(getByText('Panel użytkownika')).toBeTruthy();
    expect(getByText('John Doe')).toBeTruthy();
    
    // Check form fields
    expect(getByLabelText(/Imie/i)).toBeTruthy();
    expect(getByLabelText(/Nazwisko/i)).toBeTruthy();
    expect(getByLabelText(/Adres email/i)).toBeTruthy();
    expect(getByLabelText(/Nowe hasło/i)).toBeTruthy();
    
    // Check buttons
    expect(getByText('Zapisz zmiany')).toBeTruthy();
    expect(getByText('Anuluj')).toBeTruthy();
  });

  test('displays loading spinner when isLoading is true and email is empty', () => {
    const loadingProps = {
      ...defaultProps,
      isLoading: true,
      email: ''
    };
    
    const { queryByRole, container } = render(<UserSettingsView {...loadingProps} />);
    
    // Form should not be visible
    expect(queryByRole('form')).toBeNull();
    
    // Loading spinner should be visible
    const spinner = container.querySelector('.animate-spin');
    expect(spinner).toBeTruthy();
  });

  test('shows form when isLoading is true but email exists', () => {
    const loadingProps = {
      ...defaultProps,
      isLoading: true
    };
    
    const { getByRole, getByText } = render(<UserSettingsView {...loadingProps} />);
    
    // Form should be visible
    expect(getByRole('form')).toBeTruthy();
    
    // Submit button should show loading state
    expect(getByText('Zapisywanie...')).toBeTruthy();
    
    // Submit button should be disabled
    const submitButton = getByText('Zapisywanie...').closest('button');
    expect(submitButton?.disabled).toBe(true);
  });

  test('handles input changes correctly', () => {
    const { getByLabelText } = render(<UserSettingsView {...defaultProps} />);
    
    // Change name input
    const nameInput = getByLabelText(/Imie/i);
    fireEvent.change(nameInput, { target: { value: 'Jane' } });
    expect(defaultProps.setName).toHaveBeenCalledWith('Jane');
    
    // Change surname input
    const surnameInput = getByLabelText(/Nazwisko/i);
    fireEvent.change(surnameInput, { target: { value: 'Smith' } });
    expect(defaultProps.setSurname).toHaveBeenCalledWith('Smith');
    
    // Change email input
    const emailInput = getByLabelText(/Adres email/i);
    fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
    expect(defaultProps.setEmail).toHaveBeenCalledWith('jane@example.com');
    
    // Change password input
    const passwordInput = getByLabelText(/Nowe hasło/i);
    fireEvent.change(passwordInput, { target: { value: 'newpassword' } });
    expect(defaultProps.setPassword).toHaveBeenCalledWith('newpassword');
  });

  test('submits form when submit button is clicked', () => {
    const { getByRole } = render(<UserSettingsView {...defaultProps} />);
    
    const form = getByRole('form');
    fireEvent.submit(form);
    
    expect(defaultProps.handleSubmit).toHaveBeenCalled();
  });

  test('calls handleCancel when cancel button is clicked', () => {
    const { getByText } = render(<UserSettingsView {...defaultProps} />);
    
    const cancelButton = getByText('Anuluj');
    fireEvent.click(cancelButton);
    
    expect(defaultProps.handleCancel).toHaveBeenCalled();
  });

  test('displays success message correctly', () => {
    const successProps = {
      ...defaultProps,
      message: 'Zmiany zostały zapisane',
      messageType: 'success' as const
    };
    
    const { getByText } = render(<UserSettingsView {...successProps} />);
    
    const messageElement = getByText('Zmiany zostały zapisane');
    expect(messageElement).toBeTruthy();
    
    const messageContainer = messageElement.closest('div');
    expect(messageContainer?.className).toContain('bg-green-100');
    expect(messageContainer?.className).toContain('text-green-800');
  });

  test('displays error message correctly', () => {
    const errorProps = {
      ...defaultProps,
      message: 'Wystąpił błąd',
      messageType: 'error' as const
    };
    
    const { getByText } = render(<UserSettingsView {...errorProps} />);
    
    const messageElement = getByText('Wystąpił błąd');
    expect(messageElement).toBeTruthy();
    
    const messageContainer = messageElement.closest('div');
    expect(messageContainer?.className).toContain('bg-red-100');
    expect(messageContainer?.className).toContain('text-red-800');
  });

  test('does not display user info when userData is incomplete', () => {
    const incompleteUserDataProps = {
      ...defaultProps,
      userData: { name: undefined, surname: undefined }
    };
    
    const { queryByText } = render(<UserSettingsView {...incompleteUserDataProps} />);
    
    // User info should not be displayed
    expect(queryByText('John Doe')).toBeNull();
  });

  test('form inputs have correct initial values', () => {
    const initialValuesProps = {
      ...defaultProps,
      name: 'Jane',
      surname: 'Smith',
      email: 'jane@example.com',
      password: 'secret'
    };
    
    const { getByLabelText } = render(<UserSettingsView {...initialValuesProps} />);
    
    expect((getByLabelText(/Imie/i) as HTMLInputElement).value).toBe('Jane');
    expect((getByLabelText(/Nazwisko/i) as HTMLInputElement).value).toBe('Smith');
    expect((getByLabelText(/Adres email/i) as HTMLInputElement).value).toBe('jane@example.com');
    expect((getByLabelText(/Nowe hasło/i) as HTMLInputElement).value).toBe('secret');
  });
});