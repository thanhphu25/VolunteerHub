import React, {useState} from "react";
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
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {useNavigate} from "react-router-dom";
import {useAuth} from "../context/AuthContext";
import authApi from "../api/authApi";
import axiosClient from "../api/axiosClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const {login} = useAuth();

  const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            console.log("payload:", { email, password });

            const res = await authApi.login({ email, password });

            // token may be in many shapes — be defensive
            const data = res?.data ?? res;
            const accessToken = data?.accessToken || data?.token || data?.access_token || null;
            const refreshToken = data?.refreshToken || data?.refresh_token || null;

            if (!accessToken) {
                throw new Error("Login succeeded but no access token returned");
            }

            // if your useAuth.login expects a token string:
            localStorage.setItem("accessToken", accessToken);
            await login(accessToken);

            // optionally store refresh token (see security note below)
            if (refreshToken) {
                // If you must store client-side (not recommended for refresh token):
                localStorage.setItem("refreshToken", refreshToken);
            }

            // set default Authorization header for axiosClient (so subsequent calls include token)
            // adjust if your axios client exposes a way to set default headers

            axiosClient.defaults.headers.common["Authorization"] = `Bearer ${accessToken}`;

            nav("/");
        } catch (err) {
            console.error("Login error full:", err);
            if (err.response) {
                console.error("status:", err.response.status);
                console.error("response data:", err.response.data);
                alert(err.response.data?.error || err.response.data?.message || JSON.stringify(err.response.data));
            } else {
                alert(err.message || "Login failed");
            }
        } finally {
            setLoading(false);
        }
    };

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
          <Avatar sx={{m: 1, bgcolor: "primary.main"}}>
            <LockOutlinedIcon/>
          </Avatar>
          <Typography component="h1" variant="h5">
            Đăng nhập
          </Typography>
          <Box component="form" onSubmit={submit} sx={{mt: 2, width: "100%"}}>
            <TextField
                fullWidth
                required
                margin="normal"
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
                fullWidth
                required
                margin="normal"
                label="Mật khẩu"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{mt: 3, mb: 2}}
                disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit"/>
                  : "Đăng nhập"}
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
