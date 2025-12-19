// src/pages/Dashboard.jsx
import React, {useCallback, useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  List,
  ListItem,
  ListItemText,
  Paper,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  NotificationsActive as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  PendingActions as PendingActionsIcon,
  TaskAlt as TaskAltIcon,
  People as PeopleIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {useAuth} from "../context/AuthContext";
import {useLanguage} from "../context/LanguageContext";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import eventApi from "../api/eventApi";
import registrationApi from "../api/registrationApi";
import adminApi from "../api/adminApi";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../utils/pushNotifications";
import EventCard from '../components/EventCard';

export default function Dashboard() {
  const {user} = useAuth();
  const {t, language} = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    newlyApprovedEvents: [],
    trendingEvents: [],
    myActiveRegistrations: [],
    myPendingEvents: [],
    adminPendingEvents: [],
    totalUsers: 0,
  });

  const loadDashboardData = useCallback(async () => {
    if (!user) {
      return;
    }
    setLoading(true);
    setError(null);

    try {
      let data = {
        newlyApprovedEvents: [],
        myActiveRegistrations: [],
        trendingEvents: [],
        myPendingEvents: [],
        adminPendingEvents: [],
        totalUsers: 0,
      };

      const newlyApprovedRes = await eventApi.getAll({
        status: 'approved',
        size: 3,
        sort: 'createdAt,desc',
      });
      data.newlyApprovedEvents = newlyApprovedRes.data.content || [];

        try {
            const trendingRes = await eventApi.getTrending(6); // Lấy top 6
            data.trendingEvents = trendingRes.data || []; // Backend trả về List nên lấy .data trực tiếp
        } catch (e) {
            console.error("Lỗi tải trending events", e);
        }

      if (user.role === 'volunteer') {
        const myRegsRes = await registrationApi.getMyRegistrations();
        const allRegs = myRegsRes.data || [];
        data.myActiveRegistrations = allRegs.filter(
            r => r.status === 'pending' || r.status === 'approved'
        );
      } else if (user.role === 'organizer') {
        const myEventsRes = await eventApi.getMyEvents({page: 0, size: 100});
        const myEvents = myEventsRes.data.content || [];
        data.myPendingEvents = myEvents.filter(e => e.status === 'pending');
      } else if (user.role === 'admin') {
        const pendingEventsRes = await eventApi.getAll(
            {status: 'pending', size: 5});
        data.adminPendingEvents = pendingEventsRes.data.content || [];

        const usersRes = await adminApi.listUsers({size: 1});
        data.totalUsers = usersRes.data.totalElements || 0;
      }

      setDashboardData(data);
    } catch (err) {
      console.error("Lỗi tải dữ liệu Dashboard:", err);
      setError(language === "vi" ? "Không thể tải dữ liệu dashboard." : "Unable to load dashboard data.");
    } finally {
      setLoading(false);
    }
  }, [user, language]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const [isSubscribed, setIsSubscribed] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(true);

  useEffect(() => {
    const checkSubscription = async () => {
      if ('serviceWorker' in navigator && 'PushManager' in window) {
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (e) {
          console.error("Lỗi khi kiểm tra subscription:", e);
        }
      }
      setCheckingSubscription(false);
    };
    checkSubscription();
  }, []);

  const handleSubscriptionToggle = async () => {
    if (checkingSubscription) {
      return;
    }
    setCheckingSubscription(true);
    if (isSubscribed) {
      await unsubscribeFromPushNotifications();
      setIsSubscribed(false);
    } else {
      const sub = await subscribeToPushNotifications();
      setIsSubscribed(!!sub);
    }
    setCheckingSubscription(false);
  };

  if (loading) {
    return (
        <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
            sx={{bgcolor: "background.default"}}
        >
          <CircularProgress/>
        </Box>
    );
  }

  return (
      <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4}}>
        <Container maxWidth="lg">
          <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mb={4}
          >
            <Typography variant="h3" fontWeight="bold" sx={{color: "primary.main"}}>
              {language === "vi" ? `Xin chào, ${user?.fullName || "bạn"} 👋` : `Hello, ${user?.fullName || "you"} 👋`}
            </Typography>
            {user?.role === 'organizer' && (
                <Button
                    variant="contained"
                    startIcon={<AddIcon/>}
                    onClick={() => navigate('/organizer/events')}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                      boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
                      "&:hover": {
                        boxShadow: "0 6px 16px rgba(2, 136, 209, 0.4)",
                        transform: "translateY(-1px)",
                      },
                      transition: "all 0.3s ease",
                    }}
                >
                  {language === "vi" ? "Tạo sự kiện mới" : "Create New Event"}
                </Button>
            )}
          </Box>

          {error && (
              <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                {error}
              </Alert>
          )}


            <Box sx={{ mb: 6 }}>
                <Box display="flex" alignItems="center" gap={1} mb={3}>
                    <TrendingUpIcon color="error" sx={{ fontSize: 32 }} />
                    <Typography variant="h4" fontWeight="bold" sx={{ color: "text.primary" }}>
                        {language === "vi" ? "Sự Kiện Nổi Bật" : "Trending Events"}
                    </Typography>
                </Box>

                <Grid container spacing={3}>
                    {dashboardData.trendingEvents.length > 0 ? (
                        dashboardData.trendingEvents.map((event, index) => (
                            <Grid item xs={12} md={6} lg={4} key={event.id}>
                                <Box sx={{ position: 'relative' }}>
                                    {/* Huy hiệu Top 1, 2, 3 */}
                                    {index < 3 && (
                                        <Chip
                                            label={`#${index + 1} Trending`}
                                            color={index === 0 ? "error" : index === 1 ? "warning" : "primary"}
                                            sx={{
                                                position: 'absolute',
                                                top: -10,
                                                right: -5,
                                                zIndex: 10,
                                                fontWeight: 'bold',
                                                boxShadow: 3
                                            }}
                                        />
                                    )}
                                    {/* Sử dụng EventCard có sẵn */}
                                    <EventCard event={event} />
                                </Box>
                            </Grid>
                        ))
                    ) : (
                        <Grid item xs={12}>
                            <Typography variant="body1" color="text.secondary" align="center">
                                {language === "vi" ? "Chưa có sự kiện nổi bật nào." : "No trending events yet."}
                            </Typography>
                        </Grid>
                    )}
                </Grid>
            </Box>

          <Grid container spacing={3}>
            {/* Main Column */}
            <Grid item xs={12} md={8}>
              {/* Volunteer Section */}
              {user?.role === 'volunteer' && (
                  <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                      }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3, color: "primary.main"}}>
                      {language === "vi" ? "Đăng ký của bạn" : "Your Registrations"}
                    </Typography>
                    {dashboardData.myActiveRegistrations.length > 0 ? (
                        <List>
                          {dashboardData.myActiveRegistrations.map((reg, index) => (
                              <React.Fragment key={reg.id}>
                                <ListItem
                                    component={RouterLink}
                                    to={`/events/${reg.eventId}`}
                                    sx={{
                                      borderRadius: 2,
                                      mb: 1,
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                      transition: "all 0.2s ease",
                                    }}
                                >
                                  <ListItemText
                                      primary={reg.eventName}
                                      secondary={language === "vi" 
                                        ? `Trạng thái: ${reg.status === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}`
                                        : `Status: ${reg.status === 'pending' ? 'Pending' : 'Approved'}`}
                                  />
                                  {reg.status === 'pending' ? (
                                      <PendingActionsIcon color="warning"/>
                                  ) : (
                                      <TaskAltIcon color="success"/>
                                  )}
                                </ListItem>
                                {index < dashboardData.myActiveRegistrations.length - 1 && <Divider/>}
                              </React.Fragment>
                          ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary">
                          {language === "vi" ? "Bạn chưa có đăng ký nào đang hoạt động." : "You have no active registrations."}
                        </Typography>
                    )}
                  </Paper>
              )}

              {/* Organizer Section */}
              {user?.role === 'organizer' && (
                  <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                      }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3, color: "primary.main"}}>
                      {language === "vi" ? "Sự kiện đang chờ duyệt" : "Pending Events"}
                    </Typography>
                    {dashboardData.myPendingEvents.length > 0 ? (
                        <List>
                          {dashboardData.myPendingEvents.map((event, index) => (
                              <React.Fragment key={event.id}>
                                <ListItem
                                    component={RouterLink}
                                    to={`/organizer/events`}
                                    sx={{
                                      borderRadius: 2,
                                      mb: 1,
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                      transition: "all 0.2s ease",
                                    }}
                                >
                                  <ListItemText
                                      primary={event.name}
                                      secondary={language === "vi"
                                        ? `Tạo lúc: ${new Date(event.createdAt).toLocaleDateString('vi-VN')}`
                                        : `Created: ${new Date(event.createdAt).toLocaleDateString('en-US')}`}
                                  />
                                  <PendingActionsIcon color="warning"/>
                                </ListItem>
                                {index < dashboardData.myPendingEvents.length - 1 && <Divider/>}
                              </React.Fragment>
                          ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary">
                          {language === "vi" ? "Không có sự kiện nào đang chờ duyệt." : "No pending events."}
                        </Typography>
                    )}
                  </Paper>
              )}

              {/* Admin Section */}
              {user?.role === 'admin' && (
                  <Paper
                      elevation={0}
                      sx={{
                        p: 4,
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                      }}
                  >
                    <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3, color: "primary.main"}}>
                      {language === "vi" ? "Sự kiện cần duyệt" : "Events Pending Approval"}
                    </Typography>
                    {dashboardData.adminPendingEvents.length > 0 ? (
                        <List>
                          {dashboardData.adminPendingEvents.map((event, index) => (
                              <React.Fragment key={event.id}>
                                <ListItem
                                    component={RouterLink}
                                    to={`/admin/events`}
                                    sx={{
                                      borderRadius: 2,
                                      mb: 1,
                                      "&:hover": {
                                        bgcolor: "action.hover",
                                      },
                                      transition: "all 0.2s ease",
                                    }}
                                >
                                  <ListItemText
                                      primary={event.name}
                                      secondary={language === "vi"
                                        ? `Tổ chức bởi: ${event.organizerName}`
                                        : `Organized by: ${event.organizerName}`}
                                  />
                                  <PendingActionsIcon color="warning"/>
                                </ListItem>
                                {index < dashboardData.adminPendingEvents.length - 1 && <Divider/>}
                              </React.Fragment>
                          ))}
                        </List>
                    ) : (
                        <Typography color="text.secondary">
                          {language === "vi" ? "Không có sự kiện nào cần duyệt." : "No events pending approval."}
                        </Typography>
                    )}
                  </Paper>
              )}

              {/* Push Notification Settings */}
              <Paper
                  elevation={0}
                  sx={{
                    p: 4,
                    mt: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
              >
                <Typography variant="h5" fontWeight="bold" gutterBottom sx={{mb: 3, color: "primary.main"}}>
                  {language === "vi" ? "Thông báo đẩy (Push Notification)" : "Push Notifications"}
                </Typography>
                <Button
                    variant="contained"
                    onClick={handleSubscriptionToggle}
                    disabled={checkingSubscription || !('serviceWorker' in navigator) || !('PushManager' in window)}
                    startIcon={isSubscribed ? <NotificationsOffIcon/> : <NotificationsIcon/>}
                    color={isSubscribed ? 'warning' : 'primary'}
                    sx={{
                      borderRadius: 2,
                      textTransform: "none",
                      fontWeight: 600,
                      px: 4,
                      py: 1.5,
                    }}
                >
                  {checkingSubscription
                      ? (language === "vi" ? 'Đang kiểm tra...' : 'Checking...')
                      : (isSubscribed
                          ? (language === "vi" ? 'Tắt thông báo' : 'Disable Notifications')
                          : (language === "vi" ? 'Bật thông báo' : 'Enable Notifications'))}
                </Button>
              </Paper>
            </Grid>

            {/* Sidebar Column */}
            <Grid item xs={12} md={4}>
              {/* Admin Stats */}
              {user?.role === 'admin' && (
                  <Card
                      elevation={0}
                      sx={{
                        mb: 3,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: "divider",
                        boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                        background: "linear-gradient(135deg, #0288d1 0%, #00bcd4 100%)",
                        color: "white",
                      }}
                  >
                    <CardContent sx={{p: 3}}>
                      <Box display="flex" alignItems="center" gap={2} mb={2}>
                        <PeopleIcon sx={{fontSize: 40}}/>
                        <Box>
                          <Typography variant="h4" fontWeight="bold">
                            {dashboardData.totalUsers}
                          </Typography>
                          <Typography variant="body2" sx={{opacity: 0.9}}>
                            {language === "vi" ? "Tổng số người dùng" : "Total Users"}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
              )}

              {/* New Events */}
              <Paper
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                  }}
              >
                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{mb: 3, color: "primary.main"}}>
                  {language === "vi" ? "Sự kiện mới" : "New Events"}
                </Typography>
                {dashboardData.newlyApprovedEvents.length > 0 ? (
                    <Box>
                      {dashboardData.newlyApprovedEvents.map((event, index) => (
                          <React.Fragment key={event.id}>
                            <Card
                                component={RouterLink}
                                to={`/events/${event.id}`}
                                elevation={0}
                                sx={{
                                  p: 2,
                                  mb: 2,
                                  borderRadius: 2,
                                  border: "1px solid",
                                  borderColor: "divider",
                                  textDecoration: "none",
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    borderColor: "primary.main",
                                    boxShadow: "0 4px 12px rgba(2, 136, 209, 0.15)",
                                    transform: "translateY(-2px)",
                                  },
                                }}
                            >
                              <Typography
                                  variant="subtitle2"
                                  fontWeight="bold"
                                  sx={{
                                    color: 'text.primary',
                                    mb: 1,
                                  }}
                              >
                                {event.name}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                <EventIcon sx={{fontSize: 14, verticalAlign: 'middle', mr: 0.5}}/>
                                {event.category} | {event.location}
                              </Typography>
                            </Card>
                            {index < dashboardData.newlyApprovedEvents.length - 1 && <Divider sx={{my: 1}}/>}
                          </React.Fragment>
                      ))}
                    </Box>
                ) : (
                    <Typography variant="body2" color="text.secondary">
                      {language === "vi" ? "Hiện chưa có sự kiện nào mới." : "No new events available."}
                    </Typography>
                )}
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
  );
}
