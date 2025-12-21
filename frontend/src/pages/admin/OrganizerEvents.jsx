/**
 * OrganizerEvents Page
 * Organizer dashboard for managing their volunteer events.
 * Allows creating, editing, deleting events and viewing registrations.
 * Displays events in different tabs based on status (all, approved, pending, rejected).
 *
 * @component
 * @returns {JSX.Element} Event management page for event organizers
 */
import React, { useEffect, useState } from "react";
import {
    Alert,
    Box,
    Button,
    CircularProgress,
    Container,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography,
    Chip,
    Stack,
    Tooltip,
    IconButton,
    Tabs,
    Tab
} from "@mui/material";
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    PeopleAlt as PeopleIcon,
    Cancel as CancelIcon
} from "@mui/icons-material";
import EventForm from "../../components/EventForm";
import eventApi from "../../api/eventApi";
import { toast } from "react-toastify";
import { useLanguage } from "../../context/LanguageContext";
import { Link as RouterLink } from "react-router-dom";
import EventFilter from "../../components/EventFilter";

export default function OrganizerEvents() {
    const { t, language } = useLanguage();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [formOpen, setFormOpen] = useState(false);
    const [currentEvent, setCurrentEvent] = useState(null);

    const [activeTab, setActiveTab] = useState("all");

    const [filters, setFilters] = useState({
        status: "all",
        search: "",
        category: "all",
        location: "all",
        startDate: null,
        endDate: null,
        sort: "createdAt,desc"
    });

    useEffect(() => {
        fetchMyEvents();
    }, [filters]);

    const fetchMyEvents = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = { ...filters, page: 0, size: 100 };
            delete params.status;

            if (params.category === 'all') delete params.category;
            if (params.location === 'all') delete params.location;

            const response = await eventApi.getMyEvents(params);
            setEvents(response.data.content || response.data || []);
        } catch (err) {
            console.error("Error fetching events:", err);
            setError(language === "vi" ? "Không thể tải danh sách sự kiện." : "Unable to load events.");
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (field, value) => {
        setFilters((prev) => ({ ...prev, [field]: value }));
    };

    const getDisplayStatus = (event) => {
        const now = new Date();
        const end = new Date(event.endDate);

        if (event.status === 'approved' && end < now) {
            return 'completed';
        }
        return event.status;
    };

    const filteredEvents = activeTab === "all"
        ? events
        : events.filter(e => getDisplayStatus(e) === activeTab);

    const statusMap = {
        pending: { label: language === "vi" ? 'Chờ duyệt' : 'Pending', color: 'warning' },
        approved: { label: language === "vi" ? 'Đã duyệt' : 'Approved', color: 'success' },
        rejected: { label: language === "vi" ? 'Bị từ chối' : 'Rejected', color: 'error' },
        cancelled: { label: language === "vi" ? 'Đã hủy' : 'Cancelled', color: 'default' },
        completed: { label: language === "vi" ? 'Đã kết thúc' : 'Completed', color: 'info' }
    };

    const handleCreateEvent = () => {
        setCurrentEvent(null);
        setFormOpen(true);
    };

    const handleOpenEditModal = (eventToEdit) => {
        setCurrentEvent(eventToEdit);
        setFormOpen(true);
    };

    const handleCloseModal = () => {
        setFormOpen(false);
        setCurrentEvent(null);
    }

    const handleFormSubmit = async (formData) => {
        try {
            if (currentEvent) {
                await eventApi.update(currentEvent.id, formData);
                toast.success(language === "vi" ? "Cập nhật thành công!" : "Event updated!");
            } else {
                await eventApi.create(formData);
                toast.success(language === "vi" ? "Tạo sự kiện thành công!" : "Event created!");
            }
            handleCloseModal();
            await fetchMyEvents();
        } catch (err) {
            toast.error(language === "vi" ? "Có lỗi xảy ra." : "An error occurred.");
        }
    };

    const handleCancelEvent = async (eventId) => {
        if (!window.confirm(language === "vi" ? "Bạn chắc chắn muốn hủy sự kiện này?" : "Are you sure to cancel?")) return;
        try {
            await eventApi.cancel(eventId);
            toast.success(language === "vi" ? "Đã hủy sự kiện." : "Event cancelled.");
            await fetchMyEvents();
        } catch (err) {
            toast.error("Error cancelling event");
        }
    };

    const handleDeleteEvent = async (eventId) => {
        if (!window.confirm(language === "vi" ? "Hành động này không thể hoàn tác. Tiếp tục?" : "Irreversible action. Continue?")) return;
        try {
            await eventApi.delete(eventId);
            toast.success(language === "vi" ? "Đã xóa sự kiện." : "Event deleted.");
            await fetchMyEvents();
        } catch (err) {
            toast.error("Error deleting event");
        }
    };

    const formatDate = (d) => d ? new Date(d).toLocaleDateString('vi-VN') : '';

    const getImageUrl = (url) => {
        if (!url) return "https://placehold.co/50?text=No+Img";
        if (url.startsWith("http")) return url;
        return `http://localhost:8080${url}`;
    };

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4 }}>
            <Container maxWidth="xl">
                { }
                <Stack direction="row" justifyContent="space-between" alignItems="center" mb={4}>
                    <Box>
                        <Typography variant="h4" fontWeight="bold" sx={{ color: "primary.main" }}>
                            {language === "vi" ? "Quản lý sự kiện" : "Event Management"}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {language === "vi" ? "Danh sách các sự kiện bạn đã tổ chức" : "List of events you have organized"}
                        </Typography>
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleCreateEvent}
                        sx={{ borderRadius: 2, px: 3, fontWeight: 600 }}
                    >
                        {language === "vi" ? "Tạo sự kiện" : "Create Event"}
                    </Button>
                </Stack>

                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

                <EventFilter
                    filters={filters}
                    onChange={handleFilterChange}
                    showStatus={false}
                />

                { }
                <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                    { }
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2, bgcolor: 'grey.50' }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} variant="scrollable">
                            <Tab label={language === "vi" ? "Tất cả" : "All"} value="all" sx={{ fontWeight: 600 }} />
                            <Tab label={language === "vi" ? "Chờ duyệt" : "Pending"} value="pending" sx={{ fontWeight: 600 }} />
                            <Tab label={language === "vi" ? "Đã duyệt" : "Approved"} value="approved" sx={{ fontWeight: 600 }} />
                            <Tab label={language === "vi" ? "Đã kết thúc" : "Completed"} value="completed" sx={{ fontWeight: 600 }} />
                        </Tabs>
                    </Box>

                    {loading ? (
                        <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>
                    ) : (
                        <TableContainer sx={{ maxHeight: '70vh' }}>
                            <Table stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        { }
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 250 }}>Sự kiện</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Thời gian</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 120 }}>Trạng thái</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold' }} align="center">Đăng ký</TableCell>
                                        <TableCell sx={{ fontWeight: 'bold', minWidth: 150 }} align="right">Hành động</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {filteredEvents.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center" sx={{ py: 8, color: 'text.secondary' }}>
                                                {language === "vi" ? "Không có dữ liệu sự kiện." : "No events found."}
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredEvents.map((row) => {
                                            const displayStatus = getDisplayStatus(row);
                                            const statusInfo = statusMap[displayStatus] || { label: displayStatus, color: 'default' };

                                            return (
                                                <TableRow key={row.id} hover>
                                                    <TableCell>
                                                        <Stack direction="row" spacing={2} alignItems="center">
                                                            <Box
                                                                component="img"
                                                                src={getImageUrl(row.imageUrl)}
                                                                sx={{ width: 50, height: 50, borderRadius: 2, objectFit: 'cover', bgcolor: 'grey.200', flexShrink: 0 }}
                                                            />
                                                            <Box sx={{ minWidth: 0 }}>
                                                                <Tooltip title={row.name}>
                                                                    <Typography
                                                                        variant="subtitle2"
                                                                        fontWeight="bold"
                                                                        sx={{
                                                                            display: '-webkit-box',
                                                                            overflow: 'hidden',
                                                                            WebkitBoxOrient: 'vertical',
                                                                            WebkitLineClamp: 2,
                                                                            lineHeight: '1.2em',
                                                                            mb: 0.5
                                                                        }}
                                                                    >
                                                                        {row.name}
                                                                    </Typography>
                                                                </Tooltip>
                                                                <Typography variant="caption" color="text.secondary">{row.category}</Typography>
                                                            </Box>
                                                        </Stack>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography variant="body2">{formatDate(row.startDate)}</Typography>
                                                        <Typography variant="caption" color="text.secondary">đến {formatDate(row.endDate)}</Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={statusInfo.label}
                                                            color={statusInfo.color}
                                                            size="small"
                                                            sx={{ fontWeight: 600 }}
                                                        />
                                                    </TableCell>
                                                    <TableCell align="center">
                                                        <Tooltip title="Quản lý đăng ký">
                                                            <Button
                                                                size="small"
                                                                variant="outlined"
                                                                color="info"
                                                                startIcon={<PeopleIcon />}
                                                                component={RouterLink}
                                                                to={`/organizer/events/${row.id}/registrations`}
                                                                sx={{ borderRadius: 5, textTransform: 'none', whiteSpace: 'nowrap' }}
                                                            >
                                                                {row.currentVolunteers || 0} / {row.maxVolunteers}
                                                            </Button>
                                                        </Tooltip>
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                                                            <Tooltip title="Xem chi tiết">
                                                                <IconButton size="small" component={RouterLink} to={`/events/${row.id}`}>
                                                                    <ViewIcon fontSize="small" />
                                                                </IconButton>
                                                            </Tooltip>

                                                            {(displayStatus === 'pending' || displayStatus === 'approved') && (
                                                                <Tooltip title="Chỉnh sửa">
                                                                    <IconButton size="small" color="primary" onClick={() => handleOpenEditModal(row)}>
                                                                        <EditIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {displayStatus === 'approved' && (
                                                                <Tooltip title="Hủy sự kiện">
                                                                    <IconButton size="small" color="warning" onClick={() => handleCancelEvent(row.id)}>
                                                                        <CancelIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}

                                                            {displayStatus !== 'completed' && displayStatus !== 'cancelled' && (
                                                                <Tooltip title="Xóa">
                                                                    <IconButton size="small" color="error" onClick={() => handleDeleteEvent(row.id)}>
                                                                        <DeleteIcon fontSize="small" />
                                                                    </IconButton>
                                                                </Tooltip>
                                                            )}
                                                        </Stack>
                                                    </TableCell>
                                                </TableRow>
                                            )
                                        })
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    )}
                </Paper>

                <EventForm
                    open={formOpen}
                    onClose={handleCloseModal}
                    onSubmit={handleFormSubmit}
                    initialData={currentEvent}
                    isEdit={!!currentEvent}
                />
            </Container>
        </Box>
    );
}