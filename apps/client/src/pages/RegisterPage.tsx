import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import RegisterForm from '../components/RegisterForm';
import '../output.css';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleSurnameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSurname(e.target.value);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsSubmitting(true);

    const nameRegex = /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]*$/;

    if (!nameRegex.test(name)) {
      setMessage('Imię zawiera niedozwolone znaki');
      setIsSubmitting(false);
      return;
    }
    if (!nameRegex.test(surname)) {
      setMessage('Nazwisko zawiera niedozwolone znaki');
      setIsSubmitting(false);
      return;
    }
    if (!email.includes('@')) {
      setMessage('Podaj poprawny adres email');
      setIsSubmitting(false);
      return;
    }
    if (password.length < 6) {
      setMessage('Hasło musi mieć co najmniej 6 znaków');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, surname, email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Rejestracja zakończona pomyślnie!');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Optional delay for user feedback
        navigate('/login');
      } else {
        setMessage(data.message || 'Rejestracja nie powiodła się. Spróbuj ponownie.');
      }
    } catch (error) {
      setMessage('Wystąpił błąd podczas rejestracji. Spróbuj ponownie później.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RegisterForm
      name={name}
      surname={surname}
      email={email}
      password={password}
      message={message}
      isSubmitting={isSubmitting}
      onNameChange={handleNameChange}
      onSurnameChange={handleSurnameChange}
      onEmailChange={handleEmailChange}
      onPasswordChange={handlePasswordChange}
      onSubmit={handleRegister}
      onLoginClick={handleLoginClick}
    />
  );
};

  export default RegisterPage;