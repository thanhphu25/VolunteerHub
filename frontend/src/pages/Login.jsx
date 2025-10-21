import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    Link,
    Paper,
    TextField,
    Typography,
    InputAdornment,
    IconButton
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import authApi from "../api/authApi";
import axiosClient from "../api/axiosClient";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const nav = useNavigate();
    const { login } = useAuth();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await authApi.login({ email, password });
            const data = res?.data ?? res;
            const accessToken = data?.accessToken || data?.token || data?.access_token || null;
            const refreshToken = data?.refreshToken || data?.refresh_token || null;

            if (!accessToken) {
                throw new Error("Login succeeded but server did not return an access token.");
            }

            // store access token (dev/demo). In production prefer httpOnly cookie for refresh token.
            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) localStorage.setItem("refreshToken", refreshToken);

            // update auth context (assumes useAuth.login accepts an access token or similar)
            await login(accessToken);

            // set axios default header so subsequent calls include token
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            nav("/");
        } catch (err) {
            console.error("Login error:", err);
            if (err.response) {
                alert(err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data));
            } else {
                alert(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((s) => !s);
    const handleMouseDownPassword = (event) => event.preventDefault(); // important to keep input focused

    return (
        <Container component="main" maxWidth="xs">
            <Paper
                elevation={6}
                sx={{
                    mt: 8,
                    p: 4,
                    borderRadius: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center"
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: "primary.main" }}>
                    <LockOutlinedIcon />
                </Avatar>
                <Typography component="h1" variant="h5">
                    Đăng nhập
                </Typography>

                {/* Disable form autocomplete to reduce browser reveal icon */}
                <Box component="form" onSubmit={submit} sx={{ mt: 2, width: "100%" }} autoComplete="off">
                    <TextField
                        name="email"
                        label="Email"
                        margin="normal"
                        fullWidth
                        required
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* password field: use autoComplete="new-password" + data-lpignore to reduce browser/extension reveal icon */}
                    {/* password field: ... */}
                    <TextField
                        name="password"
                        label="Mật khẩu"
                        margin="normal"
                        fullWidth
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="new-password"
                        inputProps={{
                            "data-lpignore": "true"
                        }}

                        // ========= THÊM KHỐI sx NÀY VÀO =========
                        sx={{
                            // Ẩn biểu tượng con mắt mặc định của trình duyệt WebKit (Chrome, Safari, Edge mới)
                            '& input[type="password"]::-webkit-reveal, & input[type="password"]::-webkit-password-reveal-button': {
                                display: 'none !important', // Ẩn biểu tượng
                                appearance: 'none',
                                WebkitAppearance: 'none', // Đảm bảo ghi đè style của WebKit
                                MozAppearance: 'none', // Đảm bảo ghi đè style của Firefox (dù Firefox không có icon này)
                            },
                            // Ẩn biểu tượng con mắt mặc định của trình duyệt Edge cũ (IE)
                            '& input[type="password"]::-ms-reveal': {
                                display: 'none !important', // Ẩn biểu tượng
                                appearance: 'none',
                            }
                        }}
                        // ===========================================

                        InputProps={{ // Giữ nguyên InputProps của bạn
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                                        onClick={handleClickShowPassword}
                                        onMouseDown={handleMouseDownPassword} // prevents the input from losing focus
                                        edge="end"
                                    >
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>
                            )
                        }}
                    />

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
                    </Button>

                    <Typography variant="body2" align="center">
                        Chưa có tài khoản?{" "}
                        <Link component="button" onClick={() => nav("/register")}>
                            Đăng ký ngay
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
}
