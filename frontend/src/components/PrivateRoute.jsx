/**
 * PrivateRoute Component
 * Route guard that protects pages requiring authentication.
 * Redirects unauthenticated users to login page and shows loading spinner during auth check.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Content to render if user is authenticated
 * @returns {JSX.Element} Children if authenticated, loading spinner during check, or redirect to login
 */
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material";

export default function PrivateRoute({ children }) {
  const { token } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    setTimeout(() => setChecking(false), 300);
  }, []);

  if (checking) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center"
        minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
