// src/services/api.ts
const API_BASE_URL = 'http://localhost:8000/api';

// Types for API responses
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'librarian' | 'member';
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  access_token: string;
  token_type: string;
}

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  isbn: string;
  total_copies: number;
  available_copies: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface Borrowing {
  id: number;
  book_id: number;
  user_id: number;
  borrowed_at: string;
  due_at: string;
  returned_at?: string;
  is_returned: boolean;
  is_overdue: boolean;
  days_until_due: string | null;
  created_at: string;
  updated_at: string;
  book: Book;
  user: User;
}

export interface LibrarianDashboard {
  total_books: number;
  total_members: number;
  total_borrowed_books: number;
  total_overdue_books: number;
  recent_borrowings: Array<{
    id: number;
    user: {
      id: number;
      name: string;
      email: string;
    };
    book: {
      id: number;
      title: string;
      author: string;
    };
    borrowed_at: string;
    due_at: string;
    is_overdue: boolean;
  }>;
  popular_books: Array<{
    id: number;
    title: string;
    author: string;
    borrowing_count: number;
  }>;
}

export interface MemberDashboard {
  active_borrowings: Array<{
    id: number;
    book: {
      id: number;
      title: string;
      author: string;
      genre: string;
    };
    borrowed_at: string;
    due_at: string;
    is_overdue: boolean;
    days_until_due: string | null;
  }>;
  borrowing_history: Array<{
    id: number;
    book: {
      id: number;
      title: string;
      author: string;
    };
    borrowed_at: string;
    returned_at: string;
  }>;
  total_books_borrowed: number;
  overdue_count: number;
}

// API Error class
export class ApiError extends Error {
  constructor(public status: number, message: string, public data?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(response.status, data.message || 'API request failed', data);
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(0, 'Network error occurred');
    }
  }

  private getAuthHeaders(token: string) {
    return {
      'Authorization': `Bearer ${token}`,
    };
  }

  // Authentication endpoints
  async login(email: string, password: string): Promise<AuthResponse> {
    return this.request<AuthResponse>('/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: 'librarian' | 'member';
  }): Promise<AuthResponse> {
    return this.request<AuthResponse>('/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(token: string): Promise<{ user: User }> {
    return this.request<{ user: User }>('/me', {
      headers: this.getAuthHeaders(token),
    });
  }

  async logout(token: string): Promise<{ message: string }> {
    return this.request<{ message: string }>('/logout', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
    });
  }

  // Books endpoints
  async getBooks(token: string, search?: string): Promise<ApiResponse<Book[]>> {
    const searchParam = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<ApiResponse<Book[]>>(`/books${searchParam}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async getBook(token: string, id: number): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>(`/books/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async createBook(
    token: string,
    bookData: {
      title: string;
      author: string;
      genre: string;
      isbn: string;
      total_copies: number;
    }
  ): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>('/books', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(bookData),
    });
  }

  async updateBook(
    token: string,
    id: number,
    bookData: {
      title: string;
      author: string;
      genre: string;
      isbn: string;
      total_copies: number;
    }
  ): Promise<ApiResponse<Book>> {
    return this.request<ApiResponse<Book>>(`/books/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify(bookData),
    });
  }

  async deleteBook(token: string, id: number): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/books/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(token),
    });
  }

  // Borrowings endpoints
  async getBorrowings(token: string): Promise<ApiResponse<Borrowing[]>> {
    return this.request<ApiResponse<Borrowing[]>>('/borrowings', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getBorrowing(token: string, id: number): Promise<ApiResponse<Borrowing>> {
    return this.request<ApiResponse<Borrowing>>(`/borrowings/${id}`, {
      headers: this.getAuthHeaders(token),
    });
  }

  async borrowBook(token: string, bookId: number): Promise<ApiResponse<Borrowing>> {
    return this.request<ApiResponse<Borrowing>>('/borrowings', {
      method: 'POST',
      headers: this.getAuthHeaders(token),
      body: JSON.stringify({ book_id: bookId }),
    });
  }

  async returnBook(token: string, id: number): Promise<ApiResponse<Borrowing>> {
    return this.request<ApiResponse<Borrowing>>(`/borrowings/${id}/return`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(token),
    });
  }

  // Dashboard endpoints
  async getLibrarianDashboard(token: string): Promise<ApiResponse<LibrarianDashboard>> {
    return this.request<ApiResponse<LibrarianDashboard>>('/dashboard/librarian', {
      headers: this.getAuthHeaders(token),
    });
  }

  async getMemberDashboard(token: string): Promise<ApiResponse<MemberDashboard>> {
    return this.request<ApiResponse<MemberDashboard>>('/dashboard/member', {
      headers: this.getAuthHeaders(token),
    });
  }
}

// Create and export API client instance
export const apiClient = new ApiClient(API_BASE_URL);

// Export specific API functions for easier importing
export const authApi = {
  login: apiClient.login.bind(apiClient),
  register: apiClient.register.bind(apiClient),
  getCurrentUser: apiClient.getCurrentUser.bind(apiClient),
  logout: apiClient.logout.bind(apiClient),
};

export const booksApi = {
  getBooks: apiClient.getBooks.bind(apiClient),
  getBook: apiClient.getBook.bind(apiClient),
  createBook: apiClient.createBook.bind(apiClient),
  updateBook: apiClient.updateBook.bind(apiClient),
  deleteBook: apiClient.deleteBook.bind(apiClient),
};

export const borrowingsApi = {
  getBorrowings: apiClient.getBorrowings.bind(apiClient),
  getBorrowing: apiClient.getBorrowing.bind(apiClient),
  borrowBook: apiClient.borrowBook.bind(apiClient),
  returnBook: apiClient.returnBook.bind(apiClient),
};

export const dashboardApi = {
  getLibrarianDashboard: apiClient.getLibrarianDashboard.bind(apiClient),
  getMemberDashboard: apiClient.getMemberDashboard.bind(apiClient),
};

export default apiClient;