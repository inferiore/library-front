import React from 'react';
import { LibrarianDashboard } from '../services/api';
import './LibrarianDashboard.css';

interface LibrarianDashboardProps {
  data: LibrarianDashboard;
  navigate: any;
}

const LibrarianDashboardComponent: React.FC<LibrarianDashboardProps> = ({ data, navigate }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="librarian-dashboard">
      {/* Statistics Cards */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <h3 className="blue">Total Books</h3>
          <div className="stat-value blue">
            {data.total_books || 0}
          </div>
        </div>

        <div className="stat-card green">
          <h3 className="green">Total Members</h3>
          <div className="stat-value green">
            {data.total_members || 0}
          </div>
        </div>

        <div className="stat-card orange">
          <h3 className="orange">Books Borrowed</h3>
          <div className="stat-value orange">
            {data.total_borrowed_books || 0}
          </div>
        </div>

        <div className="stat-card red">
          <h3 className="red">Overdue Books</h3>
          <div className="stat-value red">
            {data.total_overdue_books || 0}
          </div>
        </div>
      </div>

      <div className="content-grid">
        {/* Recent Borrowings */}
        <div className="dashboard-card">
          <h3>Recent Borrowings</h3>
          {data.recent_borrowings && data.recent_borrowings.length > 0 ? (
            <div className="borrowings-list">
              {data.recent_borrowings.slice(0, 5).map((borrowing) => (
                <div 
                  key={borrowing.id}
                  className={`borrowing-item ${borrowing.is_overdue ? 'overdue' : ''}`}
                >
                  <div className="borrowing-title">
                    {borrowing.book.title}
                  </div>
                  <div className="borrowing-details">
                    {borrowing.user.name} • Due: {formatDate(borrowing.due_at)}
                    {borrowing.is_overdue && (
                      <span className="overdue-badge">
                        OVERDUE
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No recent borrowings</p>
          )}
          <button 
            onClick={() => navigate('/borrowings')}
            className="card-button primary"
          >
            View All Borrowings
          </button>
        </div>

        {/* Popular Books */}
        <div className="dashboard-card">
          <h3>Popular Books</h3>
          {data.popular_books && data.popular_books.length > 0 ? (
            <div className="books-list">
              {data.popular_books.slice(0, 5).map((book, index) => (
                <div 
                  key={book.id}
                  className="book-item"
                >
                  <div className="book-info">
                    <div className="book-title">
                      #{index + 1} {book.title}
                    </div>
                    <div className="book-author">
                      by {book.author}
                    </div>
                  </div>
                  <div className="borrowing-count">
                    {book.borrowing_count} borrows
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="empty-state">No borrowing data available</p>
          )}
          <button 
            onClick={() => navigate('/books')}
            className="card-button success"
          >
            Manage Books
          </button>
        </div>
      </div>
    </div>
  );
};

export default LibrarianDashboardComponent;