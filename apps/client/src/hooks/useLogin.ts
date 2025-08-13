import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const useLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setIsLoading(true);
    console.log('Attempting login with:', { email, password });
    
    try {
      console.log('Sending request to:', 'http://localhost:3001/api/auth/login');
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok) {
        console.log('Login successful, saving token');
        localStorage.setItem("authToken", data.token);
        setMessage('Login successful!');
        navigate('/dashboard');
      } else {
        console.log('Login failed:', data.message);
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setMessage('An error occurred while logging in. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToRegister = () => {
    navigate('/register');
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    message,
    isLoading,
    handleLogin,
    navigateToRegister
  };
};