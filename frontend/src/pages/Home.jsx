import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  Avatar,
} from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import eventApi from "../api/eventApi";
import EventCard from "../components/EventCard";
import PopularEventsSlider from "../components/PopularEventsSlider";
import NewestEventsList from "../components/NewestEventsList";
import { useLanguage } from "../context/LanguageContext";
import HeroSlider from "../components/HeroSlider";
import {
  People as PeopleIcon,
  Event as EventIcon,
  Chat as ChatIcon,
  AccessTime as AccessTimeIcon,
  VolunteerActivism as VolunteerIcon,
  Campaign as CampaignIcon,
} from "@mui/icons-material";

export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [popularEvents, setPopularEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔥 Lấy dữ liệu cho cả 2 phần: Nổi bật và Mới nhất
  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch parallel
        const [popularRes, recentRes] = await Promise.all([
          eventApi.getAll({
            page: 0,
            size: 5,
            status: "approved",
            sort: "popularity",
          }),
          eventApi.getAll({
            page: 0,
            size: 5,
            status: "approved",
            sort: "recent_activity",
          })
        ]);

        const popEvents = popularRes.data.content || [];
        const recEvents = recentRes.data.content || [];

        setPopularEvents(popEvents);
        setRecentEvents(recEvents);

      } catch (err) {
        console.error("Không thể tải dữ liệu trang chủ:", err);
        setError("Đã xảy ra lỗi khi tải dữ liệu sự kiện.");
      } finally {
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  const features = [
    {
      icon: <PeopleIcon sx={{ fontSize: 48 }} />,
      title: t("home.features.volunteerManagement.title"),
      description: t("home.features.volunteerManagement.desc"),
      color: "#0288d1",
    },
    {
      icon: <EventIcon sx={{ fontSize: 48 }} />,
      title: t("home.features.eventManagement.title"),
      description: t("home.features.eventManagement.desc"),
      color: "#00bcd4",
    },
    {
      icon: <ChatIcon sx={{ fontSize: 48 }} />,
      title: t("home.features.communication.title"),
      description: t("home.features.communication.desc"),
      color: "#0288d1",
    },
    {
      icon: <AccessTimeIcon sx={{ fontSize: 48 }} />,
      title: t("home.features.tracking.title"),
      description: t("home.features.tracking.desc"),
      color: "#00bcd4",
    },
  ];

  const whyChooseFeatures = [
    {
      title: t("home.whyChoose.features.connect.title"),
      desc: t("home.whyChoose.features.connect.desc"),
      icon: <VolunteerIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: t("home.whyChoose.features.experience.title"),
      desc: t("home.whyChoose.features.experience.desc"),
      icon: <CampaignIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: t("home.whyChoose.features.develop.title"),
      desc: t("home.whyChoose.features.develop.desc"),
      icon: <PeopleIcon sx={{ fontSize: 40 }} />,
    },
    {
      title: t("home.whyChoose.features.spread.title"),
      desc: t("home.whyChoose.features.spread.desc"),
      icon: <VolunteerIcon sx={{ fontSize: 40 }} />,
    },
  ];

  const testimonials = [
    {
      name: "Nguyễn Văn A",
      role: "Tình nguyện viên",
      organization: "Tổ chức X",
      quote:
        "VolunteerHub đã giúp tôi tìm được nhiều cơ hội tình nguyện ý nghĩa. Giao diện dễ sử dụng và cộng đồng rất tích cực!",
    },
    {
      name: "Trần Thị B",
      role: "Người tổ chức",
      organization: "Tổ chức Y",
      quote:
        "Công cụ quản lý sự kiện tuyệt vời! Tôi có thể dễ dàng tạo và quản lý các sự kiện tình nguyện của mình.",
    },
    {
      name: "Lê Văn C",
      role: "Tình nguyện viên",
      organization: "Tổ chức Z",
      quote:
        "Trải nghiệm tuyệt vời! Tôi đã tham gia nhiều hoạt động và gặp gỡ được nhiều người bạn mới.",
    },
  ];

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8 }}>
      {/* HERO SLIDER */}
      <HeroSlider />

      {/* FEATURED EVENTS SECTION */}
      <Box sx={{ bgcolor: "background.paper", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6, color: "primary.main" }}
          >
            {t("home.events.title")}
          </Typography>

          {loading ? (
            <Box display="flex" justifyContent="center" mt={4}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Alert severity="error" sx={{ mt: 4 }}>
              {error}
            </Alert>
          ) : (
            <Grid container spacing={3} sx={{ flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
              {/* Popular Events Slider (Left 60%) */}
              <Grid item xs={12} md={7} sx={{
                minWidth: 0,
                width: { md: '60%' },
                flexBasis: { md: '60%' },
                maxWidth: { md: '60%' },
                overflow: 'hidden'
              }}>
                <PopularEventsSlider events={popularEvents} />
              </Grid>

              {/* Newest Events List (Right 40%) */}
              <Grid item xs={12} md={5} sx={{
                width: { md: '40%' },
                flexBasis: { md: '40%' },
                maxWidth: { md: '40%' },
                minWidth: '300px' // Slightly wider min-width for better list display
              }}>
                <NewestEventsList events={recentEvents} />
              </Grid>
            </Grid>
          )}

          <Box textAlign="center" mt={6}>
            <Button
              variant="contained"
              size="large"
              component={RouterLink}
              to="/events"
              sx={{
                px: 5,
                py: 1.5,
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: 3,
              }}
            >
              {t("home.events.viewAll")}
            </Button>
          </Box>
        </Container>
      </Box>

      {/* WHY CHOOSE US SECTION */}
      <Container id="why-choose-us" maxWidth="lg" sx={{ mt: 10, mb: 8, scrollMarginTop: "100px" }}>
        <Typography
          variant="h2"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 6, color: "primary.main" }}
        >
          {t("home.whyChoose.title")}
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {whyChooseFeatures.map((item, i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 3,
                  textAlign: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  transition: "all 0.3s ease",
                  border: "1px solid",
                  borderColor: "divider",
                  "&:hover": {
                    transform: "translateY(-8px)",
                    boxShadow: "0 8px 24px rgba(2, 136, 209, 0.15)",
                    borderColor: "primary.main",
                  },
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    color: "primary.main",
                  }}
                >
                  {item.icon}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {item.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  {item.desc}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* FEATURES SECTION */}
      <Box sx={{ bgcolor: "background.default", py: 10 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            align="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6, color: "primary.main" }}
          >
            {t("home.features.title")}
          </Typography>
          <Grid container spacing={4} justifyContent="center">
            {features.map((feature, i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Card
                  elevation={0}
                  sx={{
                    height: "100%",
                    borderRadius: 3,
                    textAlign: "center",
                    p: 3,
                    transition: "all 0.3s ease",
                    border: "1px solid",
                    borderColor: "divider",
                    "&:hover": {
                      transform: "translateY(-8px)",
                      boxShadow: "0 12px 32px rgba(2, 136, 209, 0.2)",
                      borderColor: feature.color,
                    },
                  }}
                >
                  <CardContent>
                    <Box sx={{ color: feature.color, mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h6" fontWeight="bold" gutterBottom>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* TESTIMONIALS SECTION */}
      <Container maxWidth="lg" sx={{ mt: 10, mb: 8 }}>
        <Typography
          variant="h2"
          align="center"
          fontWeight="bold"
          gutterBottom
          sx={{ mb: 2, color: "primary.main" }}
        >
          {t("home.testimonials.title")}
        </Typography>
        <Typography
          variant="body1"
          align="center"
          color="text.secondary"
          sx={{ mb: 6 }}
        >
          {t("home.testimonials.subtitle")}
        </Typography>
        <Grid container spacing={4}>
          {testimonials.map((testimonial, i) => (
            <Grid item xs={12} md={4} key={i}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  height: "100%",
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                    transform: "translateY(-4px)",
                  },
                }}
              >
                <Typography
                  variant="body1"
                  sx={{
                    fontStyle: "italic",
                    mb: 3,
                    color: "text.primary",
                    lineHeight: 1.7,
                  }}
                >
                  "{testimonial.quote}"
                </Typography>
                <Box display="flex" alignItems="center" gap={2}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56 }}>
                    {testimonial.name.charAt(0)}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {testimonial.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {testimonial.role} • {testimonial.organization}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
}
