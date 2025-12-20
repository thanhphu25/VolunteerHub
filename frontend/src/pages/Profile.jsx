import React, { useEffect, useMemo, useState } from "react";
import {
    Avatar,
    Box,
    Button,
    Card,
    CardContent,
    Chip,
    CircularProgress,
    Container,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    Grid,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemSecondaryAction, // Giữ nguyên import gốc
    ListItemText,
    Paper,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    useTheme
} from "@mui/material";
import {
    Edit as EditIcon,
    Email as EmailIcon,
    Phone as PhoneIcon,
    VerifiedUser as VerifiedUserIcon,
    EventAvailable as EventIcon,
    Groups as GroupsIcon,
    AccessTime as AccessTimeIcon,
    Star as StarIcon,
    PersonRemove as UnfollowIcon,
    CameraAlt as CameraIcon
} from "@mui/icons-material";
import profileApi from "../api/profileApi";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
// 1. IMPORT IMAGE UPLOADER
import ImageUploader from "../components/ImageUploader";

// 2. HÀM HELPER ĐỂ XỬ LÝ LINK ẢNH (QUAN TRỌNG)
const getAvatarUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url; // Ảnh online
    return `http://localhost:8080${url}`;  // Ảnh local -> Thêm localhost
};

// Helper component cho thẻ thống kê đẹp hơn
const StatBox = ({ icon, title, value, color }) => (
    <Paper
        elevation={0}
        sx={{
            p: 2,
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            transition: 'all 0.3s ease',
            '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                borderColor: color
            }
        }}
    >
        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: `${color}15`, color: color }}>
            {icon}
        </Box>
        <Box>
            <Typography variant="h5" fontWeight="bold" color="text.primary">
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" fontWeight={500}>
                {title}
            </Typography>
        </Box>
    </Paper>
);

