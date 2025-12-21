/**
 * Login Page
 * User authentication page with email and password login form.
 * Includes form validation, remember-me checkbox, and password visibility toggle.
 * Redirects authenticated users to home page.
 *
 * @component
 * @returns {JSX.Element} Login form page with responsive layout
 */
import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Link, Stack,
  InputAdornment, IconButton, Checkbox, FormControlLabel, Fade,
  CssBaseline, useMediaQuery, useTheme
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import {
  Visibility, VisibilityOff, EmailOutlined, LockOutlined
} from "@mui/icons-material";
import heroImg from "../assets/hero.png";

/**
 * Yup validation schema for login form fields
 * @type {yup.ObjectSchema}
 */
const loginSchema = yup.object().shape({
  email: yup.string().email("Email không hợp lệ").required("Vui lòng nhập email"),
  password: yup.string().required("Vui lòng nhập mật khẩu"),
});

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(loginSchema)
  });

  const onLoginSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      toast.success("Chào mừng bạn quay trở lại!");
      navigate("/");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đăng nhập thất bại");
    }
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 14px 14px 7px",
    },
    "& .MuiOutlinedInput-input:-webkit-autofill": {
      padding: "14px 14px 14px 0px !important",
      WebkitBoxShadow: "0 0 0 1000px #ffffff inset !important",
      WebkitTextFillColor: "#000000 !important",
      transition: "background-color 5000s ease-in-out 0s",
    }
  };

  return (
    <Box sx={{ display: 'flex', height: { md: 'calc(100vh - 64px)', xs: 'auto' }, minHeight: { xs: '100vh', md: '0' }, width: '100vw', overflow: 'hidden' }}>
      <CssBaseline />

      { }
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: 'grey.900',
          }}
        >
          <Box
            component="img"
            src={heroImg}
            alt="Background"
            sx={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', top: 0, left: 0, zIndex: 0
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />

          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to bottom right, rgba(0,0,0,0.4), rgba(0,0,0,0.8))',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              p: 6, zIndex: 1, color: 'white'
            }}
          >
            <Fade in={true} timeout={1000}>
              <Box>
                <Typography variant="h3" fontWeight="800" gutterBottom sx={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                  Kết nối trái tim,<br />Lan tỏa yêu thương.
                </Typography>
                <Typography variant="h6" fontWeight="normal" sx={{ maxWidth: 600, opacity: 0.9 }}>
                  Tham gia cùng hàng ngàn tình nguyện viên tạo nên sự thay đổi tích cực cho cộng đồng ngay hôm nay.
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Box>
      )}

      { }
      <Box
        sx={{
          width: { xs: '100%', md: '480px' },
          display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
          bgcolor: 'background.paper', p: 4,
          boxShadow: { md: '-4px 0 20px rgba(0,0,0,0.1)' },
          zIndex: 2,
          overflowY: 'auto'
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 400 }}>
          <Box mb={3} textAlign="center">
            <Typography variant="h4" fontWeight="800" color="primary" gutterBottom>Đăng Nhập</Typography>
            <Typography variant="body1" color="text.secondary">
              Nhập thông tin chi tiết để truy cập tài khoản
            </Typography>
          </Box>

          <form onSubmit={handleSubmit(onLoginSubmit)}>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Email"
                placeholder="example@mail.com"
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
                sx={textFieldStyle}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><EmailOutlined color="action" /></InputAdornment>),
                }}
              />

              <Box>
                <TextField
                  fullWidth
                  label="Mật khẩu"
                  type={showPassword ? "text" : "password"}
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  sx={textFieldStyle}
                  InputProps={{
                    startAdornment: (<InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                <Box display="flex" justifyContent="space-between" alignItems="center" mt={1}>
                  <FormControlLabel control={<Checkbox size="small" />} label={<Typography variant="body2">Ghi nhớ tôi</Typography>} />
                  <Link component={RouterLink} to="#" variant="body2" fontWeight="600" underline="hover">Quên mật khẩu?</Link>
                </Box>
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={isSubmitting}
                sx={{
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  boxShadow: 2
                }}
              >
                {isSubmitting ? "Đang xử lý..." : "Đăng Nhập"}
              </Button>
            </Stack>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="body2" color="text.secondary">
              Chưa có tài khoản? <Link component={RouterLink} to="/register" fontWeight="bold" underline="hover">Đăng ký ngay</Link>
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}