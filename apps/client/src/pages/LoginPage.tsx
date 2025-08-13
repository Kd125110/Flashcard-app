import React from 'react';
import { useLogin } from '../hooks/useLogin';
import LoginView from '../components/LoginView';

const LoginPage: React.FC = () => {
  const loginProps = useLogin();
  
  return <LoginView {...loginProps} />;
};

export default LoginPage;