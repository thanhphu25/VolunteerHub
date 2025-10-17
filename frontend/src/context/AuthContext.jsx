// src/context/AuthContext.jsx
import React, {createContext, useContext, useEffect, useState} from "react";

const AuthContext = createContext(null);

export function AuthProvider({children}) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem("token");
  };

  // Optional: auto logout nếu token hết hạn (tùy API)
  useEffect(() => {
    if (!token) {
      return;
    }
    // có thể thêm kiểm tra token validity ở đây
  }, [token]);

  return (
      <AuthContext.Provider value={{token, login, logout}}>
        {children}
      </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn("⚠️ useAuth() must be used within <AuthProvider>");
    return {
      token: null, login: () => {
      }, logout: () => {
      }
    }; // tránh crash
  }
  return ctx;
}
