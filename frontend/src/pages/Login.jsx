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

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();
  const login = useAuth();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.login({email, password});
      const token = res.data.accessToken || res.data.token || res.data;
      if (!token) {
        throw new Error("No token returned");
      }
      login(token);
      nav("/dashboard");
    } catch (err) {
      alert(err.response?.data || err.message || "Login failed");
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
