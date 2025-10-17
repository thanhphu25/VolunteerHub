import React from "react";
import {
  AppBar,
  Box,
  Button,
  IconButton,
  Toolbar,
  Typography,
} from "@mui/material";
import {Link, useNavigate} from "react-router-dom";
import {Brightness4, Brightness7} from "@mui/icons-material";
import {useTheme} from "@mui/material/styles";
import {useThemeMode} from "../context/ThemeContext";
import {useAuth} from "../context/AuthContext";

export default function NavBar() {
  const theme = useTheme();
  const {toggleColorMode} = useThemeMode();
  const {token, logout} = useAuth(); // 👈 token từ context xác định login chưa
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
      <AppBar position="static" color="primary">
        <Toolbar sx={{display: "flex", justifyContent: "space-between"}}>
          {/* Logo / Tên ứng dụng */}
          <Typography
              variant="h6"
              component={Link}
              to="/"
              sx={{
                color: "inherit",
                textDecoration: "none",
                fontWeight: 600,
              }}
          >
            Volunteer Hub
          </Typography>

          {/* Menu bên phải */}
          <Box>
            <Button color="inherit" component={Link} to="/">
              Trang chủ
            </Button>
            <Button color="inherit" component={Link} to="/events">
              Sự kiện
            </Button>

            {/* Nếu chưa login => hiện Login / Register */}
            {!token ? (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Đăng nhập
                  </Button>
                  <Button
                      color="secondary"
                      variant="outlined"
                      component={Link}
                      to="/register"
                      sx={{ml: 1}}
                  >
                    Đăng ký
                  </Button>
                </>
            ) : (
                <>
                  <Button color="inherit" component={Link} to="/dashboard">
                    Bảng điều khiển
                  </Button>
                  <Button
                      color="inherit"
                      onClick={handleLogout}
                      sx={{ml: 1, textTransform: "none"}}
                  >
                    Đăng xuất
                  </Button>
                </>
            )}

            {/* Nút Dark / Light mode toggle 🌙 */}
            <IconButton
                sx={{ml: 2}}
                color="inherit"
                onClick={toggleColorMode}
                title="Chuyển giao diện sáng / tối"
            >
              {theme.palette.mode === "dark" ? <Brightness7/> : <Brightness4/>}
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
  );
}
