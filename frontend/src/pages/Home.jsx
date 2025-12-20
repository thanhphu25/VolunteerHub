import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
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
  IconButton,
  useTheme,
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
  ArrowBackIosNew as ArrowBackIcon,
  ArrowForwardIos as ArrowForwardIcon,
  FormatQuote as FormatQuoteIcon,
} from "@mui/icons-material";

const getImageUrl = (url) => {
    if (!url) return undefined;
    if (url.startsWith("http")) return url; // Link online giữ nguyên
    return `http://localhost:8080${url}`;  // Link local thêm localhost
};
export default function Home() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const theme = useTheme();
  const [popularEvents, setPopularEvents] = useState([]);
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [slideIndex, setSlideIndex] = useState(0);

  // 🔥 Lấy dữ liệu cho cả 2 phần: Nổi bật và Mới nhất
    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                setLoading(true);
                setError(null);

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

                // --- 2. SỬA ĐOẠN XỬ LÝ DỮ LIỆU NÀY ---
                // Hàm phụ để xử lý danh sách sự kiện
                const processEvents = (events) => events.map(ev => ({
                    ...ev,
                    imageUrl: getImageUrl(ev.imageUrl) // Gọi hàm sửa URL ảnh ở đây
                }));

                const popEvents = processEvents(popularRes.data.content || []);
                const recEvents = processEvents(recentRes.data.content || []);
                // -------------------------------------

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
      name: "Nguyễn Minh Phương",
      role: "Tình nguyện viên",
      organization: "CLB Vì Cộng Đồng",
      quote:
        "Nhờ VolunteerHub, mình đã tìm thấy dự án 'Dạy học cho trẻ em vùng cao' rất phù hợp với chuyên môn sư phạm của mình. Nền tảng giúp mình kết nối với những người bạn có cùng đam mê cống hiến.",
    },
    {
      name: "Trần Đăng Khoa",
      role: "Người tổ chức",
      organization: "Hội Sinh Viên UET",
      quote:
        "VolunteerHub thực sự là một bước tiến lớn trong việc quản lý. Chúng mình tiết kiệm được 70% thời gian duyệt đơn và điểm danh thành viên, giúp các chiến dịch diễn ra trơn tru hơn rất nhiều.",
    },
    {
      name: "Lê Thanh Thảo",
      role: "Tình nguyện viên",
      organization: "Mạng lưới Xanh",
      quote:
        "Hệ thống ghi nhận hoạt động minh bạch giúp mình dễ dàng theo dõi quá trình đóng góp cá nhân. Đây không chỉ là nơi làm tình nguyện, mà còn là nơi giúp mình rèn luyện kỹ năng mềm tuyệt vời.",
    },
    {
      name: "Nguyễn Minh Phương",
      role: "Tình nguyện viên",
      organization: "CLB Vì Cộng Đồng",
      quote:
        "Nhờ VolunteerHub, mình đã tìm thấy dự án 'Dạy học cho trẻ em vùng cao' rất phù hợp với chuyên môn sư phạm của mình. Nền tảng giúp mình kết nối với những người bạn có cùng đam mê cống hiến.",
    },
    {
      name: "Trần Đăng Khoa",
      role: "Người tổ chức",
      organization: "Hội Sinh Viên UET",
      quote:
        "VolunteerHub thực sự là một bước tiến lớn trong việc quản lý. Chúng mình tiết kiệm được 70% thời gian duyệt đơn và điểm danh thành viên, giúp các chiến dịch diễn ra trơn tru hơn rất nhiều.",
    },
    {
      name: "Lê Thanh Thảo",
      role: "Tình nguyện viên",
      organization: "Mạng lưới Xanh",
      quote:
        "Hệ thống ghi nhận hoạt động minh bạch giúp mình dễ dàng theo dõi quá trình đóng góp cá nhân. Đây không chỉ là nơi làm tình nguyện, mà còn là nơi giúp mình rèn luyện kỹ năng mềm tuyệt vời.",
    },
  ];

  const NextArrow = (props) => {
    const { onClick, style, className } = props;
    return (
      <IconButton
        onClick={onClick}
        disableRipple
        sx={{
          position: "absolute",
          right: { xs: 0, md: "-40px" },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "white",
          boxShadow: 3,
          width: 48,
          height: 48,
          "&:hover": { bgcolor: "grey.100" },
          display: "flex", // Force display
        }}
      >
        <ArrowForwardIcon color="primary" />
      </IconButton>
    );
  };

  const PrevArrow = (props) => {
    const { onClick, style, className } = props;
    return (
      <IconButton
        onClick={onClick}
        disableRipple
        sx={{
          position: "absolute",
          left: { xs: 0, md: "-40px" },
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 10,
          bgcolor: "white",
          boxShadow: 3,
          width: 48,
          height: 48,
          "&:hover": { bgcolor: "grey.100" },
          display: "flex", // Force display
        }}
      >
        <ArrowBackIcon color="primary" />
      </IconButton>
    );
  };

  const sliderSettings = {
    className: "center",
    centerMode: true,
    infinite: true,
    centerPadding: "0px",
    slidesToShow: 3,
    speed: 500,
    beforeChange: (current, next) => setSlideIndex(next),
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    responsive: [
      {
        breakpoint: 960,
        settings: {
          slidesToShow: 1,
          centerMode: true,
        },
      },
    ],
  };

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
        <Grid container justifyContent="center">
          <Grid item xs={12}>
            <Box
              sx={{
                ".slick-slide": {
                  padding: "10px",
                  transition: "all 0.3s ease",
                },
                ".slick-center": {
                  transform: "scale(1.1)",
                  zIndex: 10,
                  position: "relative",
                  "& .testimonial-card": {
                    bgcolor: "primary.main",
                    color: "white",
                    boxShadow: 6,
                  },
                  "& .quote-icon": {
                    color: "rgba(255, 255, 255, 0.2)",
                  },
                  "& .text-content": {
                    color: "white",
                  },
                  "& .user-info": {
                    color: "text.primary",
                  }
                },
                ".slick-slide:not(.slick-center)": {
                  transform: "scale(0.9)",
                  filter: "blur(0.5px)",
                  opacity: 0.7,
                  "& .testimonial-card": {
                    bgcolor: "white",
                  },
                },
              }}
            >
              <Slider {...sliderSettings}>
                {testimonials.map((testimonial, i) => (
                  <Box key={i} sx={{ outline: "none", pt: 4, pb: 4 }}>
                    <Box
                      className="testimonial-card"
                      sx={{
                        position: "relative",
                        borderRadius: 4,
                        p: 4,
                        pt: 8,
                        pb: 8,
                        minHeight: 350,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        bgcolor: "white",
                        boxShadow: 2,
                      }}
                    >
                      <FormatQuoteIcon
                        className="quote-icon"
                        sx={{
                          fontSize: 80,
                          color: "grey.200",
                          position: "absolute",
                          top: 20,
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                      <Typography
                        className="text-content"
                        variant="body1"
                        sx={{
                          position: "relative",
                          zIndex: 1,
                          lineHeight: 1.8,
                          fontSize: "1rem",
                          color: "text.secondary",
                          mb: 4,
                        }}
                      >
                        {testimonial.quote}
                      </Typography>
                    </Box>

                    {/* Avatar and Info outside the colored card for center effect, 
                        or inside but styled differently? 
                        User image shows it overlapping the bottom. 
                        Let's position it absolute at bottom. */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        mt: -5,
                        position: "relative",
                        zIndex: 2,
                      }}
                    >
                      <Avatar
                        src={testimonial.image}
                        sx={{
                          width: 80,
                          height: 80,
                          border: "4px solid white",
                          boxShadow: 2,
                          mb: 1,
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight="bold">
                        {testimonial.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {testimonial.role} - {testimonial.organization}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Slider>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}
