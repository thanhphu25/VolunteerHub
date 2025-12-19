// src/pages/EventDetail.jsx
import React, {useEffect, useState} from "react";
import {Link as RouterLink, useNavigate, useParams} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  CardMedia,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
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
import EventDiscussion from '../components/EventDiscussion'; // Import component
import {useAuth} from "../context/AuthContext";
import {toast} from "react-toastify";
import profileApi from "../api/profileApi";

export default function EventDetail() {
  const {eventId} = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isRegistering, setIsRegistering] = useState(false); // Trạng thái đang đăng ký
  const [isCancelling, setIsCancelling] = useState(false); // Trạng thái đang hủy đăng ký
  const [registration, setRegistration] = useState(null); // Lưu toàn bộ thông tin đăng ký
  const [lastRegistrationStatus, setLastRegistrationStatus] = useState(null);
  const [followingOrganizer, setFollowingOrganizer] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [approving, setApproving] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
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
        if (user?.role !== 'volunteer') return;

        try {
            const response = await registrationApi.getMyRegistrationForEvent(eventId);
            const data = response.data;

            // --- SỬA ĐOẠN NÀY: Lưu tất cả trạng thái, không lọc bỏ completed/rejected ---
            if (data && data.status) {
                setRegistration(data);
                setLastRegistrationStatus(data.status);
            } else {
                setRegistration(null);
                setLastRegistrationStatus(null);
            }
            // ---------------------------------------------------------------------------

        } catch (err) {
            if (err.response?.status === 404) {
                setRegistration(null);
                setLastRegistrationStatus(null);
            } else {
                console.error("Lỗi khi kiểm tra đăng ký:", err);
            }
        }
  };

  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setLoading(true);
        setError(null);
        setRegistration(null); // Reset trạng thái đăng ký khi tải lại
        setLastRegistrationStatus(null);
        const response = await eventApi.getById(eventId);
        setEvent(response.data);
        // Sau khi có event, kiểm tra trạng thái đăng ký của user
        if (user) {
          await checkRegistration();
          if (user.role === 'volunteer' && response.data?.organizerId) {
            await checkFollowStatus(response.data.organizerId);
          }
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

      const response = await registrationApi.register(eventId, payload);
      setRegistration(response.data); // Lưu thông tin đăng ký mới
      setLastRegistrationStatus(response.data?.status || null);
      toast.success('Đăng ký tham gia sự kiện thành công! Vui lòng chờ duyệt.');
    } catch (err) {
      console.error("Error registering for event:", err);
      // Hiển thị lỗi cụ thể từ backend nếu có
      toast.error(err.response?.data?.error || err.response?.data?.message
          || 'Đăng ký thất bại. Bạn có thể đã đăng ký sự kiện này rồi.');
    } finally {
      setIsRegistering(false);
    }
  };

  // Hàm xử lý hủy đăng ký
  const handleCancelRegistration = async () => {
    if (!registration) {
      return;
    }

    const confirmed = window.confirm(
        'Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?');
    if (!confirmed) {
      return;
    }

    setIsCancelling(true);
    try {
      await registrationApi.cancel(eventId, registration.id);
      setRegistration(null); // Xóa thông tin đăng ký
      setLastRegistrationStatus('cancelled');
      toast.success('Hủy đăng ký thành công!');
    } catch (err) {
      console.error("Error cancelling registration:", err);
      toast.error(err.response?.data?.error || err.response?.data?.message
          || 'Hủy đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
    }
  };

  const checkFollowStatus = async (organizerId) => {
    try {
      setFollowLoading(true);
      const res = await profileApi.getFollowedOrganizers();
      const organizers = res.data ?? [];
      setFollowingOrganizer(organizers.some(item => item.organizerId === organizerId));
    } catch (err) {
      console.error("Failed to load follow status", err);
    } finally {
      setFollowLoading(false);
    }
  };

  const handleToggleFollow = async () => {
    if (!event?.organizerId) return;
    try {
      setFollowLoading(true);
      if (followingOrganizer) {
        await profileApi.unfollowOrganizer(event.organizerId);
        setFollowingOrganizer(false);
        toast.success("Đã hủy theo dõi tổ chức này");
      } else {
        await profileApi.followOrganizer(event.organizerId);
        setFollowingOrganizer(true);
        toast.success("Đã theo dõi tổ chức này");
      }
    } catch (err) {
      console.error("Failed to toggle follow", err);
      toast.error(err.response?.data?.error || "Không thể cập nhật theo dõi");
    } finally {
      setFollowLoading(false);
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
  const isAdmin = user?.role === 'admin';

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
            <Grid size={{xs: 12, md: 4}}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <EventIcon sx={{mr: 1}}/>
              <Typography variant="body1">
                {formatDate(event.startDate)} - {formatDate(event.endDate)}
              </Typography>
            </Grid>
            <Grid size={{xs: 12, md: 4}}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <LocationOnIcon sx={{mr: 1}}/>
              <Typography variant="body1">{event.location} {event.address
                  ? `- ${event.address}` : ''}</Typography>
            </Grid>
            <Grid size={{xs: 12, md: 4}}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <CategoryIcon sx={{mr: 1}}/>
              <Chip label={event.category} size="small"/>
            </Grid>
            <Grid size={{xs: 12, md: 4}}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <PersonIcon sx={{mr: 1}}/>
              <Typography variant="body1">Tổ chức bởi: {event.organizerName
                  || 'N/A'}</Typography>
              {isVolunteer && event.organizerId && (
                  <Button
                      variant={followingOrganizer ? "outlined" : "contained"}
                      color={followingOrganizer ? "secondary" : "primary"}
                      size="small"
                      sx={{ml: 2}}
                      onClick={handleToggleFollow}
                      disabled={followLoading}
                  >
                    {followingOrganizer ? 'Hủy theo dõi' : 'Theo dõi tổ chức'}
                  </Button>
              )}
            </Grid>
            <Grid size={{xs: 12, md: 4}}
                  sx={{display: 'flex', alignItems: 'center'}}>
              <PeopleIcon sx={{mr: 1}}/>
              <Typography variant="body1"
                          color={event.maxVolunteers != null && (event.currentVolunteers || 0)
                          >= event.maxVolunteers ? 'error'
                              : 'text.secondary'}>
                {event.maxVolunteers != null ? (
                    <>
                      Số lượng: {event.currentVolunteers || 0} / {event.maxVolunteers} tình nguyện viên
                      {(event.currentVolunteers || 0) >= event.maxVolunteers && " (Đã đủ)"}
                    </>
                ) : (
                    <>Đã có {event.currentVolunteers || 0} tình nguyện viên đăng ký</>
                )}
              </Typography>
            </Grid>
            {/* Hiển thị trạng thái sự kiện */}
            <Grid size={{xs: 12, md: 4}}
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
            {/* LOGIC HIỂN THỊ NÚT ĐĂNG KÝ VÀ TRẠNG THÁI */}
            {isVolunteer && (
                <Box sx={{mt: 4, textAlign: 'center'}}>
                    {registration ? (
                        // === TRƯỜNG HỢP 1: ĐÃ CÓ DỮ LIỆU ĐĂNG KÝ ===
                        <Box display="flex" flexDirection="column" gap={2} alignItems="center">

                            {/* 1. Trạng thái: Đã duyệt */}
                            {registration.status === 'approved' && (
                                <Button variant="contained" color="success" size="large" disabled startIcon={<CheckCircleIcon/>}>
                                    Đã tham gia (Chờ sự kiện)
                                </Button>
                            )}

                            {/* 2. Trạng thái: Chờ duyệt */}
                            {registration.status === 'pending' && (
                                <Button variant="contained" color="warning" size="large" disabled>
                                    Đang chờ duyệt
                                </Button>
                            )}

                            {/* 3. Trạng thái: Hoàn thành (CÓ MẶT) */}
                            {registration.status === 'completed' && (
                                <Button variant="contained" color="primary" size="large" disabled startIcon={<CheckCircleIcon/>}>
                                    Đã hoàn thành sự kiện
                                </Button>
                            )}

                            {/* 4. Trạng thái: Từ chối / Vắng mặt */}
                            {registration.status === 'rejected' && (
                                <Button variant="contained" color="error" size="large" disabled>
                                    Không hoàn thành / Bị từ chối
                                </Button>
                            )}

                            {/* Nút Hủy: Chỉ hiện khi Chờ duyệt hoặc Đã duyệt */}
                            {(registration.status === 'pending' || registration.status === 'approved') && !eventEnded && (
                                <Button
                                    variant="outlined"
                                    color="error"
                                    size="medium"
                                    onClick={handleCancelRegistration}
                                    disabled={isCancelling}
                                >
                                    {isCancelling ? 'Đang hủy...' : 'Hủy đăng ký'}
                                </Button>
                            )}

                            {/* --- KHUNG HIỂN THỊ NHẬN XÉT TỪ BTC (MỚI) --- */}
                            {(registration.status === 'completed' || registration.status === 'rejected') &&
                                (registration.completionNote || registration.note) && (
                                    <Box sx={{ mt: 2, width: '100%', maxWidth: 600 }}>
                                        <Alert
                                            severity={registration.status === 'completed' ? "success" : "error"}
                                            variant="outlined"
                                            sx={{ borderRadius: 2, textAlign: 'left' }}
                                        >
                                            <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                                                Phản hồi từ Ban Tổ Chức:
                                            </Typography>
                                            <Typography variant="body2">
                                                {registration.completionNote || registration.note}
                                            </Typography>
                                        </Alert>
                                    </Box>
                                )}
                        </Box>
                    ) : (
                        // === TRƯỜNG HỢP 2: CHƯA ĐĂNG KÝ (HOẶC ĐÃ HỦY) ===
                        !eventEnded ? (
                            canRegister ? (
                                <>
                                    {lastRegistrationStatus === 'rejected' && (
                                        <Alert severity="warning" sx={{mb: 2, display: 'inline-flex'}}>
                                            Bạn từng bị từ chối ở sự kiện này. Bạn có thể thử đăng ký lại.
                                        </Alert>
                                    )}
                                    <br />
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        size="large"
                                        onClick={handleRegister}
                                        disabled={isRegistering}
                                    >
                                        {isRegistering ? 'Đang xử lý...' : 'Đăng ký tham gia'}
                                    </Button>
                                </>
                            ) : (
                                <Button variant="contained" color="inherit" size="large" disabled>
                                    {event.status !== 'approved' ? 'Sự kiện chưa được duyệt' : 'Đã đủ số lượng'}
                                </Button>
                            )
                        ) : (
                            <Alert severity="info" sx={{mt: 2, display: 'inline-flex'}}>Sự kiện này đã kết thúc.</Alert>
                        )
                    )}
                </Box>
            )}
          {eventEnded && ( // Hiển thị thông báo nếu sự kiện đã kết thúc
              <Alert severity="info" sx={{mt: 4}}>Sự kiện này đã kết
                thúc.</Alert>
          )}

          {isAdmin && (
              <Box sx={{mt: 4, display: 'flex', gap: 2, flexWrap: 'wrap'}}>
                {event.status === 'pending' && (
                    <>
                      <Button
                          variant="contained"
                          color="success"
                          onClick={async () => {
                            setApproving(true);
                            try {
                              const res = await eventApi.approve(eventId);
                              setEvent(res.data);
                              toast.success('Đã duyệt sự kiện');
                            } catch (err) {
                              console.error('Approve event failed', err);
                              toast.error(err.response?.data?.error || 'Không thể duyệt sự kiện');
                            } finally {
                              setApproving(false);
                            }
                          }}
                          disabled={approving || rejecting}
                      >
                        {approving ? 'Đang duyệt...' : 'Duyệt'}
                      </Button>

                      <Button
                          variant="outlined"
                          color="error"
                          onClick={() => {
                            setRejectReason("");
                            setRejectDialogOpen(true);
                          }}
                          disabled={approving || rejecting}
                      >
                        Từ chối
                      </Button>
                    </>
                )}
              </Box>
          )}


          {event.status === 'approved' && (
              <EventDiscussion eventId={eventId} event={event} registration={registration}/>
          )}


          {/* Nút quay lại */}
          <Box sx={{mt: 4}}>
            <Button component={RouterLink} to="/events">
              ← Quay lại danh sách sự kiện
            </Button>
          </Box>
        </Paper>

        <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Từ chối sự kiện</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{mt: 1}}>
              <Typography variant="body2" color="text.secondary">
                Vui lòng nhập lý do từ chối để thông báo tới tổ chức.
              </Typography>
              <TextField
                  label="Lý do từ chối"
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  multiline
                  minRows={3}
                  fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
            <Button
                variant="contained"
                color="error"
                disabled={!rejectReason.trim() || rejecting}
                onClick={async () => {
                  setRejecting(true);
                  try {
                    const res = await eventApi.reject(eventId, {reason: rejectReason.trim()});
                    setEvent(res.data);
                    toast.info('Đã từ chối sự kiện');
                    setRejectDialogOpen(false);
                  } catch (err) {
                    console.error('Reject event failed', err);
                    toast.error(err.response?.data?.error || 'Không thể từ chối sự kiện');
                  } finally {
                    setRejecting(false);
                  }
                }}
            >
              {rejecting ? 'Đang xử lý...' : 'Từ chối sự kiện'}
            </Button>
          </DialogActions>
        </Dialog>
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