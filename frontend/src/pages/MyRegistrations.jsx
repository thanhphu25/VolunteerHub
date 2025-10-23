// src/pages/MyRegistrations.jsx
import React, {useCallback, useEffect, useState} from "react";
import {Link as RouterLink} from "react-router-dom";
import {
  Alert,
  Box,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Tooltip,
  Typography,
} from "@mui/material";
import {Cancel as CancelIcon} from "@mui/icons-material";
import registrationApi from "../api/registrationApi"; // Đảm bảo đã tạo file này
import {toast} from "react-toastify";
import {useAuth} from "../context/AuthContext"; // Cần để lấy userId

// Nhãn và màu cho trạng thái đăng ký (có thể đưa ra file constants dùng chung)
const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};
const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
  completed: "info",
};

// Định dạng ngày tháng
const formatDate = (dateString) => {
  if (!dateString) {
    return "N/A";
  }
  const date = new Date(dateString);
  return date.toLocaleString("vi-VN", {
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit",
  });
};

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancellingId, setCancellingId] = useState(null); // ID đăng ký đang hủy
  const {user} = useAuth(); // Lấy thông tin user

  // Hàm fetch danh sách đăng ký
  const fetchMyRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await registrationApi.getMyRegistrations();
      // Sắp xếp: pending/approved lên đầu, theo ngày đăng ký mới nhất
      const sortedData = (response.data || []).sort((a, b) => {
        const statusOrder = {
          pending: 1,
          approved: 2,
          completed: 3,
          rejected: 4,
          cancelled: 5
        };
        const orderA = statusOrder[a.status] || 99;
        const orderB = statusOrder[b.status] || 99;
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        // Nếu cùng status, sắp theo ngày đăng ký mới nhất
        return new Date(b.registeredAt) - new Date(a.registeredAt);
      });
      setRegistrations(sortedData);
    } catch (err) {
      console.error("Lỗi khi tải đăng ký:", err);
      setError("Không thể tải danh sách đăng ký của bạn. Vui lòng thử lại.");
      toast.error("Không thể tải danh sách đăng ký.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) { // Chỉ fetch khi đã có thông tin user
      fetchMyRegistrations();
    } else {
      setLoading(false); // Nếu không có user, không cần loading
      setError("Vui lòng đăng nhập để xem danh sách đăng ký.");
    }
  }, [fetchMyRegistrations, user]);

  // Hàm xử lý hủy đăng ký
  const handleCancelRegistration = async (eventId, registrationId) => {
    if (cancellingId) {
      return;
    } // Ngăn click nhiều lần
    if (!window.confirm(
        "Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?")) {
      return;
    }
    setCancellingId(registrationId);
    try {
      // API yêu cầu cả eventId và registrationId
      await registrationApi.cancel(eventId, registrationId);
      toast.success("Hủy đăng ký thành công!");
      // Cập nhật UI: thay đổi status thành 'cancelled' hoặc fetch lại
      setRegistrations(prev =>
          prev.map(
              reg => reg.id === registrationId ? {...reg, status: 'cancelled'}
                  : reg)
      );
      // Hoặc gọi lại fetchMyRegistrations(); nếu muốn lấy dữ liệu mới nhất từ server
    } catch (err) {
      console.error("Lỗi khi hủy đăng ký:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message
          || "Hủy đăng ký thất bại.");
    } finally {
      setCancellingId(null);
    }
  };

  // ----- Render UI -----

  if (loading) {
    return (
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center"
               minHeight="50vh">
            <CircularProgress/>
          </Box>
        </Container>
    );
  }

  if (error) {
    return (
        <Container sx={{py: 4}}>
          <Alert severity="error">{error}</Alert>
        </Container>
    );
  }

  return (
      <Container maxWidth="md" sx={{py: 4}}>
        <Typography variant="h4" component="h1" gutterBottom>
          Sự kiện đã đăng ký
        </Typography>

        {registrations.length === 0 ? (
            <Alert severity="info">Bạn chưa đăng ký tham gia sự kiện nào.
              <RouterLink to="/events">Xem danh sách sự kiện</RouterLink>
            </Alert>
        ) : (
            <Paper elevation={2}>
              <List disablePadding>
                {registrations.map((reg, index) => {
                  // Kiểm tra xem sự kiện đã bắt đầu chưa (Cần thêm eventStartDate vào RegistrationResponse backend)
                  // const eventHasStarted = reg.eventStartDate ? new Date(reg.eventStartDate) < new Date() : false;
                  const canCancel = (reg.status === 'pending' || reg.status
                      === 'approved'); // && !eventHasStarted;

                  return (
                      <React.Fragment key={reg.id}>
                        <ListItem alignItems="flex-start">
                          <ListItemText
                              primary={
                                <Typography component="span" variant="h6">
                                  <RouterLink to={`/events/${reg.eventId}`}
                                              style={{
                                                textDecoration: 'none',
                                                color: 'inherit'
                                              }}>
                                    {reg.eventName || `Sự kiện #${reg.eventId}`}
                                  </RouterLink>
                                </Typography>
                              }
                              secondary={
                                <>
                                  <Typography
                                      sx={{display: 'block'}}
                                      component="span"
                                      variant="body2"
                                      color="text.primary"
                                  >
                                    Ngày đăng ký: {formatDate(reg.registeredAt)}
                                  </Typography>
                                  {/* Hiển thị ngày duyệt nếu có */}
                                  {reg.approvedAt && reg.status === 'approved'
                                      && (
                                          <Typography sx={{display: 'block'}}
                                                      component="span"
                                                      variant="caption"
                                                      color="text.secondary">
                                            Ngày duyệt: {formatDate(
                                              reg.approvedAt)}
                                          </Typography>
                                      )}
                                  {/* Hiển thị ngày hoàn thành nếu có */}
                                  {reg.completedAt && reg.status === 'completed'
                                      && (
                                          <Typography sx={{display: 'block'}}
                                                      component="span"
                                                      variant="caption"
                                                      color="text.secondary">
                                            Ngày hoàn thành: {formatDate(
                                              reg.completedAt)}
                                          </Typography>
                                      )}
                                  {/* Hiển thị ngày hủy nếu có */}
                                  {reg.cancelledAt && reg.status === 'cancelled'
                                      && (
                                          <Typography sx={{display: 'block'}}
                                                      component="span"
                                                      variant="caption"
                                                      color="text.secondary">
                                            Ngày hủy: {formatDate(
                                              reg.cancelledAt)}
                                          </Typography>
                                      )}
                                  {reg.note && (
                                      <Typography sx={{
                                        display: 'block',
                                        fontStyle: 'italic',
                                        mt: 0.5
                                      }} component="span" variant="caption"
                                                  color="text.secondary">
                                        Ghi chú: "{reg.note}"
                                      </Typography>
                                  )}
                                </>
                              }
                          />
                          <Box sx={{textAlign: 'right', ml: 2}}>
                            <Chip
                                label={statusLabels[reg.status] || reg.status}
                                color={statusColors[reg.status] || "default"}
                                size="small"
                                sx={{mb: 1}}
                            />
                            {canCancel && (
                                <Tooltip title="Hủy đăng ký">
                                <span> {/* Wrap IconButton for Tooltip when disabled */}
                                  <IconButton
                                      edge="end"
                                      aria-label="hủy đăng ký"
                                      onClick={() => handleCancelRegistration(
                                          reg.eventId, reg.id)}
                                      disabled={cancellingId === reg.id}
                                      color="error"
                                      size="small"
                                  >
                                    {cancellingId === reg.id ? <CircularProgress
                                            size={20} color="inherit"/> :
                                        <CancelIcon/>}
                                    </IconButton>
                                </span>
                                </Tooltip>
                            )}
                            {!canCancel && reg.status !== 'cancelled'
                                && reg.status !== 'rejected' && (
                                    <Typography variant="caption"
                                                color="text.secondary"
                                                display="block">
                                      {/* {eventHasStarted ? "Sự kiện đã bắt đầu" : ""} */}
                                      {/* Thông báo nếu không thể hủy */}
                                    </Typography>
                                )}
                          </Box>
                        </ListItem>
                        {index < registrations.length - 1 && <Divider
                            component="li"/>}
                      </React.Fragment>
                  );
                })}
              </List>
            </Paper>
        )}
      </Container>
  );
}