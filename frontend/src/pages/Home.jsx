import React, {useEffect, useState} from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom";
import {useNavigate} from "react-router-dom";
import eventApi from "../api/eventApi";
import heroImg from "../assets/hero.jpg";
import EventCard from "../components/EventCard";

export default function Home() {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null); // Thêm state cho lỗi

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true); // Bắt đầu loading
        setError(null);   // Reset lỗi
        // Lấy trang đầu, 3 sự kiện đã duyệt, mới nhất (thêm tham số)
        const res = await eventApi.getAll({
          page: 0,
          size: 3,
          status: 'approved',
          sort: 'createdAt,desc'
        });

        // *** SỬA LỖI Ở ĐÂY ***
        // API trả về đối tượng Page, mảng sự kiện nằm trong 'content'
        const eventsArray = res.data.content;

        // Kiểm tra xem eventsArray có phải là mảng không
        if (Array.isArray(eventsArray)) {
          setEvents(eventsArray); // API đã giới hạn size=3, không cần slice
        } else {
          console.error("Dữ liệu sự kiện không phải mảng:", res.data);
          setEvents([]); // Đặt thành mảng rỗng nếu dữ liệu sai
          setError("Không thể xử lý dữ liệu sự kiện nhận được."); // Thông báo lỗi
        }
      } catch (err) {
        console.error("Không thể tải sự kiện:", err);
        setError("Đã xảy ra lỗi khi tải sự kiện nổi bật."); // Set lỗi
      } finally {
        setLoading(false); // Kết thúc loading
      }
    };
    fetchEvents();
  }, []); // Dependency rỗng để chỉ chạy 1 lần khi mount

  return (
      <Box>
        {/* HERO (Giữ nguyên) */}
        <Box
            sx={{
              height: "70vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundImage: `url(${heroImg})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              color: "white",
              textAlign: "center",
              position: "relative",
              "&::before": {
                content: '""',
                position: "absolute",
                inset: 0,
                backgroundColor: "rgba(0,0,0,0.5)",
              },
            }}
        >
          <Box sx={{position: "relative", zIndex: 2}}>
            <Typography variant="h3" fontWeight="bold" gutterBottom>
              Kết nối trái tim – Lan tỏa yêu thương ❤️
            </Typography>
            <Typography variant="h6" sx={{mb: 3}}>
              Tham gia cộng đồng tình nguyện lớn nhất Việt Nam
            </Typography>
            <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate("/events")}
            >
              Khám phá sự kiện
            </Button>
          </Box>
        </Box>

        {/* WHY CHOOSE US (Giữ nguyên) */}
        <Container maxWidth="lg" sx={{mt: 8}}>
          <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
              color="primary"
          >
            Vì sao chọn Volunteer Hub?
          </Typography>
          <Grid
              container
              spacing={4}
              sx={{
                mt: 2,
                display: "grid",
                gridTemplateColumns: {
                  xs: "1fr",      // mobile: 1 cột
                  sm: "1fr 1fr",  // tablet trở lên: 2 cột
                },
                gap: 4,           // khoảng cách giữa các ô
                justifyItems: "center",
                alignItems: "stretch",
              }}
          >
            {[
              {
                title: "Kết nối cộng đồng",
                desc: "Tạo cầu nối giữa những người có cùng đam mê giúp đỡ xã hội."
              },
              {
                title: "Cơ hội trải nghiệm",
                desc: "Tham gia các hoạt động thực tế đầy ý nghĩa và sáng tạo."
              },
              {
                title: "Phát triển bản thân",
                desc: "Rèn luyện kỹ năng làm việc nhóm, lãnh đạo và quản lý dự án."
              },
              {
                title: "Lan tỏa yêu thương",
                desc: "Góp phần mang lại niềm vui và hy vọng cho những hoàn cảnh khó khăn."
              },
            ].map((item, i) => (
                <Paper
                    key={i}
                    elevation={6}
                    sx={{
                      width: "100%",
                      minHeight: 200,
                      p: 4,
                      borderRadius: 4,
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                      transition: "0.3s",
                      "&:hover": {transform: "translateY(-5px)", boxShadow: 8,},
                    }}
                >
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {item.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{
                    wordWrap: "break-word",
                    overflowWrap: "break-word",
                    whiteSpace: "normal",
                    textAlign: "center",
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}>
                    {item.desc}
                  </Typography>
                </Paper>
            ))}
          </Grid>
        </Container>

        {/* SỰ KIỆN NỔI BẬT */}
        <Container maxWidth="lg" sx={{mt: 8, mb: 10}}>
          <Typography
              variant="h4"
              align="center"
              fontWeight="bold"
              gutterBottom
              color="primary"
          >
            Sự kiện nổi bật 🌟
          </Typography>

          {loading ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress/>
              </Box>
          ) : error ? (
              <Alert severity="error" sx={{mt: 4}}>{error}</Alert>
          ) : events.length > 0 ? (
              <>
                <Grid container spacing={4} sx={{mt: 2}}>
                  {events.map((event) => (
                      <Grid xs={12} sm={6} md={4} key={event.id}>
                        <EventCard event={event} showOrganizerName={true}/>
                      </Grid>
                  ))}
                </Grid>
                {/* Nút xem thêm */}
                <Box textAlign="center" mt={4}>
                  <Button variant="outlined" component={RouterLink}
                          to="/events">
                    Xem tất cả sự kiện
                  </Button>
                </Box>
              </>
          ) : (
              <Typography align="center" sx={{mt: 4}}>
                Hiện chưa có sự kiện nào được duyệt.
              </Typography>
          )}
        </Container>
      </Box>
  );
}