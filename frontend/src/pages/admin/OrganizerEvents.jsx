import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from "@mui/material";
import { Add as AddIcon } from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import EventForm from "../../components/EventForm";
import eventApi from "../../api/eventApi";
import { toast } from "react-toastify";

export default function OrganizerEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventApi.getMyEvents();
      setEvents(response.data.content || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    setFormOpen(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    setFormOpen(true);
  };

  const handleFormSubmit = async (formData) => {
    try {
      if (editingEvent) {
        await eventApi.update(editingEvent.id, formData);
        toast.success("Cập nhật sự kiện thành công!");
      } else {
        await eventApi.create(formData);
        toast.success("Tạo sự kiện thành công! Đang chờ duyệt.");
      }
      setFormOpen(false);
      setEditingEvent(null);
      fetchMyEvents();
    } catch (err) {
      console.error("Error submitting form:", err);
      toast.error(err.response?.data?.error || "Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const handleCancelEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn hủy sự kiện này?")) {
      return;
    }
    try {
      await eventApi.cancel(eventId);
      toast.success("Hủy sự kiện thành công!");
      fetchMyEvents();
    } catch (err) {
      console.error("Error cancelling event:", err);
      toast.error(err.response?.data?.error || "Không thể hủy sự kiện.");
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Bạn có chắc chắn muốn xóa sự kiện này?")) {
      return;
    }
    try {
      await eventApi.delete(eventId);
      toast.success("Xóa sự kiện thành công!");
      fetchMyEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(err.response?.data?.error || "Không thể xóa sự kiện.");
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">
          Quản lý sự kiện của tôi
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={handleCreateEvent}
        >
          Tạo sự kiện mới
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={statusFilter} onChange={handleTabChange}>
          <Tab label="Tất cả" value="all" />
          <Tab label="Chờ duyệt" value="pending" />
          <Tab label="Đã duyệt" value="approved" />
          <Tab label="Đã từ chối" value="rejected" />
          <Tab label="Đã hủy" value="cancelled" />
        </Tabs>
      </Box>

      {filteredEvents.length === 0 ? (
        <Alert severity="info">
          {statusFilter === "all" 
            ? "Bạn chưa tạo sự kiện nào."
            : `Không có sự kiện nào ở trạng thái này.`
          }
        </Alert>
      ) : (
        filteredEvents.map(event => (
          <EventCard
            key={event.id}
            event={event}
            showStatus={true}
            onEdit={event.status === 'pending' || event.status === 'approved' ? handleEditEvent : null}
            onCancel={event.status === 'approved' ? handleCancelEvent : null}
            onDelete={event.status !== 'completed' ? handleDeleteEvent : null}
          />
        ))
      )}

      <EventForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEvent(null);
        }}
        onSubmit={handleFormSubmit}
        initialData={editingEvent}
        isEdit={!!editingEvent}
      />
    </Container>
  );
}

