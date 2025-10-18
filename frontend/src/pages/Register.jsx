import React, {useState} from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
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

  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: data.role || "volunteer",
      });

      toast.success("🎉 Đăng ký thành công! Hãy đăng nhập để tiếp tục.");

      nav("/login")
    } catch (err) {
      // Xử lý lỗi rõ ràng 💡
      if (err.response) {
        const {status, data} = err.response;
        if (status === 400) {
            toast.warning(data.error || data.message || "Du lieu khong hop le!")
        } else if (status === 409) {
          // Xử lý lỗi trùng thông tin đăng ký
          if (data?.message?.includes("email")) {
            toast.warning("⚠️ Email đã được sử dụng!");
          } else if (data?.message?.includes("phone")) {
            toast.warning("⚠️ Số điện thoại đã được sử dụng!");
          } else {
            toast.warning(data.message || "⚠️ Tài khoản đã tồn tại!");
          }
        } else {
          toast.error(data.message || "Đăng ký thất bại. Vui lòng thử lại!");
        }
      } else {
        toast.error("Không thể kết nối đến máy chủ. Kiểm tra mạng hoặc CORS!");
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

              <TextField
                  fullWidth
                  type="password"
                  label="Mật khẩu"
                  {...register("password")}
                  error={!!errors.password}
                  helperText={errors.password?.message}
                  margin="normal"
              />

              <TextField
                  fullWidth
                  type="password"
                  label="Xác nhận mật khẩu"
                  {...register("confirmPassword")}
                  error={!!errors.confirmPassword}
                  helperText={errors.confirmPassword?.message}
                  margin="normal"
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
