/**
 * PrivateRoutes Component
 * Route wrapper that ensures only authenticated users can access protected routes.
 * Redirects unauthenticated users to the login page.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Content to render if user is authenticated
 * @returns {JSX.Element} Children if authenticated, or redirect to login page
 */
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function PrivateRoute({ children }) {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
