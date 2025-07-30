
// src/components/BookEdit.tsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useStore from '../store/store';
import { booksApi, ApiError } from '../services/api';

interface BookEditData {
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

const BookEdit: React.FC = () => {
  const [book, setBook] = useState<BookEditData | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    isbn: '',
    total_copies: 1,
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isLoading, setLoading, updateBook, clearUser } = useStore();

  const fetchBookDetails = React.useCallback(async (bookId: number) => {
    if (!user) return;
    
    setLoading(true);
    setError('');
    
    try {
      const data = await booksApi.getBook(user.token, bookId);
      const bookData = data.data!;
      setBook(bookData);
      
      // Populate form with current book data
      setFormData({
        title: bookData.title,
        author: bookData.author,
        genre: bookData.genre,
        isbn: bookData.isbn,
        total_copies: bookData.total_copies,
      });
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
  }, [user, setLoading, clearUser, navigate]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    if (user.role !== 'librarian') {
      navigate('/books');
      return;
    }
    if (id) {
      fetchBookDetails(parseInt(id));
    }
  }, [id, user, navigate, fetchBookDetails]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'total_copies' ? parseInt(value) || 1 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !book) return;

    setIsSubmitting(true);
    setError('');

    // Basic validation
    if (!formData.title || !formData.author || !formData.genre || !formData.isbn) {
      setError('All fields are required');
      setIsSubmitting(false);
      return;
    }

    if (formData.total_copies < 1) {
      setError('Total copies must be at least 1');
      setIsSubmitting(false);
      return;
    }

    try {
      const data = await booksApi.updateBook(user.token, book.id, formData);
      updateBook(book.id, data.data!);
      
      alert('Book updated successfully!');
      navigate(`/books/${book.id}`);
    } catch (error) {
      console.error('Error updating book:', error);
      setError(error instanceof ApiError ? error.message : 'Failed to update book');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearUser();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (!user || user.role !== 'librarian') return null;

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
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
          <h1>Edit Book</h1>
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
          {book && (
            <button 
              onClick={() => navigate(`/books/${book.id}`)}
              style={{ 
                padding: '8px 16px', 
                backgroundColor: '#17a2b8', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              View Details
            </button>
          )}
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

      {/* Edit Form */}
      {!isLoading && book && (
        <div style={{ 
          backgroundColor: 'white', 
          border: '1px solid #ddd', 
          borderRadius: '8px', 
          padding: '30px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 10px 0', color: '#333' }}>
              Editing: {book.title}
            </h2>
            <p style={{ color: '#666', margin: '0' }}>
              Book ID: {book.id} • Created: {formatDate(book.created_at)} • 
              Last updated: {formatDate(book.updated_at)}
            </p>
            {book.available_copies !== undefined && (
              <p style={{ color: '#666', margin: '5px 0 0 0' }}>
                Current availability: {book.available_copies} / {book.total_copies} copies
              </p>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Title: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Author: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Genre: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  ISBN: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  name="isbn"
                  value={formData.isbn}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
                  Total Copies: <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="number"
                  name="total_copies"
                  value={formData.total_copies}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  min="1"
                  max="1000"
                  required
                  style={{ 
                    width: '100%', 
                    padding: '10px', 
                    border: '1px solid #ccc', 
                    borderRadius: '4px',
                    fontSize: '16px'
                  }}
                />
                <small style={{ color: '#666', fontSize: '14px' }}>
                  Current: {book.total_copies} copies
                  {book.available_copies !== undefined && 
                    ` (${book.available_copies} available)`
                  }
                </small>
              </div>
            </div>

            {/* Warning about changing total copies */}
            {formData.total_copies !== book.total_copies && (
              <div style={{ 
                backgroundColor: '#fff3cd', 
                border: '1px solid #ffeaa7', 
                borderRadius: '4px', 
                padding: '10px', 
                marginBottom: '20px',
                color: '#856404'
              }}>
                <strong>⚠️ Warning:</strong> Changing the total number of copies may affect book availability. 
                Current borrowings will not be affected, but available copies may change.
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => navigate(`/books/${book.id}`)}
                disabled={isSubmitting}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: '#6c757d', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
              
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ 
                  padding: '12px 24px', 
                  backgroundColor: isSubmitting ? '#6c757d' : '#28a745', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontSize: '16px',
                  fontWeight: 'bold'
                }}
              >
                {isSubmitting ? 'Updating...' : 'Update Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Book Not Found */}
      {!isLoading && !book && !error && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Book Not Found</h2>
          <p>The book you're trying to edit doesn't exist or has been removed.</p>
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

export default BookEdit;
