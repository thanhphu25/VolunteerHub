import React, {useEffect, useMemo, useState} from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
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
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import profileApi from "../api/profileApi";
import {useAuth} from "../context/AuthContext";
import {toast} from "react-toastify";

export default function Profile() {
  const {user} = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
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
    if (role === "volunteer") {
      loadFollowing();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await profileApi.getProfileSummary();
      setSummary(response.data ?? null);
    } catch (err) {
      console.error("Failed to load profile", err);
      setError("Không thể tải thông tin hồ sơ. Vui lòng thử lại sau.");
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
      console.error("Failed to load following organizers", err);
      toast.error("Không thể tải danh sách tổ chức đang theo dõi");
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

  const handleCloseEdit = () => {
    setEditOpen(false);
  };

  const handleChange = (field) => (event) => {
    setFormValues(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      await profileApi.updateProfile(formValues);
      await fetchProfile();
      setEditOpen(false);
    } catch (err) {
      console.error("Failed to update profile", err);
      setError("Không thể cập nhật thông tin. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  };

  const handleUnfollowOrganizer = async (organizerId) => {
    try {
      await profileApi.unfollowOrganizer(organizerId);
      toast.success("Đã hủy theo dõi tổ chức");
      setFollowing(prev => prev.filter(item => item.organizerId !== organizerId));
      fetchProfile();
    } catch (err) {
      console.error("Failed to unfollow organizer", err);
      toast.error("Không thể hủy theo dõi. Vui lòng thử lại");
    }
  };

  if (loading) {
    return (
        <Container maxWidth="md" sx={{py: 6, display: "flex", justifyContent: "center"}}>
          <CircularProgress/>
        </Container>
    );
  }

  if (error) {
    return (
        <Container maxWidth="md" sx={{py: 6}}>
          <Stack spacing={2} alignItems="center">
            <Typography color="error">{error}</Typography>
            <Button variant="contained" onClick={fetchProfile} startIcon={<RefreshIcon/>}>
              Thử lại
            </Button>
          </Stack>
        </Container>
    );
  }

  if (!summary) {
    return (
        <Container maxWidth="md" sx={{py: 6}}>
          <Typography>Chưa có thông tin hồ sơ.</Typography>
        </Container>
    );
  }

  const userInfo = summary.user ?? {};
  const volunteerStats = summary.volunteer ?? {};
  const organizerStats = summary.organizer ?? {};
  const adminStats = summary.admin ?? {};

  const renderVolunteerStats = () => {
    return (
        <Grid container spacing={2} sx={{mt: 1}}>
          <Grid item xs={12} md={4}>
            <StatCard title="Đã tham gia" value={volunteerStats.participated ?? 0}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Đang chờ duyệt" value={volunteerStats.pending ?? 0}/>
          </Grid>
          <Grid item xs={12} md={4}>
            <StatCard title="Tổ chức đang theo dõi" value={volunteerStats.followingOrganizers ?? 0}/>
          </Grid>
        </Grid>
    );
  };

  const renderOrganizerStats = () => {
    return (
        <Grid container spacing={2} sx={{mt: 1}}>
          <Grid item xs={12} md={3}>
            <StatCard title="Sự kiện đã tổ chức" value={organizerStats.hosted ?? 0}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Đang chờ duyệt" value={organizerStats.pending ?? 0}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Tổng số người tham gia" value={organizerStats.totalParticipants ?? 0}/>
          </Grid>
          <Grid item xs={12} md={3}>
            <StatCard title="Người theo dõi" value={organizerStats.followers ?? 0}/>
          </Grid>
        </Grid>
    );
  };

  const renderAdminStats = () => {
    const approvals = adminStats.approvals ?? {};
    const timeline = adminStats.timeline ?? {};
    const topEvents = adminStats.topEvents ?? [];

    return (
        <Stack spacing={2} sx={{mt: 2}}>
          <Card>
            <CardHeader title="Duyệt sự kiện"/>
            <CardContent>
              <Stack direction={{xs: "column", md: "row"}} spacing={1}>
                <Chip label={`Đã duyệt: ${approvals.approved ?? 0}`} color="success"/>
                <Chip label={`Chờ duyệt: ${approvals.pending ?? 0}`} color="warning"/>
                <Chip label={`Đã xoá: ${approvals.deleted ?? 0}`} color="default"/>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Tiến hành"/>
            <CardContent>
              <Stack direction={{xs: "column", md: "row"}} spacing={1}>
                <Chip label={`Đã kết thúc: ${timeline.ended ?? 0}`}/>
                <Chip label={`Đang diễn ra: ${timeline.ongoing ?? 0}`} color="primary"/>
                <Chip label={`Chưa diễn ra: ${timeline.upcoming ?? 0}`} color="info"/>
              </Stack>
            </CardContent>
          </Card>

          <Card>
            <CardHeader title="Sự kiện nổi bật" subheader="Top 10 theo lượt đăng ký / bình luận"/>
            <CardContent>
              {topEvents.length === 0 ? (
                  <Typography color="text.secondary">Chưa có dữ liệu.</Typography>
              ) : (
                  <List>
                    {topEvents.map((event, index) => (
                        <React.Fragment key={event.id ?? index}>
                          <ListItem alignItems="flex-start" disableGutters>
                            <ListItemText
                                primary={`${index + 1}. ${event.name ?? "(Không tên)"}`}
                                secondary={`Đăng ký: ${event.registrations ?? 0} • Bình luận: ${event.comments ?? 0}`}
                            />
                          </ListItem>
                          {index < topEvents.length - 1 && <Divider component="li"/>}
                        </React.Fragment>
                    ))}
                  </List>
              )}
            </CardContent>
          </Card>
        </Stack>
    );
  };

  return (
      <Container maxWidth="lg" sx={{py: 4}}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Stack spacing={2} alignItems="center">
                  <Avatar
                      src={userInfo.avatarUrl ?? undefined}
                      alt={userInfo.fullName ?? "User"}
                      sx={{width: 96, height: 96, fontSize: 32}}
                  >
                    {(userInfo.fullName ?? userInfo.email ?? "?").charAt(0).toUpperCase()}
                  </Avatar>
                  <Typography variant="h5" fontWeight={600} textAlign="center">
                    {userInfo.fullName ?? "Chưa cập nhật"}
                  </Typography>
                  <Stack spacing={0.5} textAlign="center">
                    <Typography color="text.secondary">{userInfo.email}</Typography>
                    <Typography color="text.secondary">{userInfo.phone || "Chưa cập nhật"}</Typography>
                    <Chip label={role.toUpperCase()} size="small" color="primary"/>
                  </Stack>
                  <Button variant="outlined" onClick={handleOpenEdit}>
                    Chỉnh sửa
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card>
              <CardHeader
                  title="Tổng quan"
                  action={
                    <IconButton onClick={fetchProfile}>
                      <RefreshIcon/>
                    </IconButton>
                  }
              />
              <CardContent>
                {role === "volunteer" && renderVolunteerStats()}
                {role === "organizer" && renderOrganizerStats()}
                {role === "admin" && renderAdminStats()}

                {role === "volunteer" && (
                    <Stack spacing={1} sx={{mt: 3}}>
                      <Typography variant="h6">Tổ chức đang theo dõi</Typography>
                      {followLoading ? (
                          <Typography color="text.secondary">Đang tải...</Typography>
                      ) : following.length === 0 ? (
                          <Typography color="text.secondary">Bạn chưa theo dõi tổ chức nào.</Typography>
                      ) : (
                          <Card variant="outlined">
                            <List>
                              {following.map((item, idx) => (
                                  <React.Fragment key={item.organizerId ?? idx}>
                                    <ListItem>
                                      <ListItemText
                                          primary={item.organizerName ?? "(Không tên)"}
                                          secondary={item.organizerEmail ?? ""}
                                      />
                                      <ListItemSecondaryAction>
                                        <Button size="small" onClick={() => handleUnfollowOrganizer(item.organizerId)}>
                                          Hủy theo dõi
                                        </Button>
                                      </ListItemSecondaryAction>
                                    </ListItem>
                                    {idx < following.length - 1 && <Divider component="li"/>}
                                  </React.Fragment>
                              ))}
                            </List>
                          </Card>
                      )}
                    </Stack>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Dialog open={editOpen} onClose={handleCloseEdit} fullWidth maxWidth="sm">
          <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2} sx={{mt: 1}}>
              <TextField
                  label="Họ và tên"
                  value={formValues.fullName}
                  onChange={handleChange("fullName")}
                  fullWidth
              />
              <TextField
                  label="Số điện thoại"
                  value={formValues.phone}
                  onChange={handleChange("phone")}
                  fullWidth
              />
              <TextField
                  label="Ảnh đại diện (URL)"
                  value={formValues.avatarUrl}
                  onChange={handleChange("avatarUrl")}
                  fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Hủy</Button>
            <Button onClick={handleSaveProfile} variant="contained" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
  );
}

function StatCard({title, value}) {
  return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
          <Typography variant="h5" fontWeight={600}>
            {value ?? 0}
          </Typography>
        </CardContent>
      </Card>
  );
}
