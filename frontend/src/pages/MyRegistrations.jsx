import React, { useEffect, useState } from "react";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Container,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText
} from "@mui/material";
import {
  Event as EventIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarIcon,
  Cancel as CancelIcon,
  Visibility as ViewIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  Block as BlockIcon
} from "@mui/icons-material";
import { Link as RouterLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import registrationApi from "../api/registrationApi";
import { toast } from "react-toastify";

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

const statusIcons = {
  pending: <ScheduleIcon />,
  approved: <CheckCircleIcon />,
  rejected: <BlockIcon />,
  cancelled: <CancelIcon />,
  completed: <CheckCircleIcon />
};

export default function MyRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filteredRegistrations, setFilteredRegistrations] = useState([]);
  const [selectedTab, setSelectedTab] = useState(0);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [registrationToCancel, setRegistrationToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const { user } = useAuth();

  const tabLabels = ['Tất cả', 'Chờ duyệt', 'Đã duyệt', 'Đã từ chối', 'Đã hủy', 'Hoàn thành'];
  const tabValues = ['all', 'pending', 'approved', 'rejected', 'cancelled', 'completed'];

  useEffect(() => {
    fetchRegistrations();
  }, []);

  useEffect(() => {
    filterRegistrations();
  }, [registrations, selectedTab]);

  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await registrationApi.getMyRegistrations();
      setRegistrations(response.data || []);
    } catch (err) {
      console.error("Error fetching registrations:", err);
      setError("Không thể tải danh sách đăng ký. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const filterRegistrations = () => {
    if (selectedTab === 0) {
      // Show all registrations
      setFilteredRegistrations(registrations);
    } else {
      const status = tabValues[selectedTab];
      setFilteredRegistrations(registrations.filter(reg => reg.status === status));
    }
  };

  const handleTabChange = (event, newValue) => {
    setSelectedTab(newValue);
  };

  const handleCancelClick = (registration) => {
    setRegistrationToCancel(registration);
    setCancelDialogOpen(true);
  };

  const handleCancelConfirm = async () => {
    if (!registrationToCancel) return;

    setIsCancelling(true);
    try {
      await registrationApi.cancel(registrationToCancel.eventId, registrationToCancel.id);
      toast.success('Hủy đăng ký thành công!');
      
      // Update the registration status locally
      setRegistrations(prev => 
        prev.map(reg => 
          reg.id === registrationToCancel.id 
            ? { ...reg, status: 'cancelled' }
            : reg
        )
      );
      
      setCancelDialogOpen(false);
      setRegistrationToCancel(null);
    } catch (err) {
      console.error("Error cancelling registration:", err);
      toast.error(err.response?.data?.error || 'Hủy đăng ký thất bại. Vui lòng thử lại sau.');
    } finally {
      setIsCancelling(false);
    }
  };

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

  const canCancel = (registration) => {
    return registration.status === 'pending' || registration.status === 'approved';
  };

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Đăng ký của tôi
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && registrations.length === 0 && (
        <Alert severity="info">
          Bạn chưa đăng ký tham gia sự kiện nào.
        </Alert>
      )}

      {registrations.length > 0 && (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
            <Tabs value={selectedTab} onChange={handleTabChange} variant="scrollable">
              {tabLabels.map((label, index) => (
                <Tab 
                  key={label} 
                  label={`${label} (${index === 0 ? registrations.length : registrations.filter(reg => reg.status === tabValues[index]).length})`}
                />
              ))}
            </Tabs>
          </Box>

          {filteredRegistrations.length === 0 ? (
            <Alert severity="info">
              Không có đăng ký nào trong danh mục này.
            </Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredRegistrations.map((registration) => (
                <Grid size={{xs: 12, md: 6}} key={registration.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Typography variant="h6" component="div" sx={{ flex: 1 }}>
                          {registration.eventName}
                        </Typography>
                        <Chip
                          icon={statusIcons[registration.status]}
                          label={statusLabels[registration.status]}
                          color={statusColors[registration.status]}
                          size="small"
                        />
                      </Box>

                      <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                        <CalendarIcon sx={{ mr: 1, fontSize: 20 }} />
                        <Typography variant="body2">
                          Đăng ký: {formatDate(registration.registeredAt)}
                        </Typography>
                      </Box>

                      {registration.approvedAt && (
                        <Box display="flex" alignItems="center" mb={1} color="text.secondary">
                          <CheckCircleIcon sx={{ mr: 1, fontSize: 20 }} />
                          <Typography variant="body2">
                            Duyệt: {formatDate(registration.approvedAt)}
                          </Typography>
                        </Box>
                      )}

                      {registration.note && (
                        <Box mt={2}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Ghi chú:</strong> {registration.note}
                          </Typography>
                        </Box>
                      )}

                      {registration.organizerNote && (
                        <Box mt={1}>
                          <Typography variant="body2" color="text.secondary">
                            <strong>Ghi chú từ tổ chức:</strong> {registration.organizerNote}
                          </Typography>
                        </Box>
                      )}
                    </CardContent>

                    <CardActions>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ViewIcon />}
                        component={RouterLink}
                        to={`/events/${registration.eventId}`}
                      >
                        Xem sự kiện
                      </Button>

                      {canCancel(registration) && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="error"
                          startIcon={<CancelIcon />}
                          onClick={() => handleCancelClick(registration)}
                        >
                          Hủy đăng ký
                        </Button>
                      )}
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Cancel Confirmation Dialog */}
      <Dialog
        open={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        aria-labelledby="cancel-dialog-title"
        aria-describedby="cancel-dialog-description"
      >
        <DialogTitle id="cancel-dialog-title">
          Xác nhận hủy đăng ký
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="cancel-dialog-description">
            Bạn có chắc chắn muốn hủy đăng ký tham gia sự kiện "{registrationToCancel?.eventName}"?
            Hành động này không thể hoàn tác.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setCancelDialogOpen(false)}
            disabled={isCancelling}
          >
            Hủy
          </Button>
          <Button 
            onClick={handleCancelConfirm}
            color="error"
            variant="contained"
            disabled={isCancelling}
            autoFocus
          >
            {isCancelling ? 'Đang hủy...' : 'Xác nhận hủy'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
