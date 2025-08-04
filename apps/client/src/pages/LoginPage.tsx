import React from 'react';
import { useNavigate } from 'react-router-dom';


const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [message, setMessage] = React.useState('');

const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault();
  setMessage('');
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
  }
};



  return (
    <div className="flex items-center justify-center mx-auto bg-transparent">
      <form className="bg-white p-8 rounded shadow min-w-[300px] flex flex-col gap-4" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          className="p-2 border border-gray-300 rounded text-base"
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input
          className="p-2 border border-gray-300 rounded text-base"
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button className="p-3 rounded border-none bg-[#007bff] text-white font-bold cursor-pointer text-base" type="submit">
          Log In
        </button>
        <button className="p-3 rounded border-none bg-[#007bff] text-white font-bold cursor-pointer text-base" type="button" onClick={() => navigate('/register')}>
          Register
        </button> 
        {message && <div className="text-red-500 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default LoginPage;
