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

    // Check localStorage for orange admin flag (persisted during login)
    const isOrangeFromStorage = localStorage.getItem('isOrangeAdmin') === 'true';

    // Debug logging to help diagnose access issues
    console.debug('[AdminProtectedRoute] Auth state:', {
        hasToken: !!token,
        status,
        userOrange: user?.orange,
        userRole: user?.role,
        isOrangeFromStorage
    });

    // Check 1: Must be logged in
    if (!token || status === 'failed') {
        console.debug('[AdminProtectedRoute] Redirecting to login - no token or failed status');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check 2: Must have admin access (orange flag from state OR localStorage OR admin role)
    const hasAdminAccess = user?.orange === true || user?.role === 'admin' || isOrangeFromStorage;

    if (user && !hasAdminAccess) {
        console.debug('[AdminProtectedRoute] Redirecting to dashboard - no admin access');
        return <Navigate to="/dashboard" replace />;
    }

    // If no user yet but has orange flag in storage, allow access (user data loading)
    if (!user && isOrangeFromStorage) {
        console.debug('[AdminProtectedRoute] Allowing access - orange flag in storage');
        return <>{children}</>;
    }

    // Allow access while loading
    if (!user && status === 'loading') {
        console.debug('[AdminProtectedRoute] Loading state - showing children');
        return <>{children}</>;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
