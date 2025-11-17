import React, {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import {Refresh as RefreshIcon} from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import eventApi from "../../api/eventApi";
import {toast} from "react-toastify";
import adminApi from "../../api/adminApi.js";

const downloadFile = (blob, filename) => {
  // Tạo một URL tạm thời cho dữ liệu Blob
  const url = window.URL.createObjectURL(blob);
  // Tạo một thẻ <a> ẩn
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename; // Đặt tên file tải về
  // Thêm thẻ <a> vào DOM, click nó, rồi xóa đi
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url); // Giải phóng URL tạm thời
  document.body.removeChild(a);
};

export default function AdminEventManagement() {
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
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleApproveEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn duyệt sự kiện này?")) {
      return;
    }
    try {
      await eventApi.approve(eventId);
      toast.success("Duyệt sự kiện thành công!");
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      toast.error(err.response?.data?.error || "Không thể duyệt sự kiện.");
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn từ chối sự kiện này?")) {
      return;
    }
    try {
      await eventApi.reject(eventId);
      toast.success("Từ chối sự kiện thành công!");
      fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      toast.error(err.response?.data?.error || "Không thể từ chối sự kiện.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm(
        "Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.")) {
      return;
    }
    try {
      await eventApi.delete(eventId);
      toast.success("Xóa sự kiện thành công!");
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.error || "Không thể xóa sự kiện.");
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
    toast.info(`Đang chuẩn bị file ${format.toUpperCase()}...`);

    try {
      // Gọi API export sự kiện
      const response = await adminApi.exportEvents(format);
      const filename = `events.${format}`;

      downloadFile(response.data, filename);
      toast.success(`Đã xuất danh sách sự kiện (${format.toUpperCase()})!`);
    } catch (err) {
      console.error("Lỗi khi xuất sự kiện:", err);
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setExporting(false);
    }
  };

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

  return (
      <Container maxWidth="lg" sx={{py: 4}}>
        <Box display="flex" justifyContent="space-between" alignItems="center"
             mb={3}>
          <Typography variant="h4">
            Quản lý sự kiện
          </Typography>
          <Box>
            <Button
                sx={{mr: 1}}
                variant="outlined"
                onClick={() => handleExportEvents('csv')}
                disabled={exporting}
            >
              {exporting ? 'Đang xuất...' : 'Xuất CSV'}
            </Button>
            <Button
                sx={{mr: 1}}
                variant="outlined"
                onClick={() => handleExportEvents('json')}
                disabled={exporting}
            >
              {exporting ? 'Đang xuất...' : 'Xuất JSON'}
            </Button>
            <Button
                variant="outlined"
                startIcon={<RefreshIcon/>}
                onClick={fetchEvents}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {
            error && (
                <Alert severity="error" sx={{mb: 2}}>
                  {error}
                </Alert>
            )
        }

        <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
          <Tabs value={statusFilter} onChange={handleTabChange}>
            <Tab label="Chờ duyệt" value="pending"/>
            <Tab label="Đã duyệt" value="approved"/>
            <Tab label="Đã từ chối" value="rejected"/>
            <Tab label="Đã hủy" value="cancelled"/>
            <Tab label="Tất cả" value="all"/>
          </Tabs>
        </Box>

        {
          events.length === 0 ? (
              <Alert severity="info">
                Không có sự kiện nào ở trạng thái này.
              </Alert>
          ) : (
              events.map(event => (
                  <EventCard
                      key={event.id}
                      event={event}
                      showStatus={true}
                      showOrganizerName={true}
                      onApprove={event.status === 'pending' ? handleApproveEvent
                          : null}
                      onReject={event.status === 'pending' ? handleRejectEvent
                          : null}
                      onDelete={handleDeleteEvent}
                  />
              ))
          )
        }
      </Container>
  )
      ;
}

