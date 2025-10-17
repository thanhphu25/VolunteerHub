import React from "react";
import { Card, CardContent, Typography, Button, CardActions } from "@mui/material";

export default function EventCard({ event }) {
  return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6">{event.title}</Typography>
          <Typography variant="body2" color="text.secondary">
            {event.description}
          </Typography>
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            📅 {event.date} | 📍 {event.location}
          </Typography>
        </CardContent>
        <CardActions>
          <Button size="small" variant="contained">Tham gia</Button>
        </CardActions>
      </Card>
  );
}
