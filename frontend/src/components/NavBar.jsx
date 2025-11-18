import React from 'react';
// 1. Import Link as RouterLink và useNavigate từ react-router-dom
import {Link as RouterLink, Link, useNavigate, useLocation} from 'react-router-dom';
import {
  AppBar,
  Avatar,
  Badge,
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
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import {useAuth} from '../context/AuthContext';
import {useThemeMode} from '../context/ThemeContext';
import authApi from '../api/authApi';
import notificationApi from '../api/notificationApi';
import profileApi from '../api/profileApi';
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
  const location = useLocation();
  const {mode, toggleColorMode} = useThemeMode();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [userProfile, setUserProfile] = React.useState(null);

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

  // Function to fetch user profile (including avatarUrl and fullName)
  const fetchUserProfile = React.useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const response = await profileApi.getProfileSummary();
      setUserProfile(response.data?.user || null);
    } catch (error) {
      // Silently fail - profile is optional for navbar
      // Only log non-network errors (backend down is expected in dev)
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        console.error('Failed to fetch user profile:', error);
      }
    }
  }, [user]);

  // Function to fetch unread notification count
  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationApi.list();
      const notifications = response.data || [];
      const unread = notifications.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      // Silently fail - notifications are optional
      // Only log non-network errors (backend down is expected in dev)
      if (error.code !== 'ERR_NETWORK' && error.message !== 'Network Error') {
        console.error('Failed to fetch notifications:', error);
      }
    }
  }, [user]);

  // Fetch user profile and notifications on mount and when user changes
  React.useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
  }, [fetchUserProfile, fetchNotifications]);

  // Refresh notifications when navigating away from notifications page
  const prevLocationRef = React.useRef(location.pathname);
  React.useEffect(() => {
    // Only refresh if we navigated away from notifications page
    if (prevLocationRef.current === '/notifications' && location.pathname !== '/notifications') {
      fetchNotifications();
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, fetchNotifications]);

  // Refresh notifications when window gains focus (user switches back to tab)
  React.useEffect(() => {
    const handleFocus = () => {
      if (user) {
        fetchNotifications();
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, fetchNotifications]);

  // Auto-refresh notifications every 30 seconds
  React.useEffect(() => {
    if (!user) return;
    
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  return (
      <AppBar position="static" color="primary">
        <Toolbar>
          {/* Desktop Logo */}
          <Typography
              variant="h6"
              noWrap
              component={RouterLink}
              to="/"
              sx={{
                mr: 2,
                display: {xs: 'none', md: 'flex'},
                fontWeight: 700,
                color: 'inherit',
                textDecoration: 'none',
              }}
          >
            Volunteer Hub
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
                            to={page.path}>
                    <Typography textAlign="center">{page.name}</Typography>
                  </MenuItem>
              ))}
              {!user && (
                  <>
                    <MenuItem onClick={handleCloseNavMenu}
                              component={RouterLink} to="/login">
                      <Typography textAlign="center">Đăng nhập</Typography>
                    </MenuItem>
                    <MenuItem onClick={handleCloseNavMenu}
                              component={RouterLink} to="/register">
                      <Typography textAlign="center">Đăng ký</Typography>
                    </MenuItem>
                  </>
              )}
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
                      component={RouterLink}
                      to={page.path}
                      sx={{my: 2, color: 'white', display: 'block'}}
                  >
                    {page.name}
                  </Button>
              ))}
              {roleSpecificPages.map((page) => (
                  <Button
                      key={page.name}
                      component={RouterLink}
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
                    {/* Notification Icon with Badge */}
                    <Tooltip title="Thông báo">
                      <IconButton
                          color="inherit"
                          component={RouterLink}
                          to="/notifications"
                          sx={{ml: 1}}
                      >
                        <Badge 
                          badgeContent={unreadCount} 
                          color="error"
                          invisible={unreadCount === 0}
                        >
                          <NotificationsIcon />
                        </Badge>
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mở cài đặt">
                      <IconButton onClick={handleOpenUserMenu}
                                  sx={{p: 0, ml: 1}}>
                        <Avatar 
                          alt={userProfile?.fullName || user?.email || 'User'}
                          src={userProfile?.avatarUrl ? (
                            userProfile.avatarUrl.startsWith('http') 
                              ? userProfile.avatarUrl 
                              : `http://localhost:8080${userProfile.avatarUrl}`
                          ) : undefined}
                        />
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
                                component={RouterLink} to="/profile">
                        <Typography textAlign="center">Trang cá nhân</Typography>
                      </MenuItem>
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
      </AppBar>
  );
}

export default NavBar;