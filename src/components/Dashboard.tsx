
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { dashboardApi, ApiError, LibrarianDashboard, MemberDashboard } from '../services/api';
import { mapDashboardData } from '../services/mappers';
import LibrarianDashboardComponent from './LibrarianDashboard';
import MemberDashboardComponent from './MemberDashboard';
import './Dashboard.css';


const Dashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<LibrarianDashboard | MemberDashboard | null>(null);
  const [error, setError] = useState('');
  
  const { user, isLoading, setLoading, clearUser } = useStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchDashboardData();
  }, [user, navigate]);

  const fetchDashboardData = async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      let response;
      if (user.role === 'librarian') {
        response = await dashboardApi.getLibrarianDashboard(user.token);
      } else {
        response = await dashboardApi.getMemberDashboard(user.token);
      }
      
      // Usar el mapper para transformar los datos de forma segura
      const mappedData = mapDashboardData(response, user.role);
      setDashboardData(mappedData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error instanceof ApiError && error.status === 401) {
        clearUser();
        navigate('/login');
        return;
      }
      setError(error instanceof ApiError ? error.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };


  if (!user) return null;

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>
            {user.role === 'librarian' ? 'Librarian Dashboard' : 'Member Dashboard'}
          </h1>
          <p>Welcome back, {user.name}!</p>
        </div>
        <div className="dashboard-actions">
          <button 
            onClick={() => navigate('/books')}
            className="dashboard-btn primary"
          >
            Browse Books
          </button>
          <button 
            onClick={() => navigate('/borrowings')}
            className="dashboard-btn secondary"
          >
            {user.role === 'librarian' ? 'All Borrowings' : 'My Borrowings'}
          </button>
          <button 
            onClick={handleLogout}
            className="dashboard-btn danger"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="loading-container">
          Loading dashboard...
        </div>
      )}

      {/* Dashboard Content */}
      {!isLoading && dashboardData && (
        <div>
          {user.role === 'librarian' ? (
            <LibrarianDashboardComponent data={dashboardData as LibrarianDashboard} navigate={navigate} />
          ) : (
            <MemberDashboardComponent data={dashboardData as MemberDashboard} navigate={navigate} />
          )}
        </div>
      )}

      {/* Refresh Button */}
      <div className="refresh-container">
        <button 
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="refresh-btn"
        >
          {isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
      </div>
    </div>
  );
};

export default Dashboard;