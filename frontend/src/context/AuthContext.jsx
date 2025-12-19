// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import authApi from "../api/authApi"; // <--- THÊM IMPORT NÀY

const AuthContext = createContext(null);

// ✅ Helper: Decode JWT safely (Giữ nguyên)
function decodeJWT(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split("")
                .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
                .join("")
        );
        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error("Failed to decode JWT:", error);
        return null;
    }
}

export function AuthProvider({ children }) {
    // ✅ Consistent key name: accessToken
    const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
    const [user, setUser] = useState(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
            const decoded = decodeJWT(storedToken);
            return decoded
                ? {
                    id: decoded.userId || decoded.sub,
                    email: decoded.email || decoded.sub,
                    // Fix: Chuyển role về chữ thường để khớp với logic check
                    role: (decoded.role || decoded.authorities?.[0]?.replace("ROLE_", ""))?.toLowerCase(),
                }
                : null;
        }
        return null;
    });

    // ✅ Update axiosClient header whenever token changes
    useEffect(() => {
        if (token) {
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axiosClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    // ✅ SỬA LẠI HÀM LOGIN: Nhận email/password, gọi API, rồi mới setToken
    const login = async (email, password) => {
        // 1. Gọi API lấy token từ Backend
        const res = await authApi.login({ email, password });
        const newToken = res.data.accessToken; // Lấy accessToken từ response backend

        // 2. Lưu token và giải mã user như logic cũ
        setToken(newToken);
        localStorage.setItem("accessToken", newToken);
        
        const decoded = decodeJWT(newToken);
        if (decoded) {
            setUser({
                id: decoded.userId || decoded.sub,
                email: decoded.email || decoded.sub,
                // Fix: Đảm bảo role luôn là chữ thường (backend trả về ORGANIZER -> organizer)
                role: (decoded.role || decoded.authorities?.[0]?.replace("ROLE_", ""))?.toLowerCase(),
            });
        }
        return res;
    };

    // ✅ Logout clears everything
    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        delete axiosClient.defaults.headers.common["Authorization"];
        // Thêm chuyển hướng để reset sạch sẽ
        window.location.href = '/login';
    };

    // ✅ Helpers (Giữ nguyên logic kiểm tra)
    const isAdmin = () => user?.role === "admin";
    const isOrganizer = () => user?.role === "organizer";

    return (
        <AuthContext.Provider
            value={{ token, user, login, logout, isAdmin, isOrganizer }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ✅ Safe hook usage wrapper
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        console.warn("⚠️ useAuth() must be used within <AuthProvider>");
        return {
            token: null,
            user: null,
            login: () => {},
            logout: () => {},
            isAdmin: () => false,
            isOrganizer: () => false,
        };
    }
    return ctx;
}