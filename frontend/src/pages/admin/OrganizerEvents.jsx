import React, {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Tab,
  Tabs,
  Typography
} from "@mui/material";
import {Add as AddIcon} from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import EventForm from "../../components/EventForm";
import eventApi from "../../api/eventApi";
import {toast} from "react-toastify";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null); // State lưu event đang sửa (Keep this one)
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      // Assuming eventApi.getMyEvents returns paginated data like { content: [...] }
      // Lấy hết sự kiện hoặc có phân trang phù hợp
      const response = await eventApi.getMyEvents({page: 0, size: 100});
      // Xử lý cả response có content (phân trang) và không có (trả về mảng trực tiếp)
      setEvents(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setCurrentEvent(null); // Reset current event for creation
    setFormOpen(true);
  };

  // Keep handleOpenEditModal, remove handleEditEvent
  const handleOpenEditModal = (eventToEdit) => {
    setCurrentEvent(eventToEdit); // Use the correct state setter
    setFormOpen(true);
  };

  const handleCloseModal = () => {
    setFormOpen(false);
    setCurrentEvent(null); // Reset event đang sửa khi đóng modal
  }

  const handleFormSubmit = async (formData) => {
    try {
      // Use currentEvent to check if editing
      if (currentEvent) {
        await eventApi.update(currentEvent.id, formData);
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await eventApi.create(formData);
        toast.success("Tạo sự kiện thành công! Đang chờ duyệt.");
      }
      handleCloseModal(); // Close modal and reset state
      await fetchMyEvents(); // Fetch updated list
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(
          err.response?.data?.message || err.response?.data?.error
          || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleCancelEvent = async (eventId) => {
    // Kiểm tra xem eventApi có hàm cancel không, nếu chưa thì cần thêm ở eventApi.js
    if (!eventApi.cancel) {
      toast.error("Chức năng hủy sự kiện chưa được định nghĩa trong API.");
      return;
    }
    if (!window.confirm(
        "Bạn có chắc chắn muốn hủy sự kiện này? (Hành động này không thể hoàn tác)")) {
      return;
    }
    try {
      await eventApi.cancel(eventId); // Gọi API hủy
      toast.success("Hủy sự kiện thành công!");
      await fetchMyEvents(); // Tải lại danh sách
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error
          || "Không thể hủy sự kiện.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    // Kiểm tra xem eventApi có hàm delete không
    if (!eventApi.delete) {
      toast.error("Chức năng xóa sự kiện chưa được định nghĩa trong API.");
      return;
    }
    if (!window.confirm(
        "Bạn có chắc chắn muốn xóa sự kiện này? (Hành động này không thể hoàn tác)")) {
      return;
    }
    try {
      await eventApi.delete(eventId); // Gọi API xóa
      toast.success("Xóa sự kiện thành công!");
      // Tải lại danh sách sự kiện sau khi xóa thành công
      await fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error
          || "Không thể xóa sự kiện.");
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  // Filter events based on the selected tab
  const filteredEvents = statusFilter === "all"
      ? events
      : events.filter(e => e.status === statusFilter);

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
          <Typography variant="h4" component="h1">
            Quản lý sự kiện của tôi
          </Typography>
          <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon/>}
              onClick={handleCreateEvent}
          >
            Tạo sự kiện mới
          </Button>
        </Box>

        {error && (
            <Alert severity="error" sx={{mb: 2}}>
              {error}
            </Alert>
        )}

        {/* Filter Tabs */}
        <Box sx={{borderBottom: 1, borderColor: 'divider', mb: 3}}>
          <Tabs value={statusFilter} onChange={handleTabChange}
                variant="scrollable" scrollButtons="auto">
            <Tab label="Tất cả" value="all"/>
            <Tab label="Chờ duyệt" value="pending"/>
            <Tab label="Đã duyệt" value="approved"/>
            <Tab label="Đã từ chối" value="rejected"/>
            <Tab label="Đã hủy" value="cancelled"/>
            <Tab label="Hoàn thành" value="completed"/>
          </Tabs>
        </Box>

        {/* Event List using Grid */}
        {filteredEvents.length === 0 ? (
            <Alert severity="info" sx={{mt: 3}}>
              {statusFilter === "all"
                  ? "Bạn chưa tạo sự kiện nào."
                  : `Không có sự kiện nào ở trạng thái "${statusFilter}".`
              }
            </Alert>
        ) : (
            <Grid container spacing={3}>
              {/* Use filteredEvents for mapping */}
              {filteredEvents.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <EventCard
                        event={event}
                        showStatus={true}
                        showViewRegistrationsButton={true} // Show button to view registrations
                        // Only allow editing if pending or approved
                        onEdit={(event.status === 'pending' || event.status
                            === 'approved') ? handleOpenEditModal : undefined}
                        // Only allow cancelling if approved
                        onCancel={event.status === 'approved'
                            ? handleCancelEvent : undefined}
                        // Allow deleting unless completed (adjust as needed)
                        onDelete={event.status !== 'completed'
                            ? handleDeleteEvent : undefined}
                    />
                  </Grid>
              ))}
            </Grid>
        )}

        {/* Event Form Modal */}
        <EventForm
            open={formOpen}
            onClose={handleCloseModal}
            onSubmit={handleFormSubmit}
            initialData={currentEvent} // Use currentEvent for initial data
            isEdit={!!currentEvent} // Determine edit mode based on currentEvent
        />
      </Container>
  );
}