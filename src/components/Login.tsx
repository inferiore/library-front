// src/components/Login.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { authApi, ApiError } from '../services/api';
import './Login.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('librarian@library.com');
  const [password, setPassword] = useState('Password123!');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const setUser = useStore((state) => state.setUser);
  const user = useStore((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields');
      setIsLoading(false);
      return;
    }

    try {
      const data = await authApi.login(email, password);

      const user = {
        id: data.user.id.toString(),
        name: data.user.name,
        email: data.user.email,
        token: data.access_token,
        role: data.user.role as 'librarian' | 'member',
      };

      setUser(user);
      navigate('/dashboard');
    } catch (error) {
      console.error('Error during login:', error);
      if (error instanceof ApiError) {
        setError(error.message);
      } else {
        setError('Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">Library Management System</h1>
      <h2 className="login-subtitle">Login</h2>
      
      {error && (
        <div className="login-error">
          {error}
        </div>
      )}
      
      <form onSubmit={handleLogin} className="login-form">
        <div className="form-group">
          <label htmlFor="email" className="form-label">
            Email:
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password" className="form-label">
            Password:
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
            className="form-input"
          />
        </div>
        
        <div className="form-group submit">
          <button 
            type="submit" 
            disabled={isLoading}
            className="login-button"
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </div>
      </form>
      
      <div className="demo-credentials">
        <p><strong>Demo Credentials:</strong></p>
        <p>Librarian: librarian@library.com / password123</p>
        <p>Member: alice@example.com / password123</p>
      </div>
    </div>
  );
};

export default Login;