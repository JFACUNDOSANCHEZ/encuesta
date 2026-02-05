import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
    const token = sessionStorage.getItem('token');

    // Check if token exists and isn't just a placeholder string
    if (!token || token === 'undefined' || token === 'null') {
        console.warn('Access denied: Invalid or missing token.');
        sessionStorage.removeItem('token'); // Clear possible junk
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedRoute;
