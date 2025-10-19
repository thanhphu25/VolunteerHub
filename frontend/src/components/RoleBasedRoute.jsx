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

