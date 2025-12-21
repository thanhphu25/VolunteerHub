/**
 * EventRegistrations Page
 * Organizer/Admin page for managing event registrations and volunteer attendance.
 * Displays registered volunteers in a table with approval/rejection controls.
 * Allows recording volunteer attendance with optional notes.
 *
 * @component
 * @returns {JSX.Element} Event registrations management page with volunteer table
 */
import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Alert,
    Box,
    Button,
    Chip,
    CircularProgress,
    Container,
    IconButton,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
    Dialog, DialogTitle, DialogContent, DialogActions,
    FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, TextField,
    Stack
} from "@mui/material";
import {
    ArrowBack as BackIcon,
    Cancel as RejectIcon,
    CheckCircle as ApproveIcon,
    EventAvailable as AttendanceIcon
} from "@mui/icons-material";
import registrationApi from "../../api/registrationApi";
import eventApi from "../../api/eventApi";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";

export default function EventRegistrations() {
    const { eventId } = useParams();

    const navigate = useNavigate();
    const { language } = useLanguage();
    const [registrations, setRegistrations] = useState([]);
    const [eventName, setEventName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatingId, setUpdatingId] = useState(null);

    const [attendanceOpen, setAttendanceOpen] = useState(false);
    const [selectedReg, setSelectedReg] = useState(null);
    const [attendanceNote, setAttendanceNote] = useState('');
    const [isPresent, setIsPresent] = useState(true);

    const statusLabels = {
        pending: { vi: "Chờ duyệt", en: "Pending" },
        approved: { vi: "Đã duyệt", en: "Approved" },
        rejected: { vi: "Vắng mặt", en: "Rejected" },
        cancelled: { vi: "Đã hủy", en: "Cancelled" },
        completed: { vi: "Hoàn thành", en: "Completed" },
    };

    const statusColors = {
        pending: "warning",
        approved: "success",
        rejected: "error",
        cancelled: "default",
        completed: "info",
    };

    const fetchRegistrations = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            try {
                const eventRes = await eventApi.getById(eventId);
                setEventName(eventRes.data?.name || (language === "vi" ? `Sự kiện #${eventId}` : `Event #${eventId}`));
            } catch (eventErr) {
                console.warn("Không thể lấy tên sự kiện:", eventErr);
            }
            const response = await registrationApi.getRegistrationsForEvent(eventId);
            setRegistrations(response.data || []);
        } catch (err) {
            console.error("Lỗi khi tải danh sách đăng ký:", err);
            const errorMsg = language === "vi" ? "Không thể tải danh sách đăng ký." : "Unable to load registrations.";
            setError(errorMsg);
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    }, [eventId, language]);

    useEffect(() => {
        fetchRegistrations();
    }, [fetchRegistrations]);

    const handleApprove = async (registrationId) => {
        if (updatingId) return;
        setUpdatingId(registrationId);
        try {
            await registrationApi.approve(eventId, registrationId);
            toast.success(language === "vi" ? "Đã duyệt đăng ký!" : "Registration approved!");
            fetchRegistrations();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error approving");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleReject = async (registrationId) => {
        if (updatingId) return;
        if (!window.confirm(language === "vi" ? "Bạn chắc chắn muốn từ chối?" : "Reject this volunteer?")) return;

        setUpdatingId(registrationId);
        try {
            await registrationApi.reject(eventId, registrationId);
            toast.info(language === "vi" ? "Đã từ chối đăng ký." : "Registration rejected.");
            fetchRegistrations();
        } catch (err) {
            toast.error(err.response?.data?.error || "Error rejecting");
        } finally {
            setUpdatingId(null);
        }
    };

    const handleOpenAttendance = (reg) => {
        setSelectedReg(reg);
        setAttendanceNote('');
        setIsPresent(true);
        setAttendanceOpen(true);
    };

    const handleSubmitAttendance = async () => {
        if (!selectedReg) return;
        try {
            await registrationApi.markCompleted(eventId, selectedReg.id, isPresent, attendanceNote);
            toast.success(language === "vi" ? "Đã chấm công thành công!" : "Marked as completed!");

            setAttendanceOpen(false);
            fetchRegistrations();
        } catch (err) {
            console.error(err);
            toast.error(language === "vi" ? "Lỗi chấm công." : "Error marking completion.");
        }
    };

    if (loading) {
        return (
            <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
                <Container>
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
                        <CircularProgress />
                    </Box>
                </Container>
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4 }}>
                <Container>
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>{error}</Alert>
                    <Button variant="outlined" startIcon={<BackIcon />} onClick={() => navigate(-1)}>
                        {language === "vi" ? "Quay lại" : "Go Back"}
                    </Button>
                </Container>
            </Box>
        );
    }

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4 }}>
            <Container maxWidth="lg">
                <Box display="flex" alignItems="center" mb={4}>
                    <IconButton onClick={() => navigate(-1)} sx={{ mr: 2, borderRadius: 2 }}>
                        <BackIcon />
                    </IconButton>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: "primary.main" }}>
                            {language === "vi" ? "Quản lý Tình nguyện viên" : "Volunteer Management"}
                        </Typography>
                        <Typography variant="subtitle1" color="text.secondary">
                            {eventName}
                        </Typography>
                    </Box>
                </Box>

                {registrations.length === 0 ? (
                    <Alert severity="info" sx={{ borderRadius: 2 }}>
                        {language === "vi" ? "Chưa có ai đăng ký tham gia sự kiện này." : "No registrations yet."}
                    </Alert>
                ) : (
                    <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider", overflow: 'hidden' }}>
                        <TableContainer>
                            <Table stickyHeader>
                                <TableHead sx={{ bgcolor: 'grey.50' }}>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>{language === "vi" ? "Tên TNV" : "Volunteer"}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{language === "vi" ? "Ghi chú" : "Note"}</TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>{language === "vi" ? "Trạng thái" : "Status"}</TableCell>
                                        <TableCell align="right" sx={{ fontWeight: 700 }}>{language === "vi" ? "Hành động" : "Actions"}</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {registrations.map((reg) => (
                                        <TableRow hover key={reg.id}>
                                            <TableCell>{reg.volunteerName || "N/A"}</TableCell>
                                            <TableCell>{reg.email || "-"}</TableCell>
                                            <TableCell sx={{ maxWidth: 200 }}>
                                                <Tooltip title={reg.completionNote || reg.note || ''}>
                                                    <Typography noWrap variant="body2" sx={{ cursor: 'help' }}>
                                                        {reg.completionNote ? (
                                                            <span style={{ fontWeight: 'bold', color: '#1976d2' }}>{reg.completionNote}</span>
                                                        ) : (
                                                            <span style={{ color: 'gray' }}>{reg.note || "-"}</span>
                                                        )}
                                                    </Typography>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={statusLabels[reg.status]?.[language] || reg.status}
                                                    color={statusColors[reg.status] || "default"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>
                                            <TableCell align="right">
                                                { }
                                                {reg.status === "pending" && (
                                                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                                                        <Tooltip title={language === "vi" ? "Duyệt" : "Approve"}>
                                                            <IconButton color="success" onClick={() => handleApprove(reg.id)} disabled={updatingId === reg.id}>
                                                                <ApproveIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title={language === "vi" ? "Từ chối" : "Reject"}>
                                                            <IconButton color="error" onClick={() => handleReject(reg.id)} disabled={updatingId === reg.id}>
                                                                <RejectIcon />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                )}

                                                { }
                                                {reg.status === "approved" && (
                                                    <Button
                                                        variant="contained"
                                                        color="success"
                                                        size="small"
                                                        startIcon={<AttendanceIcon />}
                                                        onClick={() => handleOpenAttendance(reg)}
                                                        sx={{ textTransform: 'none' }}
                                                    >
                                                        {language === "vi" ? "Chấm công" : "Mark Complete"}
                                                    </Button>
                                                )}

                                                { }
                                                {reg.status === "completed" && (
                                                    <Typography variant="caption" color="success.main" fontWeight="bold">
                                                        {language === "vi" ? "Đã hoàn thành" : "Confirmed"}
                                                    </Typography>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Paper>
                )}
            </Container>

            { }
            <Dialog open={attendanceOpen} onClose={() => setAttendanceOpen(false)} maxWidth="sm" fullWidth>
                <DialogTitle sx={{ fontWeight: 'bold' }}>
                    {language === "vi" ? "Xác nhận hoàn thành nhiệm vụ" : "Confirm Completion"}
                </DialogTitle>
                <DialogContent dividers>
                    <Typography variant="subtitle1" gutterBottom>
                        {language === "vi" ? "Tình nguyện viên:" : "Volunteer:"} <strong>{selectedReg?.volunteerName}</strong>
                    </Typography>

                    <FormControl component="fieldset" sx={{ mt: 2, mb: 2 }}>
                        <FormLabel component="legend" sx={{ fontWeight: 600 }}>
                            {language === "vi" ? "Trạng thái tham gia" : "Attendance Status"}
                        </FormLabel>
                        <RadioGroup
                            row
                            value={isPresent}
                            onChange={(e) => setIsPresent(e.target.value === 'true')}
                        >
                            <FormControlLabel value={true} control={<Radio />} label={language === "vi" ? "Có mặt" : "Present"} />
                            <FormControlLabel value={false} control={<Radio />} label={language === "vi" ? "Vắng mặt" : "Absent"} />
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        label={language === "vi" ? "Nhận xét / Ghi chú" : "Note / Feedback"}
                        multiline
                        rows={3}
                        fullWidth
                        value={attendanceNote}
                        onChange={(e) => setAttendanceNote(e.target.value)}
                        placeholder={language === "vi" ? "VD: Làm việc tích cực, đến đúng giờ..." : "e.g., Hardworking, on time..."}
                    />
                </DialogContent>
                <DialogActions sx={{ px: 3, py: 2 }}>
                    <Button onClick={() => setAttendanceOpen(false)} color="inherit">
                        {language === "vi" ? "Hủy" : "Cancel"}
                    </Button>
                    <Button onClick={handleSubmitAttendance} variant="contained" color="success">
                        {language === "vi" ? "Xác nhận" : "Confirm"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}