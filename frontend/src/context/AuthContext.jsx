import React, { createContext, useContext, useEffect, useState } from "react";
import axiosClient from "../api/axiosClient";
import authApi from "../api/authApi";

const AuthContext = createContext(null);

/**
 * Decodes a JWT token to extract payload information
 * @param {string} token - JWT token to decode
 * @returns {Object|null} Decoded token payload or null if decoding fails
 */
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

/**
 * AuthProvider Component
 * Provides authentication context to the entire application.
 * Manages login/logout, JWT tokens, and user information.
 * Automatically restores authentication state from localStorage on app startup.
 *
 * @component
 * @param {Object} props - Component props
 * @param {JSX.Element} props.children - Child components to provide auth context to
 * @returns {JSX.Element} Context provider wrapping children
 */
export function AuthProvider({ children }) {
    const [token, setToken] = useState(() => localStorage.getItem("accessToken"));
    const [user, setUser] = useState(() => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
            const decoded = decodeJWT(storedToken);
            return decoded
                ? {
                    id: decoded.userId || decoded.sub,
                    email: decoded.email || decoded.sub,
                    role: (decoded.role || decoded.authorities?.[0]?.replace("ROLE_", ""))?.toLowerCase(),
                }
                : null;
        }
        return null;
    });

    useEffect(() => {
        if (token) {
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        } else {
            delete axiosClient.defaults.headers.common["Authorization"];
        }
    }, [token]);

    const login = async (email, password) => {
        const res = await authApi.login({ email, password });
        const newToken = res.data.accessToken;

        setToken(newToken);
        localStorage.setItem("accessToken", newToken);

        const decoded = decodeJWT(newToken);
        if (decoded) {
            setUser({
                id: decoded.userId || decoded.sub,
                email: decoded.email || decoded.sub,
                role: (decoded.role || decoded.authorities?.[0]?.replace("ROLE_", ""))?.toLowerCase(),
            });
        }
        return res;
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        localStorage.removeItem("accessToken");
        delete axiosClient.defaults.headers.common["Authorization"];
        window.location.href = '/login';
    };

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

/**
 * useAuth Hook
 * Custom React hook to access authentication context.
 * Provides authentication state and functions for login/logout operations.
 * Returns default values if hook is used outside of AuthProvider.
 *
 * @hook
 * @returns {Object} Auth context with token, user, login, logout, isAdmin, isOrganizer
 * @returns {string|null} return.token - Current access token for authenticated requests
 * @returns {Object|null} return.user - Current user object with id, email, and role
 * @returns {Function} return.login - Function to authenticate user with email and password
 * @returns {Function} return.logout - Function to clear authentication and redirect to login
 * @returns {Function} return.isAdmin - Function that returns true if user role is admin
 * @returns {Function} return.isOrganizer - Function that returns true if user role is organizer
 */
export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) {
        console.warn("⚠️ useAuth() must be used within <AuthProvider>");
        return {
            token: null,
            user: null,
            login: () => { },
            logout: () => { },
            isAdmin: () => false,
            isOrganizer: () => false,
        };
    }
    return ctx;
}