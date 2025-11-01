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
  Typography
} from "@mui/material";
import {
  Add as AddIcon,
  Event as EventIcon,
  NotificationsActive as NotificationsIcon,
  NotificationsOff as NotificationsOffIcon,
  PendingActions as PendingActionsIcon,
  TaskAlt as TaskAltIcon,
} from "@mui/icons-material";
import {useAuth} from "../context/AuthContext";
import {Link as RouterLink, useNavigate} from "react-router-dom";
import eventApi from "../api/eventApi";
import registrationApi from "../api/registrationApi";
import adminApi from "../api/adminApi";
import {
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
} from "../utils/pushNotifications";

export default function Dashboard() {
  const {user} = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [dashboardData, setDashboardData] = useState({
    newlyApprovedEvents: [],
    myActiveRegistrations: [],
    myPendingEvents: [],
    adminPendingEvents: [],
    totalUsers: 0,
  });

  // ... (useCallback loadDashboardData giữ nguyên) ...
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
      setError("Không thể tải dữ liệu dashboard.");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // ... (Logic Push Notification: useState, useEffect, handleSubscriptionToggle giữ nguyên) ...
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
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress/></Box>;
  }

  return (
      <Container maxWidth="lg" sx={{py: 4}}> {/* Đã import Container */}
        <Box display="flex" justifyContent="space-between" alignItems="center"
             mb={3}>
          <Typography variant="h4">
            Xin chào, {user?.fullName || "bạn"} 👋
          </Typography>
          {user?.role === 'organizer' && (
              <Button
                  variant="contained"
                  startIcon={<AddIcon/>}
                  onClick={() => navigate('/organizer/events')}
              >
                Tạo sự kiện mới
              </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{mb: 2}}>{error}</Alert>}

        {/* === SỬA LỖI GRID === */}
        <Grid container spacing={3}>

          {/* Cột chính: Xóa 'item', giữ 'xs' và 'md' */}
          <Grid xs={12} md={8}> {/* <<< ĐÃ SỬA: Xóa 'item' */}
            {/* --- Dành cho Volunteer --- */}
            {user?.role === 'volunteer' && (
                <Paper sx={{p: 2, mb: 3}}>
                  <Typography variant="h6" gutterBottom>Đăng ký của
                    bạn</Typography>
                  {dashboardData.myActiveRegistrations.length > 0 ? (
                      <List dense>
                        {dashboardData.myActiveRegistrations.map(reg => (
                            <ListItem
                                key={reg.id}
                                component={RouterLink}
                                to={`/events/${reg.eventId}`}
                                // button // <<< ĐÃ SỬA: Xóa 'button'
                            >
                              <ListItemText
                                  primary={reg.eventName}
                                  secondary={`Trạng thái: ${reg.status
                                  === 'pending' ? 'Chờ duyệt' : 'Đã duyệt'}`}
                              />
                              {reg.status === 'pending' ? <PendingActionsIcon
                                  color="warning"/> : <TaskAltIcon
                                  color="success"/>}
                            </ListItem>
                        ))}
                      </List>
                  ) : (
                      <Typography>Bạn chưa có đăng ký nào đang hoạt
                        động.</Typography>
                  )}
                </Paper>
            )}

            {/* --- Dành cho Organizer --- */}
            {user?.role === 'organizer' && (
                <Paper sx={{p: 2, mb: 3}}>
                  <Typography variant="h6" gutterBottom>Sự kiện đang chờ
                    duyệt</Typography>
                  {dashboardData.myPendingEvents.length > 0 ? (
                      <List dense>
                        {dashboardData.myPendingEvents.map(event => (
                            <ListItem
                                key={event.id}
                                component={RouterLink}
                                to={`/organizer/events`}
                                // button // <<< ĐÃ SỬA: Xóa 'button'
                            >
                              <ListItemText
                                  primary={event.name}
                                  secondary={`Tạo lúc: ${new Date(
                                      event.createdAt).toLocaleDateString(
                                      'vi-VN')}`}
                              />
                              <PendingActionsIcon color="warning"/>
                            </ListItem>
                        ))}
                      </List>
                  ) : (
                      <Typography>Không có sự kiện nào đang chờ
                        duyệt.</Typography>
                  )}
                </Paper>
            )}

            {/* --- Dành cho Admin --- */}
            {user?.role === 'admin' && (
                <Paper sx={{p: 2, mb: 3}}>
                  <Typography variant="h6" gutterBottom>Sự kiện cần
                    duyệt</Typography>
                  {dashboardData.adminPendingEvents.length > 0 ? (
                      <List dense>
                        {dashboardData.adminPendingEvents.map(event => (
                            <ListItem
                                key={event.id}
                                component={RouterLink}
                                to={`/admin/events`}
                                // button // <<< ĐÃ SỬA: Xóa 'button'
                            >
                              <ListItemText
                                  primary={event.name}
                                  secondary={`Tổ chức bởi: ${event.organizerName}`}
                              />
                              <PendingActionsIcon color="warning"/>
                            </ListItem>
                        ))}
                      </List>
                  ) : (
                      <Typography>Không có sự kiện nào cần duyệt.</Typography>
                  )}
                </Paper>
            )}

            {/* Cài đặt thông báo (Giữ nguyên) */}
            <Paper sx={{p: 2, mt: 3}}>
              <Typography variant="h6" gutterBottom>
                Thông báo đẩy (Push Notification)
              </Typography>
              {/* ... (Code nút Bật/Tắt thông báo giữ nguyên) ... */}
              <Button
                  variant="contained"
                  onClick={handleSubscriptionToggle}
                  disabled={checkingSubscription || !('serviceWorker'
                      in navigator) || !('PushManager' in window)}
                  startIcon={isSubscribed ? <NotificationsOffIcon/> :
                      <NotificationsIcon/>}
                  color={isSubscribed ? 'warning' : 'primary'}
              >
                {checkingSubscription
                    ? 'Đang kiểm tra...'
                    : (isSubscribed ? 'Tắt thông báo' : 'Bật thông báo')}
              </Button>
            </Paper>
          </Grid>

          {/* Cột phụ: Xóa 'item', giữ 'xs' và 'md' */}
          <Grid xs={12} md={4}> {/* <<< ĐÃ SỬA: Xóa 'item' */}
            {/* Thống kê nhanh (Admin) */}
            {user?.role === 'admin' && (
                <Paper sx={{p: 2, mb: 3}}>
                  {/* ... (Code thống kê admin giữ nguyên) ... */}
                </Paper>
            )}

            {/* Sự kiện mới công bố (Chung) */}
            <Paper sx={{p: 2}}>
              <Typography variant="h6" gutterBottom>Sự kiện mới</Typography>
              {dashboardData.newlyApprovedEvents.length > 0 ? (
                  <Box>
                    {dashboardData.newlyApprovedEvents.map(event => (
                        <Paper key={event.id} sx={{p: 1.5, mb: 1.5}}
                               variant="outlined">
                          <Typography
                              variant="subtitle2"
                              fontWeight="bold"
                              component={RouterLink} // Đây là Link, không phải ListItem
                              to={`/events/${event.id}`}
                              sx={{
                                textDecoration: 'none',
                                color: 'text.primary'
                              }}
                          >
                            {event.name}
                          </Typography>
                          <Typography variant="caption" display="block"
                                      color="text.secondary">
                            <EventIcon sx={{
                              fontSize: 14,
                              verticalAlign: 'middle',
                              mr: 0.5
                            }}/>
                            {event.category} | {event.location}
                          </Typography>
                        </Paper>
                    ))}
                  </Box>
              ) : (
                  <Typography variant="body2" color="text.secondary">Hiện chưa
                    có sự kiện nào mới.</Typography>
              )}
            </Paper>
          </Grid>

        </Grid>
      </Container>
  );
}