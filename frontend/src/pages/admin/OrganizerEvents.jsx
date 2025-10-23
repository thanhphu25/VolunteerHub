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
// Import useNavigate nếu bạn cần dùng
// import { useNavigate } from "react-router-dom";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  // const navigate = useNavigate(); // Bỏ comment nếu cần dùng

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventApi.getMyEvents({page: 0, size: 100});
      setEvents(response.data.content || response.data || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
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
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await eventApi.create(formData);
        toast.success("Tạo sự kiện thành công! Đang chờ duyệt.");
      }
      handleCloseModal();
      await fetchMyEvents();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(
          err.response?.data?.message || err.response?.data?.error
          || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!eventApi.cancel) {
      toast.error("Chức năng hủy sự kiện chưa được định nghĩa trong API.");
      return;
    }
    if (!window.confirm(
        "Bạn có chắc chắn muốn hủy sự kiện này? (Hành động này không thể hoàn tác)")) {
      return;
    }
    try {
      await eventApi.cancel(eventId);
      toast.success("Hủy sự kiện thành công!");
      await fetchMyEvents();
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error
          || "Không thể hủy sự kiện.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!eventApi.delete) {
      toast.error("Chức năng xóa sự kiện chưa được định nghĩa trong API.");
      return;
    }
    if (!window.confirm(
        "Bạn có chắc chắn muốn xóa sự kiện này? (Hành động này không thể hoàn tác)")) {
      return;
    }
    try {
      await eventApi.delete(eventId);
      toast.success("Xóa sự kiện thành công!");
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
            // Đảm bảo Grid bao ngoài có prop 'container'
            <Grid container spacing={3}>
              {filteredEvents.map((event) => (
                  <Grid /* item */ xs={12} sm={6} md={4} key={event.id}>
                    <EventCard
                        event={event}
                        showStatus={true}
                        showViewRegistrationsButton={true}
                        onEdit={(event.status === 'pending' || event.status
                            === 'approved') ? handleOpenEditModal : undefined}
                        onCancel={event.status === 'approved'
                            ? handleCancelEvent : undefined}
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
            initialData={currentEvent}
            isEdit={!!currentEvent}
        />
      </Container>
  );
}