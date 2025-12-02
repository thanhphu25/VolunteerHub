import React, {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import {Refresh as RefreshIcon, FileDownload as FileDownloadIcon} from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import eventApi from "../../api/eventApi";
import {toast} from "react-toastify";
import adminApi from "../../api/adminApi.js";
import {useLanguage} from "../../context/LanguageContext";

const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function AdminEventManagement() {
  const {t, language} = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [statusFilter]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = statusFilter === "all"
          ? await eventApi.getAll()
          : await eventApi.getByStatus(statusFilter);
      setEvents(response.data.content || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(language === "vi" ? "Không thể tải danh sách sự kiện. Vui lòng thử lại sau." : "Unable to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    if (!window.confirm(language === "vi" ? "Bạn có chắc chắn muốn duyệt sự kiện này?" : "Are you sure you want to approve this event?")) {
      return;
    }
    try {
      await eventApi.approve(eventId);
      toast.success(language === "vi" ? "Duyệt sự kiện thành công!" : "Event approved successfully!");
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      toast.error(err.response?.data?.error || (language === "vi" ? "Không thể duyệt sự kiện." : "Unable to approve event."));
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (!window.confirm(language === "vi" ? "Bạn có chắc chắn muốn từ chối sự kiện này?" : "Are you sure you want to reject this event?")) {
      return;
    }
    try {
      await eventApi.reject(eventId);
      toast.success(language === "vi" ? "Từ chối sự kiện thành công!" : "Event rejected successfully!");
      fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      toast.error(err.response?.data?.error || (language === "vi" ? "Không thể từ chối sự kiện." : "Unable to reject event."));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(
        language === "vi"
            ? "Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác."
            : "Are you sure you want to delete this event? This action cannot be undone.")) {
      return;
    }
    try {
      await eventApi.delete(eventId);
      toast.success(language === "vi" ? "Xóa sự kiện thành công!" : "Event deleted successfully!");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.error || (language === "vi" ? "Không thể xóa sự kiện." : "Unable to delete event."));
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const handleExportEvents = async (format) => {
    if (exporting) {
      return;
    }
    setExporting(true);
    toast.info(language === "vi" ? `Đang chuẩn bị file ${format.toUpperCase()}...` : `Preparing ${format.toUpperCase()} file...`);

    try {
      const response = await adminApi.exportEvents(format);
      const filename = `events.${format}`;

      downloadFile(response.data, filename);
      toast.success(language === "vi" ? `Đã xuất danh sách sự kiện (${format.toUpperCase()})!` : `Events exported successfully (${format.toUpperCase()})!`);
    } catch (err) {
      console.error("Lỗi khi xuất sự kiện:", err);
      toast.error(language === "vi" ? "Xuất dữ liệu thất bại." : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  const statusTabs = [
    {value: "pending", label: language === "vi" ? "Chờ duyệt" : "Pending"},
    {value: "approved", label: language === "vi" ? "Đã duyệt" : "Approved"},
    {value: "rejected", label: language === "vi" ? "Đã từ chối" : "Rejected"},
    {value: "cancelled", label: language === "vi" ? "Đã hủy" : "Cancelled"},
    {value: "all", label: language === "vi" ? "Tất cả" : "All"},
  ];

  if (loading) {
    return (
        <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)"}}>
          <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <CircularProgress/>
            </Box>
          </Container>
        </Box>
    );
  }

  return (
      <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4}}>
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
            <Typography variant="h3" fontWeight="bold" sx={{color: "primary.main"}}>
              {language === "vi" ? "Quản lý sự kiện" : "Event Management"}
            </Typography>
            <Box display="flex" gap={2}>
              <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon/>}
                  onClick={() => handleExportEvents('csv')}
                  disabled={exporting}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
              >
                {exporting ? (language === "vi" ? 'Đang xuất...' : 'Exporting...') : (language === "vi" ? 'Xuất CSV' : 'Export CSV')}
              </Button>
              <Button
                  variant="outlined"
                  startIcon={<FileDownloadIcon/>}
                  onClick={() => handleExportEvents('json')}
                  disabled={exporting}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
              >
                {exporting ? (language === "vi" ? 'Đang xuất...' : 'Exporting...') : (language === "vi" ? 'Xuất JSON' : 'Export JSON')}
              </Button>
              <Button
                  variant="outlined"
                  startIcon={<RefreshIcon/>}
                  onClick={fetchEvents}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
              >
                {language === "vi" ? "Làm mới" : "Refresh"}
              </Button>
            </Box>
          </Box>

          {error && (
              <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>
                {error}
              </Alert>
          )}

          <Paper
              elevation={0}
              sx={{
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              }}
          >
            <Tabs
                value={statusFilter}
                onChange={handleTabChange}
                variant="scrollable"
                scrollButtons="auto"
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  px: 2,
                }}
            >
              {statusTabs.map((tab) => (
                  <Tab
                      key={tab.value}
                      label={tab.label}
                      value={tab.value}
                      sx={{
                        textTransform: "none",
                        fontWeight: 600,
                      }}
                  />
              ))}
            </Tabs>
          </Paper>

          {events.length === 0 ? (
              <Alert severity="info" sx={{borderRadius: 2}}>
                {language === "vi" ? "Không có sự kiện nào ở trạng thái này." : "No events in this status."}
              </Alert>
          ) : (
              <Grid container spacing={3} sx={{alignItems: 'stretch'}}>
                {events.map(event => (
                    <Grid item xs={12} sm={6} md={4} key={event.id} sx={{display: 'flex'}}>
                      <EventCard
                          event={event}
                          showStatus={true}
                          showOrganizerName={true}
                          onApprove={event.status === 'pending' ? handleApproveEvent : null}
                          onReject={event.status === 'pending' ? handleRejectEvent : null}
                          onDelete={handleDeleteEvent}
                      />
                    </Grid>
                ))}
              </Grid>
          )}
        </Container>
      </Box>
  );
}
