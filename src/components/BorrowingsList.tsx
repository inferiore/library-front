// src/components/BorrowingsList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { borrowingsApi, ApiError } from '../services/api';

const BorrowingsList: React.FC = () => {
  const [error, setError] = useState('');
  
  const { borrowings, user, isLoading, setBorrowings, updateBorrowing, setLoading, clearUser } = useStore();
  const navigate = useNavigate();

  const fetchBorrowings = React.useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await borrowingsApi.getBorrowings(user.token);
      setBorrowings(data.data || []);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
      if (error instanceof ApiError && error.status === 401) {
        clearUser();
        navigate('/login');
        return;
      }
      setError(error instanceof ApiError ? error.message : 'Failed to load borrowings');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setBorrowings, clearUser, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBorrowings();
  }, [user, navigate, fetchBorrowings]);

  const handleReturnBook = async (borrowingId: number) => {
    if (!user || user.role !== 'librarian') return;
    if (!window.confirm('Are you sure you want to mark this book as returned?')) return;

    setLoading(true);
    setError('');

    try {
      const data = await borrowingsApi.returnBook(user.token, borrowingId);
      updateBorrowing(borrowingId, data.data!);
      
      alert('Book marked as returned successfully!');
    } catch (error) {
      console.error('Error returning book:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to return book');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const isOverdue = (dueDateString: string, returnedDate?: string) => {
    if (returnedDate) return false; // Already returned
    return new Date(dueDateString) < new Date();
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
            {user.role === 'librarian' ? 'All Borrowings' : 'My Borrowings'}
          </h1>
          <p>Welcome, {user.name} ({user.role})</p>
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
            Back to Books
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
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading borrowings...
        </div>
      )}

      {/* Borrowings List */}
      {!isLoading && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Borrowings ({borrowings.length})</h2>
            <button 
              onClick={fetchBorrowings}
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
          
          {borrowings.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No borrowings found.</p>
              <button 
                onClick={() => navigate('/books')}
                style={{ 
                  padding: '10px 20px', 
                  backgroundColor: '#007bff', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginTop: '10px'
                }}
              >
                Browse Books
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {borrowings.map((borrowing) => (
                <div 
                  key={borrowing.id}
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '20px',
                    backgroundColor: 'white',
                    borderLeft: `4px solid ${
                      borrowing.returned_at
                        ? '#28a745' 
                        : isOverdue(borrowing.due_at) 
                          ? '#dc3545' 
                          : '#ffc107'
                    }`
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                        <h3 style={{ margin: '0', color: '#333' }}>
                          {borrowing.book.title}
                        </h3>
                        <span style={{ 
                          padding: '2px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          backgroundColor: borrowing.returned_at
                            ? '#d4edda' 
                            : isOverdue(borrowing.due_at) 
                              ? '#f8d7da' 
                              : '#fff3cd',
                          color: borrowing.returned_at 
                            ? '#155724' 
                            : isOverdue(borrowing.due_at) 
                              ? '#721c24' 
                              : '#856404'
                        }}>
                          {borrowing.returned_at
                            ? 'RETURNED' 
                            : isOverdue(borrowing.due_at) 
                              ? 'OVERDUE' 
                              : 'ACTIVE'}
                        </span>
                      </div>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '10px' }}>
                        <div>
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Author:</strong> {borrowing.book.author}
                          </p>
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Genre:</strong> {borrowing.book.genre}
                          </p>
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>ISBN:</strong> {borrowing.book.isbn}
                          </p>
                        </div>
                        <div>
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Borrowed:</strong> {formatDate(borrowing.borrowed_at)}
                          </p>
                          <p style={{ margin: '5px 0', color: '#666' }}>
                            <strong>Due:</strong> {formatDate(borrowing.due_at)}
                          </p>
                          {borrowing.returned_at && (
                            <p style={{ margin: '5px 0', color: '#666' }}>
                              <strong>Returned:</strong> {formatDate(borrowing.returned_at)}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      {user.role === 'librarian' && (
                        <p style={{ margin: '5px 0', color: '#666' }}>
                          <strong>Borrower:</strong> {borrowing.user.name} ({borrowing.user.email})
                        </p>
                      )}
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => navigate(`/books/${borrowing.book.id}`)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        View Book
                      </button>
                      
                      {user.role === 'librarian' && !borrowing.returned_at && (
                        <button
                          onClick={() => handleReturnBook(borrowing.id)}
                          disabled={isLoading}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: '#28a745', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: isLoading ? 'not-allowed' : 'pointer'
                          }}
                        >
                          Mark as Returned
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BorrowingsList;