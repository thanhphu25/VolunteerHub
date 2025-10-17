import React from "react";
import EventCard from "../components/EventCard";
import {Typography} from "@mui/material";

export default function Events() {
  const dummyEvents = [
    {
      id: 1,
      title: "Dọn rác bãi biển Cần Giờ",
      description: "Cùng nhau làm sạch môi trường biển và bảo vệ sinh thái 🌊",
      date: "2025-11-10",
      location: "Cần Giờ, TP. HCM"
    },
    {
      id: 2,
      title: "Hiến máu nhân đạo",
      description: "Chương trình hiến máu tình nguyện nhằm cứu giúp người bệnh ❤️",
      date: "2025-12-05",
      location: "Bệnh viện Chợ Rẫy"
    }
  ];

  return (
      <>
        <Typography variant="h4" gutterBottom>
          Danh sách sự kiện
        </Typography>
        {dummyEvents.map(event => (
            <EventCard key={event.id} event={event}/>
        ))}
      </>
  );
}
