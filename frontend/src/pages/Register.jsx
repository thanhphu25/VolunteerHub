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
import {useLanguage} from "../context/LanguageContext";

export default function Register() {
  const nav = useNavigate();
  const {t, language} = useLanguage();
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const schema = yup.object({
    fullName: yup.string().required(language === "vi" ? "Vui lòng nhập tên của bạn" : "Please enter your name"),
    email: yup
      .string()
      .email(language === "vi" ? "Email không hợp lệ" : "Invalid email")
      .required(language === "vi" ? "Email là bắt buộc" : "Email is required"),
    phone: yup
      .string()
      .matches(/^[0-9]{9,11}$/, language === "vi" ? "Số điện thoại không hợp lệ" : "Invalid phone number")
      .required(language === "vi" ? "Vui lòng nhập số điện thoại" : "Please enter phone number"),
    password: yup
      .string()
      .min(8, language === "vi" ? "Mật khẩu tối thiểu 8 ký tự" : "Password must be at least 8 characters")
      .required(language === "vi" ? "Vui lòng nhập mật khẩu" : "Please enter password"),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], language === "vi" ? "Mật khẩu xác nhận không khớp" : "Passwords do not match")
      .required(language === "vi" ? "Vui lòng nhập lại mật khẩu" : "Please confirm password"),
    role: yup.string().oneOf(["volunteer", "organizer", "admin"]),
  });

  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({resolver: yupResolver(schema)});

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

      toast.success(language === "vi" ? "Đăng ký thành công! Hãy đăng nhập để tiếp tục." : "Registration successful! Please login to continue.");

      nav("/login")
    } catch (err) {
      const status = err.response?.status;
      const data = err.response?.data;

      if (status === 400 || status === 409) {
        const errorMsg = data?.error || data?.message;

        if (errorMsg) {
          toast.warning(errorMsg);
        } else {
          toast.warning(language === "vi" ? "Email hoặc số điện thoại đã được đăng ký!" : "Email or phone number already registered!");
        }
      } else {
        toast.error(language === "vi" ? "Lỗi không xác định. Vui lòng thử lại sau!" : "Unknown error. Please try again later!");
      }
    } finally {
      setLoading(false);
    }
  };

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
        <Container component="main" maxWidth="sm">
          <Paper
              elevation={0}
              sx={{
                mt: 4,
                p: 5,
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 8px 32px rgba(2, 136, 209, 0.1)",
              }}
          >
            <Box display="flex" flexDirection="column" alignItems="center">
              <Avatar sx={{m: 1, bgcolor: "primary.main", width: 64, height: 64}}>
                <PersonAddAltIcon sx={{fontSize: 32}}/>
              </Avatar>
              <Typography component="h1" variant="h4" fontWeight="bold" sx={{mt: 2, mb: 1}}>
                {t("auth.register.title")}
              </Typography>

              <Box
                  component="form"
                  onSubmit={handleSubmit(onSubmit)}
                  sx={{mt: 2, width: "100%"}}
              >
                <TextField
                    fullWidth
                    label={t("auth.register.fullName")}
                    {...register("fullName")}
                    error={!!errors.fullName}
                    helperText={errors.fullName?.message}
                    margin="normal"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                />

                <TextField
                    fullWidth
                    label={t("auth.register.email")}
                    {...register("email")}
                    error={!!errors.email}
                    helperText={errors.email?.message}
                    margin="normal"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                />

                <TextField
                    fullWidth
                    label={t("auth.register.phone")}
                    {...register("phone")}
                    error={!!errors.phone}
                    helperText={errors.phone?.message}
                    margin="normal"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                />

                <TextField
                    fullWidth
                    type={showPassword ? "text" : "password"}
                    label={t("auth.register.password")}
                    {...register("password")}
                    error={!!errors.password}
                    helperText={errors.password?.message}
                    margin="normal"
                    sx={{
                      "& input::-ms-reveal, & input::-ms-clear": {display: "none"},
                      "& input::-webkit-textfield-decoration-container": {display: "none"},
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                                onClick={toggleShowPassword}
                                edge="end"
                                aria-label={showPassword ? t("auth.register.hidePassword") : t("auth.register.showPassword")}
                                size="small"
                            >
                              {showPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                          </InputAdornment>
                      ),
                    }}
                />

                <TextField
                    fullWidth
                    type={showConfirmPassword ? "text" : "password"}
                    label={t("auth.register.confirmPassword")}
                    {...register("confirmPassword")}
                    error={!!errors.confirmPassword}
                    helperText={errors.confirmPassword?.message}
                    margin="normal"
                    sx={{
                      "& input::-ms-reveal, & input::-ms-clear": {display: "none"},
                      "& input::-webkit-textfield-decoration-container": {display: "none"},
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                    InputProps={{
                      endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                                onClick={toggleShowConfirmPassword}
                                edge="end"
                                aria-label={
                                  showConfirmPassword ? t("auth.register.hidePassword") : t("auth.register.showPassword")
                                }
                                size="small"
                            >
                              {showConfirmPassword ? <VisibilityOff/> : <Visibility/>}
                            </IconButton>
                          </InputAdornment>
                      ),
                    }}
                />

                <TextField
                    select
                    fullWidth
                    label={t("auth.register.role")}
                    defaultValue="volunteer"
                    {...register("role")}
                    margin="normal"
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                >
                  <MenuItem value="volunteer">{t("auth.register.volunteer")}</MenuItem>
                  <MenuItem value="organizer">{t("auth.register.organizer")}</MenuItem>
                  <MenuItem value="admin">{t("auth.register.admin")}</MenuItem>
                </TextField>

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
                  {loading ? <CircularProgress size={24} color="inherit"/> : t("auth.register.submit")}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
  );
}
