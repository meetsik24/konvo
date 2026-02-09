import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface AdminProtectedRouteProps {
    children: React.ReactNode;
}

const AdminProtectedRoute: React.FC<AdminProtectedRouteProps> = ({ children }) => {
    const { token, status, user } = useSelector((state: RootState) => state.auth);
    const location = useLocation();

    if (!token || status === 'failed') {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (user && user.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return <>{children}</>;
};

export default AdminProtectedRoute;
