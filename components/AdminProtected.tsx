import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface AdminProtectedProps {
  children: React.ReactNode;
}

const AdminProtected: React.FC<AdminProtectedProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAuthentication = async () => {
      const adminAuth = localStorage.getItem('adminAuthenticated');
      const token = localStorage.getItem('adminToken');

      if (!adminAuth || adminAuth !== 'true' || !token) {
        setIsAuthenticated(false);
        router.replace('/admin/login');
        return;
      }

      try {
        // Validate token with server
        const response = await fetch('/api/admin/auth', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();

        if (data.success) {
          setIsAuthenticated(true);
        } else {
          // Token invalid, clear auth and redirect
          localStorage.removeItem('adminAuthenticated');
          localStorage.removeItem('adminToken');
          setIsAuthenticated(false);
          router.replace('/admin/login');
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        localStorage.removeItem('adminAuthenticated');
        localStorage.removeItem('adminToken');
        setIsAuthenticated(false);
        router.replace('/admin/login');
      } finally {
        setIsValidating(false);
      }
    };

    checkAuthentication();
  }, [router]);

  // Show loading spinner while validating
  if (isValidating || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="admin-loading-spinner"></div>
          <p className="text-white mt-4">Validating admin access...</p>
        </div>
        
        <style jsx>{`
          .admin-loading-spinner {
            width: 40px;
            height: 40px;
            border: 3px solid rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            border-top-color: #8b5cf6;
            animation: spin 1s ease-in-out infinite;
            margin: 0 auto;
          }

          @keyframes spin {
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AdminProtected;