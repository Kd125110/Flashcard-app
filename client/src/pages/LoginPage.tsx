import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../App.css'

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        setMessage('Login successful!');
        navigate('/dashboard');
      } else {
        setMessage(data.message || 'Login failed. Please try again.');
      }
    } catch {
      setMessage('An error occurred while logging in. Please try again later.');
    }
  };

  return (
    <div className='container'>
      <form className='form' onSubmit={handleLogin}>
        <h2>Login</h2>
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
          Log In
        </button>
        <button className='button' type="button" onClick={() => navigate('/register')}>
          Register
        </button>
        {message && <div className='message'>{message}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
