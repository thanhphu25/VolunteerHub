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
import registrationApi from "../api/registrationApi";
import {toast} from "react-toastify";
import {useAuth} from "../context/AuthContext";

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
    const [cancellingId, setCancellingId] = useState(null);
    const {user} = useAuth();

    const fetchMyRegistrations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await registrationApi.getMyRegistrations();
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
        if (user) {
            fetchMyRegistrations();
        } else {
            setLoading(false);
            setError("Vui lòng đăng nhập để xem danh sách đăng ký.");
        }
    }, [fetchMyRegistrations, user]);

    const handleCancelRegistration = async (eventId, registrationId) => {
        if (cancellingId) return;
        if (!window.confirm("Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện này?")) return;

        setCancellingId(registrationId);
        try {
            await registrationApi.cancel(eventId, registrationId);
            toast.success("Hủy đăng ký thành công!");
            setRegistrations(prev =>
                prev.map(reg => reg.id === registrationId ? {...reg, status: 'cancelled'} : reg)
            );
        } catch (err) {
            console.error("Lỗi khi hủy đăng ký:", err);
            toast.error(err.response?.data?.error || "Hủy đăng ký thất bại.");
        } finally {
            setCancellingId(null);
        }
    };

    if (loading) {
        return (
            <Container>
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
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
                    <RouterLink to="/events" style={{ marginLeft: '5px' }}>Xem danh sách sự kiện</RouterLink>
                </Alert>
            ) : (
                <Paper elevation={2}>
                    <List disablePadding>
                        {registrations.map((reg, index) => {
                            const canCancel = (reg.status === 'pending' || reg.status === 'approved');

                            return (
                                <React.Fragment key={reg.id}>
                                    <ListItem alignItems="flex-start">
                                        <ListItemText
                                            primary={
                                                <Typography component="span" variant="h6">
                                                    <RouterLink to={`/events/${reg.eventId}`}
                                                                style={{
                                                                    textDecoration: 'none',
                                                                    color: '#1976d2',
                                                                    fontWeight: 'bold'
                                                                }}>
                                                        {reg.eventName || `Sự kiện #${reg.eventId}`}
                                                    </RouterLink>
                                                </Typography>
                                            }
                                            secondary={
                                                <>
                                                    <Typography sx={{display: 'block', mt: 0.5}} component="span" variant="body2" color="text.primary">
                                                        Ngày đăng ký: {formatDate(reg.registeredAt)}
                                                    </Typography>

                                                    {reg.approvedAt && reg.status === 'approved' && (
                                                        <Typography sx={{display: 'block'}} component="span" variant="caption" color="text.secondary">
                                                            Ngày duyệt: {formatDate(reg.approvedAt)}
                                                        </Typography>
                                                    )}

                                                    {reg.completedAt && reg.status === 'completed' && (
                                                        <Typography sx={{display: 'block'}} component="span" variant="caption" color="text.secondary">
                                                            Ngày hoàn thành: {formatDate(reg.completedAt)}
                                                        </Typography>
                                                    )}

                                                    {reg.cancelledAt && reg.status === 'cancelled' && (
                                                        <Typography sx={{display: 'block'}} component="span" variant="caption" color="text.secondary">
                                                            Ngày hủy: {formatDate(reg.cancelledAt)}
                                                        </Typography>
                                                    )}

                                                    {/* --- HIỂN THỊ GHI CHÚ CỦA TÌNH NGUYỆN VIÊN --- */}
                                                    {reg.note && (
                                                        <Typography
                                                            sx={{ display: 'block', fontStyle: 'italic', mt: 0.5 }}
                                                            component="span"
                                                            variant="caption"
                                                            color="text.secondary"
                                                        >
                                                            Ghi chú của bạn: "{reg.note}"
                                                        </Typography>
                                                    )}

                                                    {/* --- ✅ HIỂN THỊ PHẢN HỒI TỪ BTC (MỚI) --- */}
                                                    {reg.completionNote && (
                                                        <Box sx={{ mt: 1, p: 1, bgcolor: '#f0f7ff', borderRadius: 1, borderLeft: '4px solid #1976d2' }}>
                                                            <Typography component="div" variant="body2" color="primary.main" fontWeight="bold">
                                                                Phản hồi từ BTC:
                                                            </Typography>
                                                            <Typography component="div" variant="body2" color="text.primary">
                                                                {reg.completionNote}
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                    {/* ----------------------------------------- */}
                                                </>
                                            }
                                        />
                                        <Box sx={{textAlign: 'right', ml: 2, minWidth: '100px'}}>
                                            <Chip
                                                label={statusLabels[reg.status] || reg.status}
                                                color={statusColors[reg.status] || "default"}
                                                size="small"
                                                sx={{mb: 1}}
                                            />
                                            {canCancel && (
                                                <Tooltip title="Hủy đăng ký">
                                <span>
                                  <IconButton
                                      edge="end"
                                      aria-label="hủy đăng ký"
                                      onClick={() => handleCancelRegistration(reg.eventId, reg.id)}
                                      disabled={cancellingId === reg.id}
                                      color="error"
                                      size="small"
                                  >
                                    {cancellingId === reg.id ? <CircularProgress size={20} color="inherit"/> : <CancelIcon/>}
                                    </IconButton>
                                </span>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </ListItem>
                                    {index < registrations.length - 1 && <Divider component="li"/>}
                                </React.Fragment>
                            );
                        })}
                    </List>
                </Paper>
            )}
        </Container>
    );
}