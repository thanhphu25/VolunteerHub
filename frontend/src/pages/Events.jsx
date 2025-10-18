import React, { useEffect, useState } from "react";
import EventCard from "../components/EventCard";
import { Typography, Box, CircularProgress, Alert, Container } from "@mui/material";
import eventApi from "../api/eventApi";

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <Typography variant="h4" gutterBottom>
        Danh sách sự kiện
      </Typography>

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
