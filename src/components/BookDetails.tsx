
// src/components/BookDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { booksApi, borrowingsApi, ApiError } from '../services/api';

interface BookDetailsData {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
  created_at: string;
  updated_at: string;
}

const BookDetails: React.FC = () => {
  const [book, setBook] = useState<BookDetailsData | null>(null);
  const [error, setError] = useState('');
  const [borrowings, setBorrowings] = useState<any[]>([]);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading, setLoading, addBorrowing, clearUser } = useStore();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (id) {
      fetchBookDetails(parseInt(id));
    }
  }, [id, user, navigate]);

  const fetchBookDetails = async (bookId: number) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await booksApi.getBook(user.token, bookId);
      setBook(data.data!);
      
      // Fetch borrowings for this book if user is librarian
      if (user.role === 'librarian') {
        fetchBookBorrowings(bookId);
      }
    } catch (error) {
      console.error('Error fetching book details:', error);
      if (error instanceof ApiError) {
        if (error.status === 401) {
          clearUser();
          navigate('/login');
          return;
        }
        setError(error.message);
      } else {
        setError('Failed to load book details');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchBookBorrowings = async (bookId: number) => {
    if (!user || user.role !== 'librarian') return;
    
    try {
      const data = await borrowingsApi.getBorrowings(user.token);
      const allBorrowings = data.data || [];
      const bookBorrowings = allBorrowings.filter((b: any) => b.book_id === bookId);
      setBorrowings(bookBorrowings);
    } catch (error) {
      console.error('Error fetching borrowings:', error);
    }
  };

  const handleBorrowBook = async () => {
    if (!user || user.role !== 'member' || !book) return;

    setLoading(true);
    setError('');

    try {
      const data = await borrowingsApi.borrowBook(user.token, book.id);
      addBorrowing(data.data!);
      
      // Refresh book details to update available copies
      fetchBookDetails(book.id);
      
      alert('Book borrowed successfully!');
    } catch (error) {
      console.error('Error borrowing book:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to borrow book');
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
    if (returnedDate) return false;
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
          <h1>Book Details</h1>
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
            My Borrowings
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
          Loading book details...
        </div>
      )}

      {/* Book Details */}
      {!isLoading && book && (
        <div>
          <div style={{ 
            backgroundColor: 'white', 
            border: '1px solid #ddd', 
            borderRadius: '8px', 
            padding: '30px', 
            marginBottom: '30px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
              <div style={{ flex: 1 }}>
                <h2 style={{ margin: '0 0 20px 0', color: '#333', fontSize: '28px' }}>
                  {book.title}
                </h2>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                  <div>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>Author:</strong> {book.author}
                    </p>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>Genre:</strong> {book.genre}
                    </p>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>ISBN:</strong> {book.isbn}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>Total Copies:</strong> {book.total_copies}
                    </p>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>Available Copies:</strong> 
                      <span style={{ 
                        color: (book.available_copies || 0) > 0 ? '#28a745' : '#dc3545',
                        fontWeight: 'bold',
                        marginLeft: '8px'
                      }}>
                        {book.available_copies || 0}
                      </span>
                    </p>
                    <p style={{ margin: '10px 0', fontSize: '16px' }}>
                      <strong>Added:</strong> {formatDate(book.created_at)}
                    </p>
                  </div>
                </div>

                <div style={{ 
                  padding: '15px', 
                  backgroundColor: (book.available_copies || 0) > 0 ? '#d4edda' : '#f8d7da',
                  borderRadius: '4px',
                  border: `1px solid ${(book.available_copies || 0) > 0 ? '#c3e6cb' : '#f5c6cb'}`,
                  marginBottom: '20px'
                }}>
                  <p style={{ 
                    margin: '0', 
                    color: (book.available_copies || 0) > 0 ? '#155724' : '#721c24',
                    fontWeight: 'bold'
                  }}>
                    {(book.available_copies || 0) > 0 
                      ? `✅ This book is available for borrowing (${book.available_copies} copies available)`
                      : '❌ This book is currently not available for borrowing'
                    }
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {user.role === 'member' && (
                <button
                  onClick={handleBorrowBook}
                  disabled={isLoading || (book.available_copies || 0) <= 0}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: (book.available_copies || 0) > 0 ? '#28a745' : '#6c757d', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: isLoading || (book.available_copies || 0) <= 0 ? 'not-allowed' : 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  {(book.available_copies || 0) > 0 ? 'Borrow This Book' : 'Not Available'}
                </button>
              )}
              
              {user.role === 'librarian' && (
                <button
                  onClick={() => navigate(`/books/${book.id}/edit`)}
                  style={{ 
                    padding: '12px 24px', 
                    backgroundColor: '#ffc107', 
                    color: 'black', 
                    border: 'none', 
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    fontWeight: 'bold'
                  }}
                >
                  Edit Book
                </button>
              )}
            </div>
          </div>

          {/* Borrowings Section for Librarians */}
          {user.role === 'librarian' && (
            <div style={{ 
              backgroundColor: 'white', 
              border: '1px solid #ddd', 
              borderRadius: '8px', 
              padding: '30px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ marginTop: '0', marginBottom: '20px' }}>
                Borrowing History ({borrowings.length})
              </h3>
              
              {borrowings.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  No borrowing records found for this book.
                </p>
              ) : (
                <div style={{ display: 'grid', gap: '15px' }}>
                  {borrowings.map((borrowing) => (
                    <div 
                      key={borrowing.id}
                      style={{ 
                        border: '1px solid #ddd', 
                        borderRadius: '4px', 
                        padding: '15px',
                        backgroundColor: '#f8f9fa',
                        borderLeft: `4px solid ${
                          borrowing.returned_date 
                            ? '#28a745' 
                            : isOverdue(borrowing.due_date) 
                              ? '#dc3545' 
                              : '#ffc107'
                        }`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>
                            {borrowing.user.name} ({borrowing.user.email})
                          </p>
                          <p style={{ margin: '0', fontSize: '14px', color: '#666' }}>
                            Borrowed: {formatDate(borrowing.borrowed_date)} | 
                            Due: {formatDate(borrowing.due_date)}
                            {borrowing.returned_date && ` | Returned: ${formatDate(borrowing.returned_date)}`}
                          </p>
                        </div>
                        <span style={{ 
                          padding: '4px 8px', 
                          borderRadius: '12px', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          backgroundColor: borrowing.returned_date 
                            ? '#d4edda' 
                            : isOverdue(borrowing.due_date) 
                              ? '#f8d7da' 
                              : '#fff3cd',
                          color: borrowing.returned_date 
                            ? '#155724' 
                            : isOverdue(borrowing.due_date) 
                              ? '#721c24' 
                              : '#856404'
                        }}>
                          {borrowing.returned_date 
                            ? 'RETURNED' 
                            : isOverdue(borrowing.due_date) 
                              ? 'OVERDUE' 
                              : 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Book Not Found */}
      {!isLoading && !book && !error && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Book Not Found</h2>
          <p>The book you're looking for doesn't exist or has been removed.</p>
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
            Back to Books
          </button>
        </div>
      )}
    </div>
  );
};

export default BookDetails;
