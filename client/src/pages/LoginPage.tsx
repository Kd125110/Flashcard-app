import React from 'react';
import LoginForm from '../components/Auth/LoginForm';

const pageStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f0f0',
  },
};

const LoginPage: React.FC = () => {
  const handleLogin = (email: string, password: string) => {
    // Handle login logic here
    console.log('Logging in with:', { email, password });
  };

  return (
    <div style={pageStyles.container}>
      <LoginForm onLogin={handleLogin} />
    </div>
  );
};

export default LoginPage;
