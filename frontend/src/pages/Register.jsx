/**
 * Register Page
 * User registration page with role selection (volunteer/organizer).
 * Includes form validation for email, password, phone, and role selection.
 * Provides password visibility toggle and confirmation field validation.
 *
 * @component
 * @returns {JSX.Element} Registration form page with responsive layout
 */
import React, { useState } from "react";
import {
  Box, Typography, TextField, Button, Link, Stack, MenuItem,
  InputAdornment, IconButton, Avatar, Fade,
  CssBaseline, useMediaQuery, useTheme
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authApi from "../api/authApi";
import { toast } from "react-toastify";
import {
  Visibility, VisibilityOff, PersonOutline, EmailOutlined,
  PhoneOutlined, LockOutlined, VolunteerActivism
} from "@mui/icons-material";
import heroImg from "../assets/hero.jpg";

/**
 * Yup validation schema for registration form fields
 * @type {yup.ObjectSchema}
 */
const registerSchema = yup.object().shape({
  fullName: yup.string().required("Họ tên là bắt buộc"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  phone: yup.string().matches(/^[0-9]{10}$/, "Số điện thoại phải có 10 chữ số"),
  password: yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Mật khẩu là bắt buộc"),
  confirmPassword: yup.string().oneOf([yup.ref('password'), null], "Mật khẩu không khớp").required("Xác nhận mật khẩu là bắt buộc"),
  role: yup.string().required("Vui lòng chọn vai trò"),
});

export default function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      role: "VOLUNTEER",
      password: "",
      confirmPassword: ""
    }
  });

  const onRegisterSubmit = async (data) => {
    try {
      const { confirmPassword, role, ...rest } = data;

      const submitData = {
        ...rest,
        role: role ? role.toLowerCase() : "volunteer"
      };

      console.log("Dữ liệu chuẩn hóa gửi đi:", submitData);

      await authApi.register(submitData);
      toast.success("Đăng ký thành công!");
      navigate("/login");
    } catch (err) {
      console.error("Chi tiết lỗi backend:", err.response?.data);
      const errorData = err.response?.data;

      if (errorData?.errors) {
        const firstErrorKey = Object.keys(errorData.errors)[0];
        const errorMessage = errorData.errors[firstErrorKey];
        toast.error(`${firstErrorKey}: ${errorMessage}`);
      } else {
        toast.error(errorData?.message || "Đăng ký thất bại");
      }
    }
  };

  const textFieldStyle = {
    "& .MuiOutlinedInput-root": {
      borderRadius: 2,
    },
    "& .MuiOutlinedInput-input": {
      padding: "14px 14px 14px 7px",
    },
    "& .MuiSelect-select": {
      padding: "14px 14px 14px 7px",
    },
    "& .MuiOutlinedInput-input:-webkit-autofill": {
      padding: "14px 14px 14px 7px !important",
      WebkitBoxShadow: "0 0 0 1000px #ffffff inset !important",
      WebkitTextFillColor: "#000000 !important",
      transition: "background-color 5000s ease-in-out 0s",
    }
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100vw', overflow: 'hidden' }}>
      <CssBaseline />

      { }
      <Box
        sx={{
          width: { xs: '100%', md: '550px' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: 'background.paper',
          p: 4,
          zIndex: 2,
          boxShadow: { md: '4px 0 20px rgba(0,0,0,0.1)' }
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 450 }}>
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}>
              <VolunteerActivism fontSize="large" />
            </Avatar>
            <Typography variant="h4" fontWeight="800" color="text.primary">Tạo tài khoản</Typography>
            <Typography variant="body1" color="text.secondary">Bắt đầu hành trình thiện nguyện ngay.</Typography>
          </Box>

          <form onSubmit={handleSubmit(onRegisterSubmit)}>
            <Stack spacing={2}>
              <TextField
                fullWidth label="Họ và tên" {...register("fullName")}
                error={!!errors.fullName} helperText={errors.fullName?.message}
                sx={textFieldStyle}
                InputProps={{ startAdornment: (<InputAdornment position="start"><PersonOutline color="action" /></InputAdornment>) }}
              />
              <TextField
                fullWidth label="Email" {...register("email")}
                error={!!errors.email} helperText={errors.email?.message}
                sx={textFieldStyle}
                InputProps={{ startAdornment: (<InputAdornment position="start"><EmailOutlined color="action" /></InputAdornment>) }}
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth label="Số điện thoại" {...register("phone")}
                  error={!!errors.phone} helperText={errors.phone?.message}
                  sx={textFieldStyle}
                  InputProps={{ startAdornment: (<InputAdornment position="start"><PhoneOutlined color="action" /></InputAdornment>) }}
                />
                <TextField
                  fullWidth select label="Vai trò" {...register("role")}
                  error={!!errors.role} helperText={errors.role?.message}
                  sx={textFieldStyle}
                  defaultValue="VOLUNTEER"
                >
                  <MenuItem value="VOLUNTEER">Tình nguyện viên</MenuItem>
                  <MenuItem value="ORGANIZER">Nhà tổ chức</MenuItem>
                </TextField>
              </Stack>
              <TextField
                fullWidth label="Mật khẩu" type={showPassword ? "text" : "password"} {...register("password")}
                error={!!errors.password} helperText={errors.password?.message}
                sx={{
                  ...textFieldStyle,
                  "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
                  "& input::-webkit-textfield-decoration-container": { display: "none" },
                }}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>),
                  endAdornment: (<InputAdornment position="end"><IconButton onClick={() => setShowPassword(!showPassword)} edge="end">{showPassword ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment>),
                }}
              />
              <TextField
                fullWidth label="Xác nhận mật khẩu" type="password" {...register("confirmPassword")}
                error={!!errors.confirmPassword} helperText={errors.confirmPassword?.message}
                sx={textFieldStyle}
                InputProps={{ startAdornment: (<InputAdornment position="start"><LockOutlined color="action" /></InputAdornment>) }}
              />

              <Button type="submit" fullWidth variant="contained" size="large" disabled={isSubmitting} sx={{ py: 1.5, mt: 1, borderRadius: 2, fontWeight: 'bold', fontSize: '1rem' }}>
                {isSubmitting ? "Đang xử lý..." : "Đăng Ký Tài Khoản"}
              </Button>
            </Stack>
          </form>

          <Box mt={3} textAlign="center">
            <Typography variant="body2">
              Đã có tài khoản? <Link component={RouterLink} to="/login" fontWeight="bold" underline="hover">Đăng nhập</Link>
            </Typography>
          </Box>
        </Box>
      </Box>

      { }
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            position: 'relative',
            bgcolor: 'teal',
          }}
        >
          <Box
            component="img"
            src={heroImg}
            sx={{
              width: '100%', height: '100%', objectFit: 'cover',
              position: 'absolute', top: 0, left: 0
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <Box
            sx={{
              position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
              background: 'linear-gradient(to top left, rgba(43, 122, 120, 0.9), rgba(58, 175, 169, 0.4))',
              display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
              p: 6, color: 'white'
            }}
          >
            <Fade in={true} timeout={1500}>
              <Box textAlign="center">
                <Typography variant="h3" fontWeight="800" gutterBottom>Gia nhập cộng đồng.</Typography>
                <Typography variant="h6" fontWeight="normal" sx={{ maxWidth: 500 }}>
                  "Mỗi người tình nguyện viên là một ngọn nến, cùng nhau chúng ta sẽ thắp sáng cả thế giới."
                </Typography>
              </Box>
            </Fade>
          </Box>
        </Box>
      )}
    </Box>
  );
}