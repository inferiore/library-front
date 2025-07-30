// src/components/BooksList.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { booksApi, borrowingsApi, ApiError } from '../services/api';

const BooksList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    total_copies: 1,
  });
  const [error, setError] = useState('');
  
  const { books, user, isLoading, setBooks, addBook, removeBook, addBorrowing, setLoading, clearUser } = useStore();
  const navigate = useNavigate();

  const fetchBooks = React.useCallback(async (search?: string) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await booksApi.getBooks(user.token, search);
      setBooks(data.data || []);
    } catch (error) {
      console.error('Error fetching books:', error);
      if (error instanceof ApiError && error.status === 401) {
        clearUser();
        navigate('/login');
        return;
      }
      setError(error instanceof ApiError ? error.message : 'Failed to load books');
    } finally {
      setLoading(false);
    }
  }, [user, setLoading, setBooks, clearUser, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchBooks();
  }, [user, navigate, fetchBooks]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(searchTerm);
  };

  const handleCreateBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || user.role !== 'librarian') return;

    setLoading(true);
    setError('');

    try {
      const data = await booksApi.createBook(user.token, newBook);
      addBook(data.data!);
      setNewBook({ title: '', author: '', genre: '', isbn: '', total_copies: 1 });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating book:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to create book');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBook = async (bookId: number) => {
    if (!user || user.role !== 'librarian') return;
    if (!window.confirm('Are you sure you want to delete this book?')) return;

    setLoading(true);
    setError('');

    try {
      await booksApi.deleteBook(user.token, bookId);
      removeBook(bookId);
    } catch (error) {
      console.error('Error deleting book:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to delete book');
    } finally {
      setLoading(false);
    }
  };

  const handleBorrowBook = async (bookId: number) => {
    if (!user || user.role !== 'member') return;

    setLoading(true);
    setError('');

    try {
      const data = await borrowingsApi.borrowBook(user.token, bookId);
      addBorrowing(data.data!);
      
      // Refresh books to update available copies
      fetchBooks(searchTerm || undefined);
      
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
          <h1>Library Management System</h1>
          <p>Welcome, {user.name} ({user.role})</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
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

      {/* Search and Create Section */}
      <div style={{ marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', marginBottom: '20px' }}>
          {/* Search Form */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '10px', flex: 1 }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Search Books:</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by title, author, or genre..."
                style={{ 
                  width: '100%', 
                  padding: '8px', 
                  border: '1px solid #ccc', 
                  borderRadius: '4px' 
                }}
              />
            </div>
            <button 
              type="submit" 
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Search
            </button>
            <button 
              type="button" 
              onClick={() => {
                setSearchTerm('');
                fetchBooks();
              }}
              disabled={isLoading}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              Clear
            </button>
          </form>

          {/* Create Book Button (Librarian Only) */}
          {user.role === 'librarian' && (
            <button 
              onClick={() => setShowCreateForm(!showCreateForm)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {showCreateForm ? 'Cancel' : 'Add New Book'}
            </button>
          )}
        </div>

        {/* Create Book Form */}
        {showCreateForm && user.role === 'librarian' && (
          <form 
            onSubmit={handleCreateBook}
            style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '20px', 
              borderRadius: '4px', 
              border: '1px solid #dee2e6' 
            }}
          >
            <h3>Add New Book</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Title:</label>
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({...newBook, title: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Author:</label>
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({...newBook, author: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Genre:</label>
                <input
                  type="text"
                  value={newBook.genre}
                  onChange={(e) => setNewBook({...newBook, genre: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>ISBN:</label>
                <input
                  type="text"
                  value={newBook.isbn}
                  onChange={(e) => setNewBook({...newBook, isbn: e.target.value})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px' }}>Total Copies:</label>
                <input
                  type="number"
                  min="1"
                  value={newBook.total_copies}
                  onChange={(e) => setNewBook({...newBook, total_copies: parseInt(e.target.value)})}
                  required
                  style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                />
              </div>
            </div>
            <button 
              type="submit" 
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
              {isLoading ? 'Creating...' : 'Create Book'}
            </button>
          </form>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          Loading books...
        </div>
      )}

      {/* Books List */}
      {!isLoading && (
        <div>
          <h2>Books ({books.length})</h2>
          {books.length === 0 ? (
            <p>No books found.</p>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {books.map((book) => (
                <div 
                  key={book.id}
                  style={{ 
                    border: '1px solid #ddd', 
                    borderRadius: '4px', 
                    padding: '15px',
                    backgroundColor: 'white'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{book.title}</h3>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Author:</strong> {book.author}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Genre:</strong> {book.genre}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>ISBN:</strong> {book.isbn}
                      </p>
                      <p style={{ margin: '5px 0', color: '#666' }}>
                        <strong>Copies:</strong> {book.available_copies || 0} / {book.total_copies} available
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => navigate(`/books/${book.id}`)}
                        style={{ 
                          padding: '6px 12px', 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          border: 'none', 
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        View Details
                      </button>
                      
                      {user.role === 'member' && (
                        <button
                          onClick={() => handleBorrowBook(book.id)}
                          disabled={isLoading || (book.available_copies || 0) <= 0}
                          style={{ 
                            padding: '6px 12px', 
                            backgroundColor: (book.available_copies || 0) > 0 ? '#28a745' : '#6c757d', 
                            color: 'white', 
                            border: 'none', 
                            borderRadius: '4px',
                            cursor: isLoading || (book.available_copies || 0) <= 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {(book.available_copies || 0) > 0 ? 'Borrow Book' : 'Not Available'}
                        </button>
                      )}
                      
                      {user.role === 'librarian' && (
                        <>
                          <button
                            onClick={() => navigate(`/books/${book.id}/edit`)}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#ffc107', 
                              color: 'black', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: 'pointer'
                            }}
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteBook(book.id)}
                            disabled={isLoading}
                            style={{ 
                              padding: '6px 12px', 
                              backgroundColor: '#dc3545', 
                              color: 'white', 
                              border: 'none', 
                              borderRadius: '4px',
                              cursor: isLoading ? 'not-allowed' : 'pointer'
                            }}
                          >
                            Delete
                          </button>
                        </>
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

export default BooksList;
