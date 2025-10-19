import React, {useEffect, useState} from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import {Box, CircularProgress} from "@mui/material";

export default function PrivateRoute({children}) {
  const {token} = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Giả sử sau này bạn muốn gọi API verify token
    setTimeout(() => setChecking(false), 300);
  }, []);

  if (checking) {
    return (
        <Box display="flex" justifyContent="center" alignItems="center"
             minHeight="50vh">
          <CircularProgress/>
        </Box>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace/>;
  }

  return children;
}
