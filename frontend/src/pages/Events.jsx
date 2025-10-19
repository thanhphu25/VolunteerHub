import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import {Typography, Box, CircularProgress, Alert, Container, Button} from "@mui/material";
import eventApi from "../api/eventApi";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const {token, user, logout, isAdmin, isOrganizer} = useAuth(); // 👈 token từ context xác định login chưa


    useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await eventApi.getByStatus('approved');
      setEvents(response.data.content || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
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
        <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={3}
        >
            <Typography variant="h4" fontWeight="bold">
                Danh sách sự kiện
            </Typography>

            {isAdmin() && (
                <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to="/admin/events"
                >
                    Quản lý
                </Button>
            )}
        </Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && events.length === 0 && (
        <Alert severity="info">
          Hiện tại chưa có sự kiện nào được phê duyệt.
        </Alert>
      )}

      {events.map(event => (
        <EventCard key={event.id} event={event} />
      ))}
    </Container>
  );
}
