// src/pages/EventDetail.jsx
import React, { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate, useParams } from "react-router-dom";
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
import registrationApi from "../api/registrationApi";
import EventDiscussion from "../components/EventDiscussion";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import profileApi from "../api/profileApi";

export default function EventDetail() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isRegistering, setIsRegistering] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [registration, setRegistration] = useState(null);
    const [lastRegistrationStatus, setLastRegistrationStatus] = useState(null);
    const [followingOrganizer, setFollowingOrganizer] = useState(false);
    const [followLoading, setFollowLoading] = useState(false);
    const [approving, setApproving] = useState(false);
    const [rejecting, setRejecting] = useState(false);
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const { user } = useAuth();

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const checkRegistration = async () => {
        if (user?.role !== 'volunteer') return;
        try {
            const response = await registrationApi.getMyRegistrationForEvent(eventId);
            const data = response.data;
            if (data && data.status) {
                setRegistration(data);
                setLastRegistrationStatus(data.status);
            } else {
                setRegistration(null);
                setLastRegistrationStatus(null);
            }
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
                const response = await eventApi.getById(eventId);
                setEvent(response.data);
                if (user) {
                    await checkRegistration();
                    if (user.role === "volunteer" && response.data?.organizerId) {
                        await checkFollowStatus(response.data.organizerId);
                    }
                }
            } catch (err) {
                setError("Không thể tải thông tin sự kiện. Sự kiện không tồn tại hoặc đã bị xóa.");
                toast.error("Không thể tải thông tin sự kiện.");
            } finally {
                setLoading(false);
            }
        };
        fetchEventDetail();
    }, [eventId, user]);

    const handleRegister = async () => {
        setIsRegistering(true);
        try {
            const response = await registrationApi.register(eventId, { note: "" });
            setRegistration(response.data);
            setLastRegistrationStatus(response.data?.status || null);
            toast.success("Đăng ký tham gia thành công! Vui lòng chờ duyệt.");
        } catch (err) {
            toast.error(err.response?.data?.error || "Đăng ký thất bại.");
        } finally {
            setIsRegistering(false);
        }
    };

    const handleCancelRegistration = async () => {
        if (!registration) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?")) return;
        setIsCancelling(true);
        try {
            await registrationApi.cancel(eventId, registration.id);
            setRegistration(null);
            setLastRegistrationStatus("cancelled");
            toast.success("Hủy đăng ký thành công!");
        } catch (err) {
            toast.error(err.response?.data?.error || "Hủy đăng ký thất bại.");
        } finally {
            setIsCancelling(false);
        }
    };

    const checkFollowStatus = async (organizerId) => {
        try {
            setFollowLoading(true);
            const res = await profileApi.getFollowedOrganizers();
            const organizers = res.data ?? [];
            setFollowingOrganizer(organizers.some((item) => item.organizerId === organizerId));
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
            toast.error("Không thể cập nhật theo dõi");
        } finally {
            setFollowLoading(false);
        }
    };

    if (loading) return (
        <Container sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
            <CircularProgress />
        </Container>
    );

    if (error) return (
        <Container sx={{ py: 4 }}>
            <Alert severity="error">{error}</Alert>
            <Button component={RouterLink} to="/events" sx={{ mt: 2 }}>Quay lại danh sách</Button>
        </Container>
    );

    const isVolunteer = user?.role === "volunteer";
    const canRegister = event?.status === "approved" && (!event?.maxVolunteers || (event?.currentVolunteers || 0) < event?.maxVolunteers);
    const eventEnded = event?.endDate && new Date(event?.endDate) < new Date();
    const isAdmin = user?.role === "admin";

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 }, borderRadius: 3 }}>

                {/* 1. HÌNH ẢNH */}
                {event.imageUrl && (
                    <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
                        <CardMedia
                            component="img"
                            // --- SỬA DÒNG NÀY ---
                            // Kiểm tra: Nếu là link online (http...) thì giữ nguyên
                            // Nếu là link local (/uploads...) thì thêm localhost:8080 vào trước
                            image={event.imageUrl.startsWith('http') ? event.imageUrl : `http://localhost:8080${event.imageUrl}`}
                            // --------------------

                            alt={event.name}
                            sx={{
                                maxWidth: { xs: "100%", md: "600px" },
                                maxHeight: "400px",
                                objectFit: "contain",
                                borderRadius: 2,
                                boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                                bgcolor: "#f5f5f5",
                            }}
                            // Thêm xử lý lỗi nếu ảnh không tải được
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://placehold.co/600x400?text=No+Image";
                            }}
                        />
                    </Box>
                )}

                {/* 2. TIÊU ĐỀ & TRẠNG THÁI */}
                <Box sx={{ mb: 3 }}>
                    <Stack direction="row" spacing={1} sx={{ mb: 1 }}>

                        {/* LOGIC HIỂN THỊ CHIP TRẠNG THÁI MỚI */}
                        {(() => {
                            const isEnded = event.endDate && new Date(event.endDate) < new Date();
                            const displayStatus = (event.status === 'approved' && isEnded) ? 'completed' : event.status;

                            return (
                                <Chip
                                    label={statusLabels[displayStatus] || displayStatus}
                                    color={statusColors[displayStatus] || "default"}
                                    size="small"
                                    sx={{ fontWeight: "bold" }}
                                />
                            );
                        })()}

                        <Chip label={event.category} size="small" icon={<CategoryIcon />} />
                    </Stack>
                    <Typography variant="h3" component="h1" fontWeight="800" gutterBottom color="primary.dark">
                        {event.name}
                    </Typography>
                </Box>

                {/* 3. THÔNG TIN GRID */}
                <Grid container spacing={3} sx={{ mb: 4, p: 2, bgcolor: "#f8f9fa", borderRadius: 2 }}>
                    <Grid item xs={12} md={6} lg={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <EventIcon color="primary" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Thời gian</Typography>
                                <Typography variant="body1" fontWeight="500">{formatDate(event.startDate)} - {formatDate(event.endDate)}</Typography>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <LocationOnIcon color="error" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Địa điểm</Typography>
                                <Typography variant="body1" fontWeight="500">{event.location} {event.address ? `(${event.address})` : ""}</Typography>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={6} lg={4}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <PeopleIcon color="info" />
                            <Box>
                                <Typography variant="caption" color="text.secondary">Số lượng</Typography>
                                <Typography variant="body1" fontWeight="500" color={(event.currentVolunteers || 0) >= (event.maxVolunteers || 999) ? "error.main" : "inherit"}>
                                    {event.maxVolunteers ? `${event.currentVolunteers || 0} / ${event.maxVolunteers} tình nguyện viên` : `${event.currentVolunteers || 0} đã đăng ký`}
                                </Typography>
                            </Box>
                        </Stack>
                    </Grid>
                    <Grid item xs={12} md={12} lg={4}>
                        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between" sx={{ width: "100%" }}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <PersonIcon color="action" />
                                <Box>
                                    <Typography variant="caption" color="text.secondary">Tổ chức bởi</Typography>
                                    <Typography variant="body1" fontWeight="bold">{event.organizerName || "N/A"}</Typography>
                                </Box>
                            </Stack>
                            {isVolunteer && event.organizerId && (
                                <Button variant={followingOrganizer ? "outlined" : "contained"} size="small" onClick={handleToggleFollow} disabled={followLoading} sx={{ borderRadius: 5 }}>
                                    {followingOrganizer ? "Đã theo dõi" : "Theo dõi"}
                                </Button>
                            )}
                        </Stack>
                    </Grid>
                </Grid>

                <Divider sx={{ my: 4 }} />

                {/* 4. MÔ TẢ & YÊU CẦU */}
                <Grid container spacing={5}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" fontWeight="bold" gutterBottom sx={{ borderLeft: "4px solid #00bfa5", pl: 2, mb: 2 }}>Mô tả sự kiện</Typography>
                        <Typography variant="body1" paragraph sx={{ whiteSpace: "pre-line", lineHeight: 1.8 }}>{event.description || "Chưa có mô tả chi tiết."}</Typography>
                        {event.requirements && (
                            <>
                                <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mt: 4 }}><InfoIcon sx={{ verticalAlign: "middle", mr: 1, color: "primary.main" }} /> Yêu cầu tham gia</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line", bgcolor: "#fff9c4", p: 2, borderRadius: 1 }}>{event.requirements}</Typography>
                            </>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        {event.benefits && (
                            <Paper variant="outlined" sx={{ p: 2, bgcolor: "#f0f4f8", mb: 3 }}>
                                <Typography variant="h6" fontWeight="bold" gutterBottom><StarIcon sx={{ verticalAlign: "middle", mr: 1, color: "#fbc02d" }} /> Quyền lợi</Typography>
                                <Typography variant="body2" sx={{ whiteSpace: "pre-line" }}>{event.benefits}</Typography>
                            </Paper>
                        )}
                        {event.contactInfo && (
                            <Box>
                                <Typography variant="h6" fontWeight="bold" gutterBottom><ContactPhoneIcon sx={{ verticalAlign: "middle", mr: 1 }} /> Liên hệ</Typography>
                                <Typography variant="body2" color="text.secondary">{event.contactInfo}</Typography>
                            </Box>
                        )}
                    </Grid>
                </Grid>

                {/* 5. LOGIC NÚT ĐĂNG KÝ */}
                {isVolunteer && (
                    <Box sx={{ mt: 6, textAlign: 'center' }}>
                        {registration ? (
                            <Box display="flex" flexDirection="column" gap={2} alignItems="center">
                                {registration.status === 'approved' && (
                                    <Button variant="contained" color="success" size="large" disabled startIcon={<CheckCircleIcon />}>Đã tham gia (Chờ sự kiện)</Button>
                                )}
                                {registration.status === 'pending' && (
                                    <Button variant="contained" color="warning" size="large" disabled>Đang chờ duyệt</Button>
                                )}
                                {registration.status === 'completed' && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        disabled
                                        startIcon={<CheckCircleIcon />}
                                        sx={{
                                            bgcolor: "success.main", // Màu nền xanh lá
                                            color: "white",          // Màu chữ trắng
                                            "&.Mui-disabled": {      // QUAN TRỌNG: Ghi đè màu mặc định của disabled
                                                bgcolor: "success.main",
                                                color: "white",
                                                opacity: 0.9           // Giảm độ mờ một chút nếu muốn
                                            }
                                        }}
                                    >
                                        Đã hoàn thành sự kiện
                                    </Button>
                                )}
                                {registration.status === 'rejected' && (
                                    <Button
                                        variant="contained"
                                        size="large"
                                        disabled
                                        sx={{
                                            bgcolor: "error.main", // Màu nền đỏ
                                            color: "white",
                                            "&.Mui-disabled": {
                                                bgcolor: "error.main",
                                                color: "white"
                                            }
                                        }}
                                    >
                                        Không hoàn thành / Bị từ chối
                                    </Button>
                                )}

                                {(registration.status === 'pending' || registration.status === 'approved') && !eventEnded && (
                                    <Button variant="outlined" color="error" size="medium" onClick={handleCancelRegistration} disabled={isCancelling}>
                                        {isCancelling ? 'Đang hủy...' : 'Hủy đăng ký'}
                                    </Button>
                                )}

                                {/* PHẢN HỒI TỪ BTC */}
                                {(registration.status === 'completed' || registration.status === 'rejected') && (registration.completionNote || registration.organizerNote) && (
                                    <Box sx={{ mt: 2, width: '100%', maxWidth: 600 }}>
                                        <Alert severity={registration.status === 'completed' ? "success" : "error"} variant="outlined" sx={{ borderRadius: 2, textAlign: 'left' }}>
                                            <Typography variant="subtitle2" fontWeight="bold">Phản hồi từ Ban Tổ Chức:</Typography>
                                            <Typography variant="body2">{registration.completionNote || registration.organizerNote}</Typography>
                                        </Alert>
                                    </Box>
                                )}
                            </Box>
                        ) : (
                            !eventEnded ? (
                                canRegister ? (
                                    <>
                                        {lastRegistrationStatus === 'rejected' && (
                                            <Alert severity="warning" sx={{ mb: 2, display: 'inline-flex' }}>Bạn từng bị từ chối ở sự kiện này. Bạn có thể thử đăng ký lại.</Alert>
                                        )}
                                        <br />
                                        <Button variant="contained" color="primary" size="large" onClick={handleRegister} disabled={isRegistering}>
                                            {isRegistering ? 'Đang xử lý...' : 'Đăng ký tham gia'}
                                        </Button>
                                    </>
                                ) : (
                                    <Button variant="contained" color="inherit" size="large" disabled>
                                        {event.status !== 'approved' ? 'Sự kiện chưa được duyệt' : 'Đã đủ số lượng'}
                                    </Button>
                                )
                            ) : (
                                <Alert severity="info" sx={{ mt: 2, display: 'inline-flex' }}>Sự kiện này đã kết thúc.</Alert>
                            )
                        )}
                    </Box>
                )}

                {isAdmin && event.status === 'pending' && (
                    <Stack direction="row" spacing={2} sx={{ mt: 4, justifyContent: 'center' }}>
                        <Button variant="contained" color="success" onClick={async () => {
                            setApproving(true);
                            try {
                                const res = await eventApi.approve(eventId);
                                setEvent(res.data);
                                toast.success('Đã duyệt sự kiện');
                            } catch (err) {
                                toast.error('Không thể duyệt sự kiện');
                            } finally { setApproving(false); }
                        }} disabled={approving || rejecting}>Duyệt</Button>
                        <Button variant="outlined" color="error" onClick={() => setRejectDialogOpen(true)} disabled={approving || rejecting}>Từ chối</Button>
                    </Stack>
                )}

                {/* LOGIC HIỂN THỊ THẢO LUẬN */}
                {(event.status === 'approved' || (event.status === 'approved' && eventEnded)) && (
                    <EventDiscussion eventId={eventId} event={event} registration={registration} />
                )}

                <Box sx={{ mt: 4 }}>
                    <Button component={RouterLink} to="/events">← Quay lại danh sách sự kiện</Button>
                </Box>
            </Paper>

            {/* DIALOG TỪ CHỐI */}
            <Dialog open={rejectDialogOpen} onClose={() => setRejectDialogOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle>Từ chối sự kiện</DialogTitle>
                <DialogContent dividers>
                    <TextField label="Lý do từ chối" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} multiline minRows={3} fullWidth sx={{ mt: 1 }} />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRejectDialogOpen(false)}>Hủy</Button>
                    <Button variant="contained" color="error" disabled={!rejectReason.trim() || rejecting} onClick={async () => {
                        setRejecting(true);
                        try {
                            const res = await eventApi.reject(eventId, { reason: rejectReason.trim() });
                            setEvent(res.data);
                            toast.info("Đã từ chối sự kiện");
                            setRejectDialogOpen(false);
                        } finally { setRejecting(false); }
                    }}>Xác nhận từ chối</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

// Định nghĩa màu và nhãn cho trạng thái
const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "error",
    cancelled: "default",
    completed: "info" // Đã đổi sang màu xanh dương (info) cho nổi bật hơn màu xám
};

const statusLabels = {
    pending: "Chờ duyệt",
    approved: "Sẵn sàng",
    rejected: "Bị từ chối",
    cancelled: "Đã hủy",
    completed: "Đã kết thúc" // Đổi label thành Đã kết thúc
};