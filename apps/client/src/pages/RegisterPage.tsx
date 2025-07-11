import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../output.css'

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
    <div className="flex items-center justify-center mx-auto bg-transparent">
      <form className="bg-white p-8 rounded shadow min-w-[300px] flex flex-col gap-4" onSubmit={handleLogin}>
        <h2>Register</h2>
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
          Register
        </button>
        {message && <div className="text-red-500 text-center">{message}</div>}
      </form>
    </div>
  );
};

export default RegisterPage;
