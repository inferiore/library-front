// FILE: store.ts
import { create } from 'zustand';

interface Book {
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

interface Borrowing {
  id: number;
  book_id: number;
  user_id: number;
  borrowed_at: string;
  due_at: string;
  returned_at?: string;
  book: Book;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  role: 'librarian' | 'member';
}

interface AppState {
  books: Book[];
  borrowings: Borrowing[];
  user: User | null;
  isLoading: boolean;
  setBooks: (books: Book[]) => void;
  addBook: (book: Book) => void;
  updateBook: (bookId: number, book: Partial<Book>) => void;
  removeBook: (bookId: number) => void;
  setBorrowings: (borrowings: Borrowing[]) => void;
  addBorrowing: (borrowing: Borrowing) => void;
  updateBorrowing: (borrowingId: number, borrowing: Partial<Borrowing>) => void;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
}

const getUserFromLocalStorage = (): User | null => {
  const userData = localStorage.getItem('user');
  return userData ? JSON.parse(userData) : null;
};

const useStore = create<AppState>((set) => ({
  books: [],
  borrowings: [],
  user: getUserFromLocalStorage(),
  isLoading: false,
  setBooks: (books) =>
    set(() => ({
      books,
    })),
  addBook: (book) =>
    set((state) => ({
      books: [...state.books, book],
    })),
  updateBook: (bookId, updatedBook) =>
    set((state) => ({
      books: state.books.map((book) =>
        book.id === bookId ? { ...book, ...updatedBook } : book
      ),
    })),
  removeBook: (bookId) =>
    set((state) => ({
      books: state.books.filter((book) => book.id !== bookId),
    })),
  setBorrowings: (borrowings) =>
    set(() => ({
      borrowings,
    })),
  addBorrowing: (borrowing) =>
    set((state) => ({
      borrowings: [...state.borrowings, borrowing],
    })),
  updateBorrowing: (borrowingId, updatedBorrowing) =>
    set((state) => ({
      borrowings: state.borrowings.map((borrowing) =>
        borrowing.id === borrowingId ? { ...borrowing, ...updatedBorrowing } : borrowing
      ),
    })),
  setUser: (user) =>
    set(() => {
      localStorage.setItem('user', JSON.stringify(user));
      return { user };
    }),
  clearUser: () =>
    set(() => {
      localStorage.removeItem('user');
      return { user: null };
    }),
  setLoading: (loading) =>
    set(() => ({
      isLoading: loading,
    })),
}));

export default useStore;