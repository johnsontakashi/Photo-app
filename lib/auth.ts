import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import jwt from 'jsonwebtoken';

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Custom hook for authentication
export const useAuth = (): AuthState & {
  login: (token: string, user: User) => void;
  logout: () => void;
} => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  const router = useRouter();

  useEffect(() => {
    // Check for existing token on mount
    const token = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (token && userData) {
      try {
        const user: User = JSON.parse(userData);
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('userToken');
        localStorage.removeItem('userData');
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    } else {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('userToken', token);
    localStorage.setItem('userData', JSON.stringify(user));
    setAuthState({
      user,
      isAuthenticated: true,
      isLoading: false,
    });
  };

  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userData');
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    router.push('/auth/login');
  };

  return {
    ...authState,
    login,
    logout,
  };
};

// Higher-order component to protect routes (simplified for TypeScript compatibility)
export const withAuth = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
  const AuthenticatedComponent = (props: P) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !isAuthenticated) {
        router.push('/auth/login');
      }
    }, [isAuthenticated, isLoading, router]);

    // Let _app.tsx handle loading states
    if (!isAuthenticated) {
      return null; // Will redirect via useEffect
    }

    return React.createElement(WrappedComponent, props);
  };

  AuthenticatedComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name})`;
  
  return AuthenticatedComponent;
};

// API route middleware for authentication
export const verifyToken = (token: string): User | null => {
  try {
    const JWT_SECRET = process.env.JWT_SECRET || 'photoai-pro-jwt-secret-key-change-in-production';
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      iat: number;
      exp: number;
    };

    return {
      id: decoded.userId,
      email: decoded.email,
    };
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Check if current route should be protected
export const isProtectedRoute = (pathname: string): boolean => {
  const publicRoutes = ['/auth/login', '/auth/register'];
  const adminRoutes = ['/admin/login'];
  
  // Allow admin routes and public auth routes
  if (adminRoutes.includes(pathname) || publicRoutes.includes(pathname)) {
    return false;
  }
  
  // All other routes require authentication
  return true;
};