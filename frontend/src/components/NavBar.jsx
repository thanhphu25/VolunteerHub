/**
 * NavBar Component
 * Main application navigation bar displayed across all pages.
 * Features responsive design, user menu, theme toggle, language selection,
 * and notifications. Displays different navigation options based on user role.
 *
 * @component
 * @returns {JSX.Element} Application header with navigation and user controls
 */
import React from "react";
import { Link as RouterLink, useNavigate, useLocation } from "react-router-dom";
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
  Divider,
  ListItemIcon,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import NotificationsIcon from "@mui/icons-material/Notifications";
import Brightness4Icon from "@mui/icons-material/Brightness4";
import Brightness7Icon from "@mui/icons-material/Brightness7";
import Logout from "@mui/icons-material/Logout";
import Person from "@mui/icons-material/Person";

import { useAuth } from "../context/AuthContext";
import { useThemeMode } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import authApi from "../api/authApi";
import notificationApi from "../api/notificationApi";
import profileApi from "../api/profileApi";
import { toast } from "react-toastify";
import logo from "../assets/logo-removebg.png";

/**
 * Main navigation bar component
 * @returns {JSX.Element} Responsive navbar with user menu and theme controls
 */
function NavBar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleColorMode } = useThemeMode();
  const { language, t } = useLanguage();
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [unreadCount, setUnreadCount] = React.useState(0);
  const [userProfile, setUserProfile] = React.useState(null);

  const pages = [
    { name: t("nav.home"), path: "/", key: "home" },
    { name: t("nav.events"), path: "/events", key: "events" },
  ];

  const volunteerPages = [
    {
      name: t("nav.myRegistrations"),
      path: "/my-registrations",
      key: "myRegistrations",
    },
  ];
  const organizerPages = [
    {
      name: t("nav.manageEvents"),
      path: "/organizer/events",
      key: "manageEvents",
    },
  ];
  const adminPages = [
    {
      name: t("nav.approveEvents"),
      path: "/admin/events",
      key: "approveEvents",
    },
    { name: t("nav.manageUsers"), path: "/admin/users", key: "manageUsers" },
  ];

  const handleOpenNavMenu = (event) => setAnchorElNav(event.currentTarget);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseNavMenu = () => setAnchorElNav(null);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      const refreshToken = localStorage.getItem("vh_refreshToken");
      if (refreshToken) {
        await authApi.logout({ refreshToken });
      }
    } catch (error) {
      console.error("Lỗi khi gọi API logout:", error);
    } finally {
      logout();
      localStorage.removeItem("vh_refreshToken");
      toast.info(
        language === "vi" ? "Bạn đã đăng xuất." : "You have logged out."
      );
      navigate("/");
    }
  };

  let roleSpecificPages = [];
  if (user?.role === "volunteer") {
    roleSpecificPages = volunteerPages;
  } else if (user?.role === "organizer") {
    roleSpecificPages = organizerPages;
  } else if (user?.role === "admin") {
    roleSpecificPages = [...adminPages];
  }

  const fetchUserProfile = React.useCallback(async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    try {
      const response = await profileApi.getProfileSummary();
      setUserProfile(response.data?.user || null);
    } catch (error) {
      if (error.code !== "ERR_NETWORK" && error.message !== "Network Error") {
        console.error("Failed to fetch user profile:", error);
      }
    }
  }, [user]);

  const fetchNotifications = React.useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }
    try {
      const response = await notificationApi.list();
      const notifications = response.data || [];
      const unread = notifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      if (error.code !== "ERR_NETWORK" && error.message !== "Network Error") {
        console.error("Failed to fetch notifications:", error);
      }
    }
  }, [user]);

  React.useEffect(() => {
    fetchUserProfile();
    fetchNotifications();
  }, [fetchUserProfile, fetchNotifications]);

  const prevLocationRef = React.useRef(location.pathname);
  React.useEffect(() => {
    if (
      prevLocationRef.current === "/notifications" &&
      location.pathname !== "/notifications"
    ) {
      fetchNotifications();
    }
    prevLocationRef.current = location.pathname;
  }, [location.pathname, fetchNotifications]);

  React.useEffect(() => {
    const handleFocus = () => {
      if (user) fetchNotifications();
    };
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [user, fetchNotifications]);

  React.useEffect(() => {
    if (!user) return;
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [user, fetchNotifications]);

  return (
    <AppBar
      position="sticky"
      color="transparent"
      elevation={0}
      sx={{
        backgroundColor: mode === "dark" ? "#0f172a" : "#ffffff",
        transition: "background-color 0.3s ease",
      }}
      className="border-b border-slate-200 dark:border-slate-800"
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          { }
          <Box
            component={RouterLink}
            to="/"
            sx={{
              display: { xs: "none", md: "flex" },
              alignItems: "center",
              textDecoration: "none",
              mr: 4,
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="Volunteer Hub Logo"
              sx={{ height: 50, mr: 1.5 }}
            />
            <Box display="flex" flexDirection="column" justifyContent="center">
              <Typography
                variant="h6"
                noWrap
                className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600 hover:opacity-80 transition-opacity cursor-pointer"
                sx={{ lineHeight: 1 }}
              >
                VOLUNTEER HUB
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  mt: 0.3
                }}
              >
                Kết nối - Hành động - Thay đổi
              </Typography>
            </Box>
          </Box>

          { }
          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              onClick={handleOpenNavMenu}
              className="text-slate-700 dark:text-slate-200"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              anchorEl={anchorElNav}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{ display: { xs: "block", md: "none" } }}
              PaperProps={{
                className:
                  "rounded-xl shadow-lg border border-slate-100 dark:border-slate-700 dark:bg-slate-800",
              }}
            >
              {[...pages, ...roleSpecificPages].map((page) => (
                <MenuItem
                  key={page.name}
                  onClick={handleCloseNavMenu}
                  component={RouterLink}
                  to={page.path}
                  className="dark:text-slate-200"
                >
                  <Typography textAlign="center" fontWeight="500">
                    {page.name}
                  </Typography>
                </MenuItem>
              ))}
              {!user && (
                <Box>
                  <Divider sx={{ my: 1 }} />
                  <MenuItem
                    onClick={handleCloseNavMenu}
                    component={RouterLink}
                    to="/login"
                  >
                    <Typography textAlign="center">{t("nav.login")}</Typography>
                  </MenuItem>
                  <MenuItem
                    onClick={handleCloseNavMenu}
                    component={RouterLink}
                    to="/register"
                  >
                    <Typography
                      textAlign="center"
                      color="primary"
                      fontWeight="bold"
                    >
                      {t("nav.register")}
                    </Typography>
                  </MenuItem>
                </Box>
              )}
            </Menu>
          </Box>

          { }
          <Box
            component={RouterLink}
            to="/"
            sx={{
              flexGrow: 1,
              display: { xs: "flex", md: "none" },
              alignItems: "center",
              textDecoration: "none",
            }}
          >
            <Box
              component="img"
              src={logo}
              alt="VH Logo"
              sx={{ height: 32, mr: 1 }}
            />
            <Typography
              variant="h5"
              noWrap
              className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600"
            >
              VH
            </Typography>
          </Box>

          { }
          <Box
            sx={{ flexGrow: 1, display: { xs: "none", md: "flex" }, gap: 1 }}
          >
            {[...pages, ...roleSpecificPages].map((page) => {
              const isActive = location.pathname === page.path;
              return (
                <Button
                  key={page.name}
                  component={RouterLink}
                  to={page.path}
                  onClick={handleCloseNavMenu}
                  className={`
                    normal-case px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200
                    ${isActive
                      ? "bg-teal-50 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300"
                      : "text-slate-600 hover:bg-slate-100 hover:text-teal-600 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                    }
                  `}
                >
                  {page.name}
                </Button>
              );
            })}
          </Box>

          { }
          <Box
            sx={{ flexGrow: 0, display: "flex", alignItems: "center", gap: 1 }}
          >
            { }

            { }
            <Tooltip
              title={
                mode === "dark"
                  ? language === "vi"
                    ? "Chế độ sáng"
                    : "Light mode"
                  : language === "vi"
                    ? "Chế độ tối"
                    : "Dark mode"
              }
            >
              <IconButton
                onClick={toggleColorMode}
                className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
              >
                {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
              </IconButton>
            </Tooltip>

            {loading ? (
              <CircularProgress size={24} className="ml-2 text-teal-600" />
            ) : user ? (
              <>
                <Tooltip title={t("nav.notifications")}>
                  <IconButton
                    component={RouterLink}
                    to="/notifications"
                    className="text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                  >
                    <Badge
                      badgeContent={unreadCount}
                      color="error"
                      invisible={unreadCount === 0}
                      sx={{ "& .MuiBadge-badge": { fontWeight: "bold" } }}
                    >
                      <NotificationsIcon />
                    </Badge>
                  </IconButton>
                </Tooltip>

                <Tooltip title={t("nav.account")}>
                  <IconButton
                    onClick={handleOpenUserMenu}
                    sx={{ p: 0, ml: 0.5 }}
                    className="border-2 border-white shadow-sm hover:shadow-md transition-all dark:border-slate-700"
                  >
                    <Avatar
                      alt={userProfile?.fullName || user?.email || "User"}
                      src={
                        userProfile?.avatarUrl
                          ? userProfile.avatarUrl.startsWith("http")
                            ? userProfile.avatarUrl
                            : `http://localhost:8080${userProfile.avatarUrl}`
                          : undefined
                      }
                      className="bg-teal-100 text-teal-700 font-bold"
                    />
                  </IconButton>
                </Tooltip>

                <Menu
                  sx={{ mt: "50px" }}
                  anchorEl={anchorElUser}
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  keepMounted
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                  PaperProps={{
                    elevation: 0,
                    className:
                      "rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 dark:bg-slate-800 min-w-[200px]",
                  }}
                >
                  <Box className="px-4 py-3">
                    { }
                    <Typography
                      variant="subtitle2"
                      color="text.primary"
                      fontWeight="bold"
                      noWrap
                    >
                      {userProfile?.fullName ||
                        (language === "vi" ? "Người dùng" : "User")}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      noWrap
                      display="block"
                    >
                      {user.email}
                    </Typography>
                  </Box>
                  <Divider />
                  <MenuItem
                    onClick={handleCloseUserMenu}
                    component={RouterLink}
                    to="/profile"
                    className="dark:text-slate-200 py-3"
                  >
                    <ListItemIcon>
                      <Person
                        fontSize="small"
                        className="dark:text-slate-400"
                      />
                    </ListItemIcon>
                    {t("nav.profile")}
                  </MenuItem>
                  <MenuItem
                    onClick={handleLogout}
                    className="text-red-600 dark:text-red-400 py-3"
                  >
                    <ListItemIcon>
                      <Logout
                        fontSize="small"
                        className="text-red-600 dark:text-red-400"
                      />
                    </ListItemIcon>
                    {t("nav.logout")}
                  </MenuItem>
                </Menu>
              </>
            ) : (
              <div className="hidden md:flex items-center gap-3 ml-2">
                <Button
                  component={RouterLink}
                  to="/login"
                  className="normal-case text-slate-600 font-semibold hover:bg-slate-100 hover:text-teal-700 px-4 py-2 rounded-lg transition-all dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  {t("nav.login")}
                </Button>
                <Button
                  component={RouterLink}
                  to="/register"
                  variant="contained"
                  className="normal-case bg-gradient-to-r from-teal-600 to-cyan-600 text-white font-bold px-5 py-2 rounded-lg shadow-md hover:shadow-lg hover:opacity-90 transition-all"
                >
                  {t("nav.register")}
                </Button>
              </div>
            )}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}

export default NavBar;
