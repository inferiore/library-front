import React from 'react';
import { MemberDashboard } from '../services/api';
import './MemberDashboard.css';

interface MemberDashboardProps {
  data: MemberDashboard;
  navigate: any;
}

const MemberDashboardComponent: React.FC<MemberDashboardProps> = ({ data, navigate }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString();

  return (
    <div className="member-dashboard">
      {/* Statistics Cards */}
      <div className="member-stats-grid">
        <div className="member-stat-card active">
          <h3 className="active">Active Borrowings</h3>
          <div className="member-stat-value active">
            {data.active_borrowings?.length || 0}
          </div>
        </div>

        <div className="member-stat-card total">
          <h3 className="total">Total Borrowed</h3>
          <div className="member-stat-value total">
            {data.total_books_borrowed || 0}
          </div>
        </div>

        <div className={`member-stat-card overdue ${data.overdue_count > 0 ? 'has-overdue' : ''}`}>
          <h3 className={`overdue ${data.overdue_count > 0 ? 'has-overdue' : ''}`}>
            Overdue Books
          </h3>
          <div className={`member-stat-value overdue ${data.overdue_count > 0 ? 'has-overdue' : ''}`}>
            {data.overdue_count || 0}
          </div>
        </div>
      </div>

      <div className="member-content-grid">
        {/* Active Borrowings */}
        <div className="dashboard-card">
          <h3>Current Borrowings</h3>
          {data.active_borrowings && data.active_borrowings.length > 0 ? (
            <div className="active-borrowings-list">
              {data.active_borrowings.map((borrowing) => (
                <div 
                  key={borrowing.id}
                  className={`active-borrowing-item ${borrowing.is_overdue ? 'overdue' : ''}`}
                >
                  <div className="borrowing-book-title">
                    {borrowing.book.title}
                  </div>
                  <div className="borrowing-book-info">
                    by {borrowing.book.author} • {borrowing.book.genre}
                  </div>
                  <div className="borrowing-dates">
                    Borrowed: {formatDate(borrowing.borrowed_at)} • Due: {formatDate(borrowing.due_at)}
                  </div>
                  {borrowing.is_overdue && (
                    <div className="overdue-warning">
                      ⚠️ OVERDUE - Please return immediately
                    </div>
                  )}
                  {!borrowing.is_overdue && borrowing.days_until_due && (
                    <div className="due-reminder">
                      📅 {borrowing.days_until_due}
                    </div>
                  )}
                  <button
                    onClick={() => navigate(`/books/${borrowing.book.id}`)}
                    className="book-detail-btn"
                  >
                    View Book Details
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-borrowings">
              <p>You have no active borrowings</p>
              <button 
                onClick={() => navigate('/books')}
                className="browse-books-btn"
              >
                Browse Books
              </button>
            </div>
          )}
        </div>

        {/* Borrowing History */}
        <div className="dashboard-card">
          <h3>Recent Returns</h3>
          {data.borrowing_history && data.borrowing_history.length > 0 ? (
            <div className="history-list">
              {data.borrowing_history.slice(0, 5).map((borrowing) => (
                <div 
                  key={borrowing.id}
                  className="history-item"
                >
                  <div className="history-book-title">
                    {borrowing.book.title}
                  </div>
                  <div className="history-book-author">
                    by {borrowing.book.author}
                  </div>
                  <div className="history-dates">
                    Borrowed: {formatDate(borrowing.borrowed_at)} • 
                    Returned: {formatDate(borrowing.returned_at)}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-history">No borrowing history</p>
          )}
          <button 
            onClick={() => navigate('/borrowings')}
            className="member-card-button info"
          >
            View All Borrowings
          </button>
        </div>
      </div>
    </div>
  );
};

export default MemberDashboardComponent;