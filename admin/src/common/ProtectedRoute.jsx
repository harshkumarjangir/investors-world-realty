import { Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

export default function ProtectedRoute({ children, permission }) {
  const { isAuthenticated, hasPermission } = useAuth();
  const token = localStorage.getItem('adminToken');

  // Not authenticated — redirect to login
  if (!token && !isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Permission check (optional)
  if (permission && !hasPermission(permission)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
          <p className="mt-2 text-gray-600">
            You do not have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return children;
}
