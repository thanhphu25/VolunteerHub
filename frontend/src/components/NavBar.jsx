import React from 'react';
// 1. Import Link as RouterLink và useNavigate từ react-router-dom
import {Link as RouterLink, Link, useNavigate} from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  Tooltip,
  Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {useAuth} from '../context/AuthContext';
import {useThemeMode} from '../context/ThemeContext';
import authApi from '../api/authApi';
import {toast} from 'react-toastify';

const pages = [
  {name: 'Trang chủ', path: '/'},
  {name: 'Sự kiện', path: '/events'},
];

const volunteerPages = [
  {name: 'Đăng ký của tôi', path: '/my-registrations'},
];

const organizerPages = [
  {name: 'Quản lý sự kiện', path: '/organizer/events'},
];
const adminPages = [
  {name: 'Duyệt sự kiện', path: '/admin/events'},
  {name: 'Quản lý User', path: '/admin/users'}
];

function NavBar() {
  const {user, logout, loading} = useAuth();
  const navigate = useNavigate();
  const {mode, toggleColorMode} = useThemeMode();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      const refreshToken = localStorage.getItem('vh_refreshToken');
      if (refreshToken) {
        await authApi.logout({refreshToken});
      }
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      logout();
      localStorage.removeItem('vh_refreshToken');
      toast.info("Bạn đã đăng xuất.");
      navigate('/');
    }
  };

  let roleSpecificPages = [];
  if (user?.role === 'volunteer') {
    roleSpecificPages = volunteerPages;
  } else if (user?.role === 'organizer') {
    roleSpecificPages = organizerPages;
  } else if (user?.role === 'admin') {
    roleSpecificPages = [...organizerPages, ...adminPages];
  }

  return (
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* Logo */}
            <Typography
                variant="h6"
                noWrap
                component={RouterLink} // Sử dụng RouterLink
                to="/"
                sx={{
                  mr: 2,
                  display: {xs: 'none', md: 'flex'},
                  fontWeight: 700,
                  letterSpacing: '.1rem',
                  color: 'inherit',
                  textDecoration: 'none',
                }}
            >
              🌿 VolunteerHub
            </Typography>

            {/* Mobile Menu Icon */}
            <Box sx={{flexGrow: 1, display: {xs: 'flex', md: 'none'}}}>
              <IconButton size="large" onClick={handleOpenNavMenu}
                          color="inherit">
                <MenuIcon/>
              </IconButton>
              <Menu
                  anchorEl={anchorElNav}
                  anchorOrigin={{vertical: 'bottom', horizontal: 'left'}}
                  keepMounted
                  transformOrigin={{vertical: 'top', horizontal: 'left'}}
                  open={Boolean(anchorElNav)}
                  onClose={handleCloseNavMenu}
                  sx={{display: {xs: 'block', md: 'none'}}}
              >
                {[...pages, ...roleSpecificPages].map((page) => (
                    <MenuItem key={page.name} onClick={handleCloseNavMenu}
                              component={RouterLink}
                              to={page.path}> {/* Sử dụng RouterLink */}
                      <Typography textAlign="center">{page.name}</Typography>
                    </MenuItem>
                ))}
              </Menu>
            </Box>

            {/* Mobile Logo */}
            <Typography
                variant="h5"
                noWrap
                component={RouterLink}
                to="/"
                sx={{
                  mr: 2,
                  display: {xs: 'flex', md: 'none'},
                  flexGrow: 1,
                  fontWeight: 700,
                  color: 'inherit',
                  textDecoration: 'none',
                }}
            >
              🌿 VH
            </Typography>

            {/* Desktop Menu */}
            <Box sx={{flexGrow: 1, display: {xs: 'none', md: 'flex'}}}>
              {pages.map((page) => (
                  <Button
                      key={page.name}
                      component={RouterLink} // Sử dụng RouterLink
                      to={page.path}
                      sx={{my: 2, color: 'white', display: 'block'}}
                  >
                    {page.name}
                  </Button>
              ))}
              {roleSpecificPages.map((page) => (
                  <Button
                      key={page.name}
                      component={RouterLink} // Sử dụng RouterLink
                      to={page.path}
                      sx={{my: 2, color: 'white', display: 'block'}}
                  >
                    {page.name}
                  </Button>
              ))}
            </Box>

            {/* Theme Toggle & User Menu */}
            <Box sx={{flexGrow: 0, display: 'flex', alignItems: 'center'}}>
              {/* Theme toggle */}
              <Tooltip title={mode === 'dark' ? 'Chế độ sáng' : 'Chế độ tối'}>
                <IconButton sx={{ml: 1}} onClick={toggleColorMode}
                            color="inherit">
                  {mode === 'dark' ? <Brightness7Icon/> : <Brightness4Icon/>}
                </IconButton>
              </Tooltip>

              {loading ? (
                  <CircularProgress size={24} color="inherit" sx={{ml: 1}}/>
              ) : user ? ( // Nếu đã đăng nhập (có user)
                  <>
                    <Tooltip title="Mở cài đặt">
                      <IconButton onClick={handleOpenUserMenu}
                                  sx={{p: 0, ml: 1}}>
                        <Avatar alt={user.fullName || user.email}
                                src={user.avatarUrl}/>
                      </IconButton>
                    </Tooltip>
                    <Menu
                        sx={{mt: '45px'}}
                        anchorEl={anchorElUser}
                        anchorOrigin={{vertical: 'top', horizontal: 'right'}}
                        keepMounted
                        transformOrigin={{vertical: 'top', horizontal: 'right'}}
                        open={Boolean(anchorElUser)}
                        onClose={handleCloseUserMenu}
                    >
                      <MenuItem onClick={handleCloseUserMenu}
                                component={RouterLink} to="/dashboard">
                        <Typography textAlign="center">Bảng điều
                          khiển</Typography>
                      </MenuItem>
                      {/* Có thể thêm link Profile ở đây nếu muốn */}
                      <MenuItem onClick={handleLogout}>
                        <Typography textAlign="center">Đăng xuất</Typography>
                      </MenuItem>
                    </Menu>
                  </>
              ) : ( // Nếu chưa đăng nhập (không có user)
                  <>
                    <Button color="inherit" component={Link} to="/login"
                            sx={{ml: 1}}> {/* Sử dụng Link */}
                      Đăng nhập
                    </Button>
                    <Button color="inherit" component={Link}
                            to="/register"> {/* Sử dụng Link */}
                      Đăng ký
                    </Button>
                  </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
  );
}

export default NavBar;