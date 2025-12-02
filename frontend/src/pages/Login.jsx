import React, { useState } from "react";
import {
    Avatar,
    Box,
    Button,
    CircularProgress,
    Container,
    IconButton,
    InputAdornment,
    Link,
    Paper,
    TextField,
    Typography
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../context/LanguageContext";
import authApi from "../api/authApi";
import axiosClient from "../api/axiosClient";
import { registerAndSubscribe } from "../api/push";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const nav = useNavigate();
    const { login } = useAuth();
    const { t } = useLanguage();

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

            localStorage.setItem("accessToken", accessToken);
            if (refreshToken) {
                localStorage.setItem("refreshToken", refreshToken);
            }

            await login(accessToken);
            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            registerAndSubscribe(accessToken)
                .then(() => {
                    console.log("Subscribed to push successfully");
                })
                .catch((err) => {
                    console.warn("Push subscribe error", err);
                });

            nav("/");
        } catch (err) {
            console.error("Login error:", err);
            if (err.response) {
                const msg = err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data);
                alert(msg);
            } else {
                alert(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((s) => !s);
    const handleMouseDownPassword = (event) => event.preventDefault();

    return (
        <Box
            sx={{
                minHeight: "calc(100vh - 64px)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "linear-gradient(135deg, #f8fafc 0%, #e3f2fd 100%)",
                py: 4,
            }}
        >
            <Container component="main" maxWidth="xs">
                <Paper
                    elevation={0}
                    sx={{
                        p: 5,
                        borderRadius: 4,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 8px 32px rgba(2, 136, 209, 0.1)",
                    }}
                >
                    <Avatar
                        sx={{
                            m: 1,
                            bgcolor: "primary.main",
                            width: 64,
                            height: 64,
                        }}
                    >
                        <LockOutlinedIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Typography component="h1" variant="h4" fontWeight="bold" sx={{ mt: 2, mb: 1 }}>
                        {t("auth.login.title")}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        {t("auth.login.noAccount")}{" "}
                        <Link
                            component="button"
                            onClick={() => nav("/register")}
                            sx={{
                                color: "primary.main",
                                fontWeight: 600,
                                textDecoration: "none",
                                "&:hover": { textDecoration: "underline" },
                            }}
                        >
                            {t("auth.login.register")}
                        </Link>
                    </Typography>

                    <Box component="form" onSubmit={submit} sx={{ mt: 2, width: "100%" }} autoComplete="off">
                        <TextField
                            name="email"
                            label={t("auth.login.email")}
                            margin="normal"
                            fullWidth
                            required
                            autoComplete="username"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            sx={{
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                        />

                        <TextField
                            name="password"
                            label={t("auth.login.password")}
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
                            sx={{
                                "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
                                "& input::-webkit-textfield-decoration-container": { display: "none" },
                                "& .MuiOutlinedInput-root": {
                                    borderRadius: 2,
                                },
                            }}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label={showPassword ? t("auth.login.hidePassword") : t("auth.login.showPassword")}
                                            onClick={handleClickShowPassword}
                                            onMouseDown={handleMouseDownPassword}
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
                            size="large"
                            sx={{
                                mt: 4,
                                mb: 2,
                                py: 1.5,
                                borderRadius: 2,
                                fontSize: "1rem",
                                fontWeight: 600,
                                textTransform: "none",
                                boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
                                "&:hover": {
                                    boxShadow: "0 6px 16px rgba(2, 136, 209, 0.4)",
                                    transform: "translateY(-1px)",
                                },
                                transition: "all 0.3s ease",
                            }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} color="inherit" /> : t("auth.login.submit")}
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
}
