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
  Typography,
  Paper,
} from "@mui/material";
import {Add as AddIcon} from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import EventForm from "../../components/EventForm";
import eventApi from "../../api/eventApi";
import {toast} from "react-toastify";
import {useLanguage} from "../../context/LanguageContext";

export default function OrganizerEvents() {
  const {t, language} = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

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
      setError(language === "vi" ? "Không thể tải danh sách sự kiện. Vui lòng thử lại sau." : "Unable to load events. Please try again later.");
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
        toast.success(language === "vi" ? "Cập nhật sự kiện thành công!" : "Event updated successfully!");
      } else {
        await eventApi.create(formData);
        toast.success(language === "vi" ? "Tạo sự kiện thành công! Đang chờ duyệt." : "Event created successfully! Pending approval.");
      }
      handleCloseModal();
      await fetchMyEvents();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(
          err.response?.data?.message || err.response?.data?.error
          || (language === "vi" ? "Có lỗi xảy ra. Vui lòng thử lại." : "An error occurred. Please try again."));
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!eventApi.cancel) {
      toast.error(language === "vi" ? "Chức năng hủy sự kiện chưa được định nghĩa trong API." : "Cancel event function not defined in API.");
      return;
    }
    if (!window.confirm(
        language === "vi"
            ? "Bạn có chắc chắn muốn hủy sự kiện này? (Hành động này không thể hoàn tác)"
            : "Are you sure you want to cancel this event? (This action cannot be undone)")) {
      return;
    }
    try {
      await eventApi.cancel(eventId);
      toast.success(language === "vi" ? "Hủy sự kiện thành công!" : "Event cancelled successfully!");
      await fetchMyEvents();
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error
          || (language === "vi" ? "Không thể hủy sự kiện." : "Unable to cancel event."));
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!eventApi.delete) {
      toast.error(language === "vi" ? "Chức năng xóa sự kiện chưa được định nghĩa trong API." : "Delete event function not defined in API.");
      return;
    }
    if (!window.confirm(
        language === "vi"
            ? "Bạn có chắc chắn muốn xóa sự kiện này? (Hành động này không thể hoàn tác)"
            : "Are you sure you want to delete this event? (This action cannot be undone)")) {
      return;
    }
    try {
      await eventApi.delete(eventId);
      toast.success(language === "vi" ? "Xóa sự kiện thành công!" : "Event deleted successfully!");
      await fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.message || err.response?.data?.error
          || (language === "vi" ? "Không thể xóa sự kiện." : "Unable to delete event."));
    }
  };

  const handleTabChange = (event, newValue) => {
    setStatusFilter(newValue);
  };

  const filteredEvents = statusFilter === "all"
      ? events
      : events.filter(e => e.status === statusFilter);

  const statusTabs = [
    {value: "all", label: language === "vi" ? "Tất cả" : "All"},
    {value: "pending", label: language === "vi" ? "Chờ duyệt" : "Pending"},
    {value: "approved", label: language === "vi" ? "Đã duyệt" : "Approved"},
    {value: "rejected", label: language === "vi" ? "Đã từ chối" : "Rejected"},
    {value: "cancelled", label: language === "vi" ? "Đã hủy" : "Cancelled"},
    {value: "completed", label: language === "vi" ? "Hoàn thành" : "Completed"},
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
              {language === "vi" ? "Quản lý sự kiện của tôi" : "My Events"}
            </Typography>
            <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon/>}
                onClick={handleCreateEvent}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  px: 4,
                  py: 1.5,
                  boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
                  "&:hover": {
                    boxShadow: "0 6px 16px rgba(2, 136, 209, 0.4)",
                    transform: "translateY(-1px)",
                  },
                  transition: "all 0.3s ease",
                }}
            >
              {language === "vi" ? "Tạo sự kiện mới" : "Create New Event"}
            </Button>
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

          {filteredEvents.length === 0 ? (
              <Alert severity="info" sx={{borderRadius: 2}}>
                {statusFilter === "all"
                    ? (language === "vi" ? "Bạn chưa tạo sự kiện nào." : "You haven't created any events.")
                    : (language === "vi" ? `Không có sự kiện nào ở trạng thái "${statusFilter}".` : `No events with status "${statusFilter}".`)
                }
              </Alert>
          ) : (
              <Grid container spacing={3} sx={{alignItems: 'stretch'}}>
                {filteredEvents.map((event) => (
                    <Grid item xs={12} sm={6} md={4} key={event.id} sx={{display: 'flex'}}>
                      <EventCard
                          event={event}
                          showStatus={true}
                          showViewRegistrationsButton={true}
                          onEdit={(event.status === 'pending' || event.status === 'approved') ? handleOpenEditModal : undefined}
                          onCancel={event.status === 'approved' ? handleCancelEvent : undefined}
                          onDelete={event.status !== 'completed' ? handleDeleteEvent : undefined}
                      />
                    </Grid>
                ))}
              </Grid>
          )}

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
