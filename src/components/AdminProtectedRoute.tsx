import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const { token, status, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    // Debug logging to help diagnose access issues
    console.debug('[AdminProtectedRoute] Auth state:', {
        hasToken: !!token,
        status,
        userOrange: user?.orange,
        userRole: user?.role
    });

    // Check 1: Must be logged in
    if (!token || status === 'failed') {
        console.debug('[AdminProtectedRoute] Redirecting to login - no token or failed status');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check 2: Must have admin access (orange flag OR admin role)
    const hasAdminAccess = user?.orange === true || user?.role === 'admin';

    if (user && !hasAdminAccess) {
        console.debug('[AdminProtectedRoute] Redirecting to dashboard - no admin access');
        return <Navigate to="/dashboard" replace />;
    }

    // Allow access while loading or if user is null (will be checked again after profile loads)
    // This prevents redirect loops during initial load
    if (!user && status === 'loading') {
        console.debug('[AdminProtectedRoute] Loading state - showing children');
        return <>{children}</>;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
