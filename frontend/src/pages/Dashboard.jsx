import React, {useEffect, useState} from "react";
import {Box, Button, Grid, Typography} from "@mui/material";
import {useAuth} from "../context/AuthContext";
import EventCard from "../components/EventCard";
import eventApi from "../api/eventApi";

export default function Dashboard() {
  const {user} = useAuth(); // lấy user từ context
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // tuỳ theo role, gọi API phù hợp
        let res;
        if (user?.role === "organizer") {
          res = await eventApi.getByOrganizer(user.id);
        } else {
          res = await eventApi.getJoinedEvents(user.id);
        }
        setEvents(res.data);
      } catch (error) {
        console.error("Lỗi tải sự kiện:", error);
      }
    };

    if (user) {
      fetchEvents();
    }
  }, [user]);

  return (
      <Box sx={{p: 3}}>
        <Typography variant="h4" sx={{mb: 3}}>
          Xin chào, {user?.fullName || "người dùng"} 👋
        </Typography>

        {user?.role === "organizer" && (
            <Button variant="contained" sx={{mb: 2}}>
              + Tạo sự kiện mới
            </Button>
        )}

        <Grid container spacing={2}>
          {events.length > 0 ? (
              events.map((event) => (
                  <Grid item xs={12} sm={6} md={4} key={event.id}>
                    <EventCard event={event}/>
                  </Grid>
              ))
          ) : (
              <Typography>Không có sự kiện nào.</Typography>
          )}
        </Grid>
      </Box>
  );
}
