import React, {useState} from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography
} from "@mui/material";
import {Visibility, VisibilityOff} from "@mui/icons-material";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import {toast} from "react-toastify";
import authApi from "../api/authApi";
import {useNavigate} from "react-router-dom";

// ✅ Schema validation
const schema = yup.object({
  fullName: yup.string().required("Vui lòng nhập tên của bạn"),
  email: yup
  .string()
  .email("Email không hợp lệ")
  .required("Email là bắt buộc"),
  phone: yup
  .string()
  .matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ")
  .required("Vui lòng nhập số điện thoại"),
  password: yup
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự")
  .required("Vui lòng nhập mật khẩu"),
  confirmPassword: yup
  .string()
  .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
  .required("Vui lòng nhập lại mật khẩu"),
  role: yup.string().oneOf(["volunteer", "organizer", "admin"]),
});

export default function Register() {
  const nav = useNavigate();
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({resolver: yupResolver(schema)});
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const toggleShowPassword = () => setShowPassword(s => !s);
  const toggleShowConfirmPassword = () => setShowConfirmPassword(s => !s);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.register({
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        password: data.password,
        role: data.role || "volunteer",
      });

      toast.success("Đăng ký thành công! Hãy đăng nhập để tiếp tục.");

      nav("/login")
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 400 || status === 409) {
        // đọc đúng key "error" hoặc "message"
        const errorMsg = data?.error || data?.message;

        if (errorMsg) {
          toast.warning(errorMsg);
        } else {
          toast.warning("Email hoặc số điện thoại đã được đăng ký!");
        }
      } else {
        toast.error("Lỗi không xác định. Vui lòng thử lại sau!");
      }
    } finally {
      setLoading(false);
    }

  };

  return (
      <Container component="main" maxWidth="sm">
        <Paper elevation={6} sx={{mt: 8, p: 4, borderRadius: 3}}>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Avatar sx={{m: 1, bgcolor: "primary.main"}}>
              <PersonAddAltIcon/>
            </Avatar>
            <Typography component="h1" variant="h5">
              Đăng ký tài khoản
            </Typography>

            <Box
                component="form"
                onSubmit={handleSubmit(onSubmit)}
                sx={{mt: 2, width: "100%"}}
            >
              <TextField
                  fullWidth
                  label="Họ và tên"
                  {...register("fullName")}
                  error={!!errors.fullName}
                  helperText={errors.fullName?.message}
                  margin="normal"
              />

              <TextField
                  fullWidth
                  label="Email"
                  {...register("email")}
                  error={!!errors.email}
                  helperText={errors.email?.message}
                  margin="normal"
              />

              <TextField
                  fullWidth
                  label="Số điện thoại"
                  {...register("phone")}
                  error={!!errors.phone}
                  helperText={errors.phone?.message}
                  margin="normal"
              />

              {/* Password */}
              <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  label="Mật khẩu"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  margin="normal"
                  sx={{
                    "& input::-ms-reveal, & input::-ms-clear": {display: "none"},
                    "& input::-webkit-textfield-decoration-container": {display: "none"},
                  }}
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                              onClick={toggleShowPassword}
                              edge="end"
                              aria-label={showPassword ? "Hide password"
                                  : "Show password"}
                              size="small"
                          >
                            {showPassword ? <VisibilityOff/> : <Visibility/>}
                          </IconButton>
                        </InputAdornment>
                    ),
                  }}
              />

              {/* Confirm Password */}
              <TextField
                  fullWidth
                  type={showConfirmPassword ? "text" : "password"}
                  label="Xác nhận mật khẩu"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  margin="normal"
                  sx={{
                    "& input::-ms-reveal, & input::-ms-clear": {display: "none"},
                    "& input::-webkit-textfield-decoration-container": {display: "none"},
                  }}
                  InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                              onClick={toggleShowConfirmPassword}
                              edge="end"
                              aria-label={
                                showConfirmPassword ? "Hide password"
                                    : "Show password"
                              }
                              size="small"
                          >
                            {showConfirmPassword ? <VisibilityOff/> :
                                <Visibility/>}
                          </IconButton>
                        </InputAdornment>
                    ),
                  }}
              />


              <TextField
                  select
                  fullWidth
                  label="Vai trò"
                  defaultValue="volunteer"
                  {...register("role")}
                  margin="normal"
              >
                <MenuItem value="volunteer">Tình nguyện viên</MenuItem>
                <MenuItem value="organizer">Người tổ chức</MenuItem>
                <MenuItem value="admin">Quản trị viên</MenuItem>
              </TextField>

              <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  sx={{mt: 3, mb: 2}}
                  disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit"/>
                    : "Đăng ký"}
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>
  );
}
