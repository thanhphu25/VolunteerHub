/**
 * RoleBasedRoute Component
 * Advanced route guard that restricts access based on user role.
 * Redirects unauthenticated users to login and displays error alert for unauthorized access.
 * Supports volunteer, organizer, and admin roles.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Content to render if user has required role
 * @param {Array<string>} props.allowedRoles - Array of roles permitted to access this route
 * @returns {JSX.Element} Children if authorized, error alert if unauthorized, or redirect to login
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Alert, Container } from "@mui/material";

export default function RoleBasedRoute({ children, allowedRoles }) {
  const { token, user } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (!user || !allowedRoles.includes(user.role)) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">
          Bạn không có quyền truy cập trang này.
        </Alert>
      </Container>
    );
  }

  return children;
}

