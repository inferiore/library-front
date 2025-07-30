// src/services/mappers.ts

import { 
  LibrarianDashboard, 
  MemberDashboard, 
  ApiResponse, 
  Book, 
  Borrowing 
} from './api';

// ==========================================
// 1. MAPPERS/TRANSFORMERS DE DATOS
// ==========================================

/**
 * Transforma la respuesta del API en datos tipados seguros
 */
export const mapApiResponse = <T>(response: ApiResponse<T> | T): T => {
  // Si la respuesta tiene estructura ApiResponse, extraer los datos
  if (response && typeof response === 'object' && 'data' in response) {
    return (response as ApiResponse<T>).data as T;
  }
  
  // Si la respuesta ya son los datos directos
  return response as T;
};

/**
 * Mapper específico para datos del dashboard del bibliotecario
 */
export const mapLibrarianDashboard = (data: any): LibrarianDashboard => {
  return {
    total_books: Number(data.stats.total_books || 0),
    total_members: Number(data.stats.total_members || 0),
    total_borrowed_books: Number(data.stats.total_borrowed_books || 0),
    total_overdue_books: Number(data.stats.overdue_books || 0),
    recent_borrowings: (data.recent_borrowings || []).map((borrowing: any) => ({
      id: Number(borrowing.id),
      user: {
        id: Number(borrowing.user?.id || 0),
        name: String(borrowing.user?.name || ''),
        email: String(borrowing.user?.email || ''),
      },
      book: {
        id: Number(borrowing.book?.id || 0),
        title: String(borrowing.book?.title || ''),
        author: String(borrowing.book?.author || ''),
      },
      borrowed_at: String(borrowing.borrowed_at || ''),
      due_at: String(borrowing.due_at || ''),
      is_overdue: Boolean(borrowing.is_overdue),
    })),
    popular_books: (data.popular_books || []).map((book: any) => ({
      id: Number(book.id),
      title: String(book.title || ''),
      author: String(book.author || ''),
      borrowing_count: Number(book.borrowing_count || 0),
    })),
  };
};

/**
 * Mapper específico para datos del dashboard del miembro
 */
export const mapMemberDashboard = (data: any): MemberDashboard => {
  console.log('Mapping member dashboard data:', data);
  return {
    active_borrowings: (data.active_borrowings || []).map((borrowing: any) => ({
      id: Number(borrowing.id),
      book: {
        id: Number(borrowing.book?.id || 0),
        title: String(borrowing.book?.title || ''),
        author: String(borrowing.book?.author || ''),
        genre: String(borrowing.book?.genre || ''),
      },
      borrowed_at: String(borrowing.borrowed_at || ''),
      due_at: String(borrowing.due_at || ''),
      is_overdue: Boolean(borrowing.is_overdue),
      days_until_due: borrowing.days_until_due || null,
    })),
    borrowing_history: (data.borrowing_history || []).map((borrowing: any) => ({
      id: Number(borrowing.id),
      book: {
        id: Number(borrowing.book?.id || 0),
        title: String(borrowing.book?.title || ''),
        author: String(borrowing.book?.author || ''),
      },
      borrowed_at: String(borrowing.borrowed_at || ''),
      returned_at: String(borrowing.returned_at || ''),
    })),
    total_books_borrowed: Number(data.stats.total_books_borrowed || 0),
    overdue_count: Number(data.stats.overdue_count || 0),
  };
};

// ==========================================
// 2. VALIDADORES DE TIPOS (RUNTIME)
// ==========================================

/**
 * Valida si los datos tienen la estructura esperada del LibrarianDashboard
 */
export const isLibrarianDashboard = (data: any): data is LibrarianDashboard => {
  return (
    data &&
    typeof data === 'object' &&
    typeof data.total_books !== 'undefined' &&
    typeof data.total_members !== 'undefined' &&
    Array.isArray(data.recent_borrowings) &&
    Array.isArray(data.popular_books)
  );
};

/**
 * Valida si los datos tienen la estructura esperada del MemberDashboard
 */
export const isMemberDashboard = (data: any): data is MemberDashboard => {
  return (
    data &&
    typeof data === 'object' &&
    Array.isArray(data.active_borrowings) &&
    Array.isArray(data.borrowing_history) &&
    typeof data.total_books_borrowed !== 'undefined'
  );
};

// ==========================================
// 3. MAPPER GENÉRICO PARA LIBROS
// ==========================================

export const mapBook = (data: any): Book => {
  return {
    id: Number(data.id),
    title: String(data.title || ''),
    author: String(data.author || ''),
    genre: String(data.genre || ''),
    isbn: String(data.isbn || ''),
    total_copies: Number(data.total_copies || 0),
    available_copies: Number(data.available_copies || 0),
    is_available: Boolean(data.is_available),
    created_at: String(data.created_at || ''),
    updated_at: String(data.updated_at || ''),
  };
};

// ==========================================
// 4. HELPER PARA TRANSFORMACIÓN SEGURA DE FECHAS
// ==========================================

export const safeDate = (dateString: string | null | undefined): string => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? '' : dateString;
  } catch {
    return '';
  }
};

// ==========================================
// 5. MAPPER PRINCIPAL PARA DASHBOARD
// ==========================================

export const mapDashboardData = (
  data: any,
  userRole: 'librarian' | 'member'
): LibrarianDashboard | MemberDashboard => {
  try {
    // Extraer datos si vienen envueltos en ApiResponse
    const cleanData = mapApiResponse(data);
    
    if (userRole === 'librarian') {
      return mapLibrarianDashboard(cleanData);
    } else {
      return mapMemberDashboard(cleanData);
    }
  } catch (error) {
    console.error('Error mapping dashboard data:', error);
    
    // Retornar datos por defecto seguros
    if (userRole === 'librarian') {
      return {
        total_books: 0,
        total_members: 0,
        total_borrowed_books: 0,
        total_overdue_books: 0,
        recent_borrowings: [],
        popular_books: [],
      };
    } else {
      return {
        active_borrowings: [],
        borrowing_history: [],
        total_books_borrowed: 0,
        overdue_count: 0,
      };
    }
  }
};