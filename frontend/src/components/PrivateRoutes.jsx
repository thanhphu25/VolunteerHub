import React from "react";
import {Navigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

export default function PrivateRoute({children}) {
  const {token} = useAuth();

  // Nếu chưa có token => redirect về trang đăng nhập
  if (!token) {
    return <Navigate to="/login" replace/>;
  }

  // Nếu có token => hiển thị nội dung được bảo vệ
  return children;
}
