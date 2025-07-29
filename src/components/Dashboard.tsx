
// src/components/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { dashboardApi, ApiError, LibrarianDashboard, MemberDashboard } from '../services/api';


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
      
      if (response.data) {
        setDashboardData(response.data);
      } else {
        setDashboardData(response as LibrarianDashboard | MemberDashboard);
      }
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
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '30px',
        paddingBottom: '20px',
        borderBottom: '1px solid #eee'
      }}>
        <div>
          <h1>
            {user.role === 'librarian' ? 'Librarian Dashboard' : 'Member Dashboard'}
          </h1>
          <p>Welcome back, {user.name}!</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => navigate('/books')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Browse Books
          </button>
          <button 
            onClick={() => navigate('/borrowings')}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            {user.role === 'librarian' ? 'All Borrowings' : 'My Borrowings'}
          </button>
          <button 
            onClick={handleLogout}
            style={{ 
              padding: '8px 16px', 
              backgroundColor: '#dc3545', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '10px', 
          borderRadius: '4px', 
          marginBottom: '20px' 
        }}>
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
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
      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button 
          onClick={fetchDashboardData}
          disabled={isLoading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Refreshing...' : 'Refresh Dashboard'}
        </button>
      </div>
    </div>
  );
};

// Librarian Dashboard Component
const LibrarianDashboardComponent: React.FC<{ data: LibrarianDashboard; navigate: any }> = ({ data, navigate }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div>
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #bbdefb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Total Books</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0d47a1' }}>
            {data.total_books || 0}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #c8e6c9',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Total Members</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1b5e20' }}>
            {data.total_members || 0}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#fff3e0', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ffcc02',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#f57c00' }}>Books Borrowed</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e65100' }}>
            {data.total_borrowed_books || 0}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#ffebee', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #ffcdd2',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#d32f2f' }}>Overdue Books</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#b71c1c' }}>
            {data.total_overdue_books || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Recent Borrowings */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Recent Borrowings</h3>
          {data.recent_borrowings && data.recent_borrowings.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.recent_borrowings.slice(0, 5).map((borrowing) => (
                <div 
                  key={borrowing.id}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: borrowing.is_overdue ? '2px solid #dc3545' : '1px solid #dee2e6'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {borrowing.book.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {borrowing.user.name} • Due: {formatDate(borrowing.due_at)}
                    {borrowing.is_overdue && (
                      <span style={{ color: '#dc3545', marginLeft: '10px', fontWeight: 'bold' }}>
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No recent borrowings</p>
          )}
          <button 
            onClick={() => navigate('/borrowings')}
            style={{ 
              marginTop: '15px',
              padding: '8px 16px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            View All Borrowings
          </button>
        </div>

        {/* Popular Books */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Popular Books</h3>
          {data.popular_books && data.popular_books.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.popular_books.slice(0, 5).map((book, index) => (
                <div 
                  key={book.id}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                      #{index + 1} {book.title}
                    </div>
                    <div style={{ fontSize: '14px', color: '#666' }}>
                      by {book.author}
                    </div>
                  </div>
                  <div style={{ 
                    backgroundColor: '#007bff', 
                    color: 'white', 
                    padding: '4px 8px', 
                    borderRadius: '12px', 
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {book.borrowing_count} borrows
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No borrowing data available</p>
          )}
          <button 
            onClick={() => navigate('/books')}
            style={{ 
              marginTop: '15px',
              padding: '8px 16px', 
              backgroundColor: '#28a745', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            Manage Books
          </button>
        </div>
      </div>
    </div>
  );
};

// Member Dashboard Component
const MemberDashboardComponent: React.FC<{ data: MemberDashboard; navigate: any }> = ({ data, navigate }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div>
      {/* Statistics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
        <div style={{ 
          backgroundColor: '#e3f2fd', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #bbdefb',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1565c0' }}>Active Borrowings</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0d47a1' }}>
            {data.active_borrowings?.length || 0}
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px', 
          border: '1px solid #c8e6c9',
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Total Borrowed</h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1b5e20' }}>
            {data.total_books_borrowed || 0}
          </div>
        </div>

        <div style={{ 
          backgroundColor: data.overdue_count > 0 ? '#ffebee' : '#e8f5e8', 
          padding: '20px', 
          borderRadius: '8px', 
          border: `1px solid ${data.overdue_count > 0 ? '#ffcdd2' : '#c8e6c9'}`,
          textAlign: 'center'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: data.overdue_count > 0 ? '#d32f2f' : '#2e7d32' }}>
            Overdue Books
          </h3>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: data.overdue_count > 0 ? '#b71c1c' : '#1b5e20' }}>
            {data.overdue_count || 0}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Active Borrowings */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Current Borrowings</h3>
          {data.active_borrowings && data.active_borrowings.length > 0 ? (
            <div style={{ display: 'grid', gap: '15px' }}>
              {data.active_borrowings.map((borrowing) => (
                <div 
                  key={borrowing.id}
                  style={{ 
                    padding: '15px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: borrowing.is_overdue ? '2px solid #dc3545' : '1px solid #dee2e6',
                    borderLeft: `4px solid ${borrowing.is_overdue ? '#dc3545' : '#28a745'}`
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {borrowing.book.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    by {borrowing.book.author} • {borrowing.book.genre}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Borrowed: {formatDate(borrowing.borrowed_at)} • Due: {formatDate(borrowing.due_at)}
                  </div>
                  {borrowing.is_overdue && (
                    <div style={{ 
                      marginTop: '5px',
                      color: '#dc3545', 
                      fontSize: '12px',
                      fontWeight: 'bold'
                    }}>
                      ⚠️ OVERDUE - Please return immediately
                    </div>
                  )}
                  {!borrowing.is_overdue && borrowing.days_until_due && (
                    <div style={{ 
                      marginTop: '5px',
                      color: '#856404', 
                      fontSize: '12px'
                    }}>
                      📅 {borrowing.days_until_due}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/books/${borrowing.book.id}`)}
                    style={{ 
                      marginTop: '10px',
                      padding: '4px 8px', 
                      backgroundColor: '#007bff', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px'
                    }}
                  >
                    View Book Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ color: '#666', marginBottom: '15px' }}>You have no active borrowings</p>
              <button 
                onClick={() => navigate('/books')}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Browse Books
              </button>
            </div>
          )}
        </div>

        {/* Borrowing History */}
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '20px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ marginTop: '0', marginBottom: '20px' }}>Recent Returns</h3>
          {data.borrowing_history && data.borrowing_history.length > 0 ? (
            <div style={{ display: 'grid', gap: '10px' }}>
              {data.borrowing_history.slice(0, 5).map((borrowing) => (
                <div 
                  key={borrowing.id}
                  style={{ 
                    padding: '10px', 
                    backgroundColor: '#f8f9fa', 
                    borderRadius: '4px',
                    border: '1px solid #dee2e6',
                    borderLeft: '4px solid #28a745'
                  }}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {borrowing.book.title}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666', marginBottom: '5px' }}>
                    by {borrowing.book.author}
                  </div>
                  <div style={{ fontSize: '12px', color: '#666' }}>
                    Borrowed: {formatDate(borrowing.borrowed_at)} • 
                    Returned: {formatDate(borrowing.returned_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No borrowing history</p>
          )}
          <button 
            onClick={() => navigate('/borrowings')}
            style={{ 
              marginTop: '15px',
              padding: '8px 16px', 
              backgroundColor: '#17a2b8', 
              color: 'white', 
              border: 'none', 
              borderRadius: '4px',
              cursor: 'pointer',
              width: '100%'
            }}
          >
            View All Borrowings
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;