export default function Profile() {
    const { user } = useAuth();
    const theme = useTheme();
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editOpen, setEditOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tabValue, setTabValue] = useState(0); // State cho Tabs
    const [formValues, setFormValues] = useState({
        fullName: "",
        phone: "",
        avatarUrl: ""
    });
    const [following, setFollowing] = useState([]);
    const [followLoading, setFollowLoading] = useState(false);

    const role = useMemo(() => user?.role?.toLowerCase?.() ?? "", [user]);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (role === "volunteer" && tabValue === 1) {
            loadFollowing();
        }
    }, [role, tabValue]);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await profileApi.getProfileSummary();
            setSummary(response.data ?? null);
        } catch (err) {
            if (err.code !== 'ERR_NETWORK') console.error("Failed to load profile", err);
            setError("Không thể tải thông tin hồ sơ.");
        } finally {
            setLoading(false);
        }
    };

    const loadFollowing = async () => {
        try {
            setFollowLoading(true);
            const response = await profileApi.getFollowedOrganizers();
            setFollowing(response.data ?? []);
        } catch (err) {
            if (err.code !== 'ERR_NETWORK') console.error("Failed to load following", err);
        } finally {
            setFollowLoading(false);
        }
    };

    const handleOpenEdit = () => {
        const userInfo = summary?.user ?? {};
        setFormValues({
            fullName: userInfo.fullName ?? "",
            phone: userInfo.phone ?? "",
            avatarUrl: userInfo.avatarUrl ?? ""
        });
        setEditOpen(true);
    };

    const handleSaveProfile = async () => {
        try {
            setSaving(true);
            await profileApi.updateProfile(formValues);
            await fetchProfile();
            setEditOpen(false);
            toast.success("Cập nhật hồ sơ thành công!");
        } catch  {
            toast.error("Không thể cập nhật thông tin.");
        } finally {
            setSaving(false);
        }
    };

    const handleUnfollowOrganizer = async (organizerId) => {
        try {
            await profileApi.unfollowOrganizer(organizerId);
            toast.success("Đã hủy theo dõi");
            setFollowing(prev => prev.filter(item => item.organizerId !== organizerId));
        } catch {
            toast.error("Lỗi khi hủy theo dõi");
        }
    };

    const handleTabChange = (event, newValue) => {
        setTabValue(newValue);
    };

    if (loading) return <Box display="flex" justifyContent="center" py={10}><CircularProgress /></Box>;
    if (error) return <Container sx={{ py: 6 }}><Typography color="error">{error}</Typography></Container>;
    if (!summary) return <Container sx={{ py: 6 }}><Typography>Chưa có thông tin.</Typography></Container>;

    const userInfo = summary.user ?? {};
    const volunteerStats = summary.volunteer ?? {};
    const organizerStats = summary.organizer ?? {};
    const adminStats = summary.admin ?? {};

    // --- RENDER CONTENT SECTIONS ---

    const renderVolunteerStats = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={4}>
                <StatBox
                    icon={<EventIcon fontSize="large"/>}
                    title="Đã tham gia"
                    value={volunteerStats.participated ?? 0}
                    color={theme.palette.primary.main}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <StatBox
                    icon={<AccessTimeIcon fontSize="large"/>}
                    title="Chờ duyệt"
                    value={volunteerStats.pending ?? 0}
                    color={theme.palette.warning.main}
                />
            </Grid>
            <Grid item xs={12} sm={4}>
                <StatBox
                    icon={<StarIcon fontSize="large"/>}
                    title="Đang theo dõi"
                    value={volunteerStats.followingOrganizers ?? 0}
                    color={theme.palette.info.main}
                />
            </Grid>
        </Grid>
    );

    const renderOrganizerStats = () => (
        <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
                <StatBox icon={<EventIcon fontSize="medium"/>} title="Đã tổ chức" value={organizerStats.hosted ?? 0} color="#2e7d32" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatBox icon={<AccessTimeIcon fontSize="medium"/>} title="Chờ duyệt" value={organizerStats.pending ?? 0} color="#ed6c02" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatBox icon={<GroupsIcon fontSize="medium"/>} title="Người tham gia" value={organizerStats.totalParticipants ?? 0} color="#0288d1" />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
                <StatBox icon={<StarIcon fontSize="medium"/>} title="Người theo dõi" value={organizerStats.followers ?? 0} color="#9c27b0" />
            </Grid>
        </Grid>
    );

    const renderAdminStats = () => (
        <Stack spacing={3}>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="bold">Trạng thái hệ thống</Typography>
                <Grid container spacing={2}>
                    <Grid item xs={6} md={3}><Chip label={`Đã duyệt: ${adminStats.approvals?.approved ?? 0}`} color="success" variant="outlined" sx={{width: '100%', fontWeight: 'bold'}} /></Grid>
                    <Grid item xs={6} md={3}><Chip label={`Chờ duyệt: ${adminStats.approvals?.pending ?? 0}`} color="warning" variant="outlined" sx={{width: '100%', fontWeight: 'bold'}} /></Grid>
                    <Grid item xs={6} md={3}><Chip label={`Đang diễn ra: ${adminStats.timeline?.ongoing ?? 0}`} color="primary" variant="outlined" sx={{width: '100%', fontWeight: 'bold'}} /></Grid>
                    <Grid item xs={6} md={3}><Chip label={`Sắp tới: ${adminStats.timeline?.upcoming ?? 0}`} color="info" variant="outlined" sx={{width: '100%', fontWeight: 'bold'}} /></Grid>
                </Grid>
            </Paper>

            {/* Top Events List can go here if needed */}
        </Stack>
    );

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8 }}>
            {/* 1. COVER PHOTO HEADER */}
            <Box
                sx={{
                    height: { xs: 200, md: 280 },
                    background: 'linear-gradient(135deg, #2b7a78 0%, #3aafa9 100%)',
                    position: 'relative',
                    mb: 8
                }}
            >
                <Container maxWidth="lg" sx={{ height: '100%', position: 'relative' }}>
                    {/* Avatar & Main Info Overlapping */}
                    <Box
                        sx={{
                            position: 'absolute',
                            bottom: -45,
                            left: { xs: '50%', md: 24 },
                            transform: { xs: 'translateX(-50%)', md: 'none' },
                            display: 'flex',
                            flexDirection: { xs: 'column', md: 'row' },
                            alignItems: { xs: 'center', md: 'flex-end' },
                            gap: 3,
                            width: '100%'
                        }}
                    >
                        <Box position="relative">
                            {/* SỬA CHỖ NÀY: Dùng getAvatarUrl */}
                            <Avatar
                                src={getAvatarUrl(userInfo.avatarUrl)}
                                alt={userInfo.fullName}
                                sx={{
                                    width: 160,
                                    height: 160,
                                    border: '6px solid',
                                    borderColor: 'background.paper',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem'
                                }}
                            >
                                {(userInfo.fullName ?? "?").charAt(0).toUpperCase()}
                            </Avatar>
                            <IconButton
                                sx={{
                                    position: 'absolute', bottom: 10, right: 10, bgcolor: 'background.paper',
                                    boxShadow: 1, '&:hover': { bgcolor: 'grey.100' }
                                }}
                                onClick={handleOpenEdit}
                                size="small"
                            >
                                <CameraIcon color="primary" fontSize="small"/>
                            </IconButton>
                        </Box>

                        <Box sx={{ pb: { md: 2 }, textAlign: { xs: 'center', md: 'left' }, color: { xs: 'text.primary', md: 'white' }, mb: {xs: -6, md: 0} }}>
                            <Typography variant="h4" fontWeight="800" sx={{ textShadow: { md: '0 2px 4px rgba(0,0,0,0.3)' } }}>
                                {userInfo.fullName ?? "Chưa đặt tên"}
                            </Typography>
                            <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', md: 'flex-start' }} alignItems="center" mt={0.5}>
                                <Chip
                                    icon={<VerifiedUserIcon fontSize="small" />}
                                    label={role.toUpperCase()}
                                    size="small"
                                    color="secondary" // Màu cam/vàng sẽ nổi trên nền xanh
                                    sx={{ fontWeight: 'bold', boxShadow: { md: '0 2px 4px rgba(0,0,0,0.2)' } }}
                                />
                                <Typography variant="body1" sx={{ color: { xs: 'text.secondary', md: 'rgba(255,255,255,0.9)' }, fontWeight: 500 }}>
                                    {userInfo.email}
                                </Typography>
                            </Stack>
                        </Box>

                        <Box sx={{ ml: { md: 'auto' }, pb: 2, display: { xs: 'none', md: 'block' } }}>
                            <Button variant="contained" startIcon={<EditIcon />} onClick={handleOpenEdit}
                                    sx={{ bgcolor: 'white', color: 'primary.main', '&:hover': { bgcolor: 'grey.100' }, fontWeight: 'bold' }}>
                                Chỉnh sửa hồ sơ
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* 2. MAIN CONTENT LAYOUT */}
            <Container maxWidth="lg" sx={{ mt: 4 }}>
                <Grid container spacing={4}>
                    {/* Left Column: Personal Info */}
                    <Grid item xs={12} md={4}>
                        <Card sx={{ borderRadius: 3, mb: 3 }} elevation={0} variant="outlined">
                            <CardContent>
                                <Typography variant="h6" fontWeight="bold" gutterBottom>Thông tin cá nhân</Typography>
                                <List dense>
                                    <ListItem disableGutters>
                                        <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}><EmailIcon fontSize="small" /></Avatar></ListItemAvatar>
                                        <ListItemText primary="Email" secondary={userInfo.email} />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                    <ListItem disableGutters>
                                        <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}><PhoneIcon fontSize="small" /></Avatar></ListItemAvatar>
                                        <ListItemText primary="Điện thoại" secondary={userInfo.phone || "Chưa cập nhật"} />
                                    </ListItem>
                                    <Divider variant="inset" component="li" />
                                    <ListItem disableGutters>
                                        <ListItemAvatar><Avatar sx={{ bgcolor: 'primary.light', width: 32, height: 32 }}><VerifiedUserIcon fontSize="small" /></Avatar></ListItemAvatar>
                                        <ListItemText primary="Vai trò" secondary={role === 'volunteer' ? 'Tình nguyện viên' : role === 'organizer' ? 'Nhà tổ chức' : 'Admin'} />
                                    </ListItem>
                                </List>
                                <Button
                                    fullWidth variant="outlined" sx={{ mt: 2, display: { md: 'none' } }}
                                    onClick={handleOpenEdit} startIcon={<EditIcon />}
                                >
                                    Chỉnh sửa
                                </Button>
                            </CardContent>
                        </Card>
                    </Grid>

                    {/* Right Column: Dynamic Content (Tabs) */}
                    <Grid item xs={12} md={8}>
                        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                            <Tabs value={tabValue} onChange={handleTabChange} aria-label="profile tabs">
                                <Tab label="Tổng quan" sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />
                                {role === 'volunteer' && <Tab label={`Đang theo dõi (${volunteerStats.followingOrganizers ?? 0})`} sx={{ fontWeight: 600, textTransform: 'none', fontSize: '1rem' }} />}
                            </Tabs>
                        </Box>

                        {/* Tab 0: Overview (Stats) */}
                        <Box role="tabpanel" hidden={tabValue !== 0}>
                            {tabValue === 0 && (
                                <Box>
                                    <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ mb: 3 }}>
                                        Hoạt động gần đây
                                    </Typography>
                                    {role === 'volunteer' && renderVolunteerStats()}
                                    {role === 'organizer' && renderOrganizerStats()}
                                    {role === 'admin' && renderAdminStats()}
                                </Box>
                            )}
                        </Box>

                        {/* Tab 1: Following (Only for Volunteers) */}
                        <Box role="tabpanel" hidden={tabValue !== 1}>
                            {tabValue === 1 && role === 'volunteer' && (
                                <Stack spacing={2}>
                                    {followLoading ? (
                                        <Box display="flex" justifyContent="center"><CircularProgress size={30} /></Box>
                                    ) : following.length === 0 ? (
                                        <Paper sx={{ p: 4, textAlign: 'center', bgcolor: 'grey.50' }} elevation={0}>
                                            <Typography color="text.secondary">Bạn chưa theo dõi tổ chức nào.</Typography>
                                        </Paper>
                                    ) : (
                                        following.map((item) => (
                                            <Paper key={item.organizerId} elevation={0} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                                                <Stack direction="row" alignItems="center" justifyContent="space-between">
                                                    <Stack direction="row" spacing={2} alignItems="center">
                                                        <Avatar>{item.organizerName?.charAt(0)}</Avatar>
                                                        <Box>
                                                            <Typography fontWeight="bold">{item.organizerName}</Typography>
                                                            <Typography variant="caption" color="text.secondary">{item.organizerEmail}</Typography>
                                                        </Box>
                                                    </Stack>
                                                    <Button
                                                        size="small" color="error" variant="outlined"
                                                        startIcon={<UnfollowIcon />}
                                                        onClick={() => handleUnfollowOrganizer(item.organizerId)}
                                                    >
                                                        Hủy theo dõi
                                                    </Button>
                                                </Stack>
                                            </Paper>
                                        ))
                                    )}
                                </Stack>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Container>

            {/* EDIT DIALOG */}
            <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
                <DialogTitle sx={{ borderBottom: '1px solid #eee' }}>Chỉnh sửa thông tin</DialogTitle>
                <DialogContent sx={{ pt: 3 }}>
                    <Stack spacing={3} sx={{ mt: 1 }}>
                        <TextField
                            label="Họ và tên"
                            value={formValues.fullName}
                            onChange={(e) => setFormValues({...formValues, fullName: e.target.value})}
                            fullWidth
                            variant="outlined"
                        />
                        <TextField
                            label="Số điện thoại"
                            value={formValues.phone}
                            onChange={(e) => setFormValues({...formValues, phone: e.target.value})}
                            fullWidth
                            variant="outlined"
                        />

                        {/* THAY THẾ TEXTFIELD CŨ BẰNG IMAGE UPLOADER */}
                        <ImageUploader
                            label="Ảnh đại diện (Avatar)"
                            value={formValues.avatarUrl}
                            onChange={(url) => setFormValues({...formValues, avatarUrl: url})}
                            placeholder="Tải ảnh lên hoặc dán link..."
                        />

                    </Stack>
                </DialogContent>
                <DialogActions sx={{ p: 2, borderTop: '1px solid #eee' }}>
                    <Button onClick={() => setEditOpen(false)} color="inherit">Hủy</Button>
                    <Button onClick={handleSaveProfile} variant="contained" disabled={saving}>
                        {saving ? "Đang lưu..." : "Lưu thay đổi"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
}