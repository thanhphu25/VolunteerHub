import {useEffect, useState} from "react";
import eventApi from "../api/eventApi";

function Events() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await eventApi.getAll();
        setEvents(res.data);
      } catch (err) {
        console.error("Lỗi khi tải sự kiện:", err);
      }
    };
    fetchData();
  }, []);

  return (
      <div>
        <h1>Danh sách sự kiện 🌱</h1>
        {events.map((e) => (
            <div key={e.id}>
              <h3>{e.name}</h3>
              <p>{e.date}</p>
            </div>
        ))}
      </div>
  );
}

export default Events;
