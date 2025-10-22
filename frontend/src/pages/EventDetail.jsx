// src/pages/EventDetail.jsx
import React, {useEffect, useState} from "react";
import {Link as RouterLink, useParams} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {
  Category as CategoryIcon,
  CheckCircle as CheckCircleIcon,
  ContactPhone as ContactPhoneIcon,
  Event as EventIcon,
  Info as InfoIcon,
  LocationOn as LocationOnIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Star as StarIcon,
} from "@mui/icons-material";
import eventApi from "../api/eventApi";
import registrationApi from "../api/registrationApi"; // 1. Import registrationApi
import {useAuth} from "../context/AuthContext";
import {toast} from "react-toastify";

export default function EventDetail() {
  const {eventId} = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Trạng thái đang đăng ký
  const [registrationStatus, setRegistrationStatus] = useState(null); // Lưu trạng thái đăng ký của user hiện tại
  const {user} = useAuth();

  const formatDate = (dateString) => {
    // ... (giữ nguyên hàm formatDate) ...
    if (!dateString) {
      return "N/A";
    }
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Hàm kiểm tra trạng thái đăng ký của user hiện tại cho sự kiện này
  const checkRegistration = async () => {
    if (user?.role !== 'volunteer') {
      return;
    } // Chỉ kiểm tra cho volunteer
    try {
      const response = await registrationApi.getMyRegistrations();
      const myRegistrations = response.data || [];
      const currentRegistration = myRegistrations.find(reg =>
          reg.eventId?.toString() === eventId && // So sánh eventId
          reg.volunteerId?.toString() === user.userId?.toString() && // So sánh userId
          reg.status !== 'cancelled' // Bỏ qua nếu đã hủy
      );
      if (currentRegistration) {
        setRegistrationStatus(currentRegistration.status); // Lưu trạng thái (pending, approved, ...)
      } else {
        setRegistrationStatus(null); // Chưa đăng ký hoặc đã hủy
      }
    } catch (err) {
      console.error("Lỗi khi kiểm tra đăng ký:", err);
      // Không cần báo lỗi ở đây, có thể user chưa đăng nhập hoặc API lỗi nhẹ
    }
  };

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setRegistrationStatus(null); // Reset trạng thái đăng ký khi tải lại
        const response = await eventApi.getById(eventId);
        setEvent(response.data);
        // Sau khi có event, kiểm tra trạng thái đăng ký của user
        if (user) {
          await checkRegistration();
        }
      } catch (err) {
        console.error("Error fetching event detail:", err);
        setError(
            "Không thể tải thông tin sự kiện. Sự kiện không tồn tại hoặc đã bị xóa.");
        toast.error("Không thể tải thông tin sự kiện.");
      } finally {
        setLoading(false);
      }
    };

    fetchEventDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId, user]); // Chạy lại khi eventId hoặc user thay đổi

  // 2. Cập nhật hàm xử lý đăng ký
  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      // Có thể thêm Dialog để nhập ghi chú (note) ở đây
      const payload = {note: ''}; // Gửi note rỗng nếu không có Dialog

      await registrationApi.register(eventId, payload);

      toast.success('Đăng ký tham gia sự kiện thành công! Vui lòng chờ duyệt.');
      // Cập nhật trạng thái nút -> báo đã đăng ký (pending)
      setRegistrationStatus('pending');
    } catch (err) {
      console.error("Error registering for event:", err);
      // Hiển thị lỗi cụ thể từ backend nếu có
      toast.error(err.response?.data?.error || err.response?.data?.message
          || 'Đăng ký thất bại. Bạn có thể đã đăng ký sự kiện này rồi.');
    } finally {
      setIsRegistering(false);
    }
  };

  // ----- Render UI -----

  // ... (phần render loading, error, event not found giữ nguyên) ...
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
          <Button component={RouterLink} to="/events" sx={{mt: 2}}>
            Quay lại danh sách sự kiện
          </Button>
        </Container>
    );
  }

  if (!event) {
    return (
        <Container sx={{py: 4}}>
          <Alert severity="warning">Không tìm thấy thông tin sự kiện.</Alert>
        </Container>
    );
  }

  const isVolunteer = user?.role === 'volunteer';
  const canRegister = event.status === 'approved' && (!event.maxVolunteers
      || (event.currentVolunteers || 0) < event.maxVolunteers);
  const eventEnded = event.endDate && new Date(event.endDate) < new Date();

  return (
      <Container maxWidth="lg" sx={{py: 4}}>
        <Paper elevation={3} sx={{p: {xs: 2, md: 4}, borderRadius: 2}}>
          {/* ... (Phần hiển thị thông tin sự kiện giữ nguyên) ... */}
          {/* Hình ảnh sự kiện (nếu có) */}
          {event.imageUrl && (
              <CardMedia
                  component="img"
                  height="300"
                  image={event.imageUrl}
                  alt={event.name}
                  sx={{borderRadius: 2, mb: 3, objectFit: 'contain'}}
              />
          )}

          {/* Tên sự kiện */}
          <Typography variant="h4" component="h1" gutterBottom
                      fontWeight="bold">
            {event.name}
          </Typography>

          {/* Thông tin cơ bản (Ngày, Địa điểm, Danh mục) */}
          <Grid container spacing={2} sx={{mb: 3, color: 'text.secondary'}}>
            <Grid item xs={12} md={4}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <EventIcon sx={{mr: 1}}/>
              <Typography variant="body1">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <LocationOnIcon sx={{mr: 1}}/>
              <Typography variant="body1">{event.location} {event.address
                  ? `- ${event.address}` : ''}</Typography>
            </Grid>
            <Grid item xs={12} md={4}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <CategoryIcon sx={{mr: 1}}/>
              <Chip label={event.category} size="small"/>
            </Grid>
            <Grid item xs={12} md={4}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <PersonIcon sx={{mr: 1}}/>
              <Typography variant="body1">Tổ chức bởi: {event.organizerName
                  || 'N/A'}</Typography>
            </Grid>
            {event.maxVolunteers != null && ( // Check cả null/undefined
                <Grid item xs={12} md={4}
                      sx={{display: 'flex', alignItems: 'center'}}>
                  <PeopleIcon sx={{mr: 1}}/>
                  <Typography variant="body1"
                              color={(event.currentVolunteers || 0)
                              >= event.maxVolunteers ? 'error'
                                  : 'text.secondary'}>
                    Số lượng: {event.currentVolunteers
                      || 0} / {event.maxVolunteers} tình nguyện viên
                    {(event.currentVolunteers || 0) >= event.maxVolunteers
                        && " (Đã đủ)"}
                  </Typography>
                </Grid>
            )}
            {/* Hiển thị trạng thái sự kiện */}
            <Grid item xs={12} md={4}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <Chip
                  label={statusLabels[event.status] || event.status}
                  color={statusColors[event.status] || "default"}
                  size="small"
              />
            </Grid>
          </Grid>

          <Divider sx={{my: 3}}/>

          {/* Mô tả chi tiết */}
          <Typography variant="h6" gutterBottom>Mô tả sự kiện</Typography>
          <Typography variant="body1" paragraph sx={{whiteSpace: 'pre-line'}}>
            {event.description || "Chưa có mô tả chi tiết."}
          </Typography>

          {/* Yêu cầu (nếu có) */}
          {event.requirements && (
              <>
                <Typography variant="h6" gutterBottom sx={{mt: 3}}>
                  <InfoIcon sx={{verticalAlign: 'middle', mr: 0.5}}/> Yêu cầu
                </Typography>
                <Typography variant="body1" paragraph
                            sx={{whiteSpace: 'pre-line'}}>
                  {event.requirements}
                </Typography>
              </>
          )}

          {/* Lợi ích (nếu có) */}
          {event.benefits && (
              <>
                <Typography variant="h6" gutterBottom sx={{mt: 3}}>
                  <StarIcon sx={{verticalAlign: 'middle', mr: 0.5}}/> Lợi ích
                  tham gia
                </Typography>
                <Typography variant="body1" paragraph
                            sx={{whiteSpace: 'pre-line'}}>
                  {event.benefits}
                </Typography>
              </>
          )}

          {/* Thông tin liên hệ (nếu có) */}
          {event.contactInfo && (
              <>
                <Typography variant="h6" gutterBottom sx={{mt: 3}}>
                  <ContactPhoneIcon
                      sx={{verticalAlign: 'middle', mr: 0.5}}/> Thông tin liên
                  hệ
                </Typography>
                <Typography variant="body1" paragraph>
                  {event.contactInfo}
                </Typography>
              </>
          )}

          {/* 3. Cập nhật logic hiển thị nút đăng ký */}
          {isVolunteer && !eventEnded && ( // Chỉ hiển thị nếu là volunteer và sự kiện chưa kết thúc
              <Box sx={{mt: 4, textAlign: 'center'}}>
                {registrationStatus ? ( // Nếu đã đăng ký (pending hoặc approved)
                    <Button
                        variant="contained"
                        color={registrationStatus === 'approved' ? 'success'
                            : 'warning'} // Màu xanh nếu approved, vàng nếu pending
                        size="large"
                        disabled // Không cho nhấn lại
                        startIcon={<CheckCircleIcon/>}
                    >
                      {registrationStatus === 'approved' ? 'Đã được duyệt'
                          : 'Đang chờ duyệt'}
                    </Button>
                ) : ( // Nếu chưa đăng ký
                    canRegister ? ( // Và sự kiện còn chỗ, đã duyệt
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            onClick={handleRegister}
                            disabled={isRegistering} // Vô hiệu hóa khi đang gửi request
                        >
                          {isRegistering ? 'Đang xử lý...' : 'Đăng ký tham gia'}
                        </Button>
                    ) : ( // Nếu hết chỗ hoặc chưa duyệt
                        <Button variant="contained" color="inherit" size="large"
                                disabled>
                          {event.status !== 'approved'
                              ? 'Sự kiện chưa được duyệt' : 'Đã đủ số lượng'}
                        </Button>
                    )
                )}
              </Box>
          )}
          {eventEnded && ( // Hiển thị thông báo nếu sự kiện đã kết thúc
              <Alert severity="info" sx={{mt: 4}}>Sự kiện này đã kết
                thúc.</Alert>
          )}


          {/* Nút quay lại */}
          <Box sx={{mt: 4}}>
            <Button component={RouterLink} to="/events">
              ← Quay lại danh sách sự kiện
            </Button>
          </Box>
        </Paper>
      </Container>
  );
}

// Thêm các hằng số màu sắc và nhãn trạng thái (lấy từ EventCard nếu bạn muốn dùng chung)
const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
  completed: "info"
};

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
  completed: "Hoàn thành"
};