import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Register successful!');
        await new Promise(resolve => setTimeout(resolve, 1000)); // Optional delay for user feedback
        navigate('/login');
      } else {
        setMessage(data.message || 'Registration failed. Please try again.');
      }
    } catch {
      setMessage('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={handleLogin}>
        <h2>Register</h2>
        <input
          className='input'
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className='input'
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className='button' type="submit">
          Register
        </button>
        {message && <div className='message'>{message}</div>}
      </form>
    </div>
  );
};

export default RegisterPage;
