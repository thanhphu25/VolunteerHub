import React from "react";
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  Stack,
  IconButton,
  Divider,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import { useThemeMode } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

// Import logo đồng bộ với NavBar
import logo from "../assets/logo-removebg.png";

function Footer() {
  const { mode } = useThemeMode();
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  const bgColor = mode === "dark" ? "#0f172a" : "#ffffff";
  const borderColor =
    mode === "dark" ? "rgb(30, 41, 59)" : "rgb(226, 232, 240)";

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: bgColor,
        pt: 2, // 1. GIẢM KHOẢNG CÁCH Ở ĐẦU (từ 8 xuống 2) để các cột cao sát lên trên
        pb: 4,
        borderTop: `1px solid ${borderColor}`,
        transition: "background-color 0.3s ease",
      }}
    >
      <Container maxWidth="xl">
        <Grid container spacing={6}>
          {/* CỘT 1: BRANDING */}
          <Grid item xs={12} md={4}>
            <Box
              component={RouterLink}
              to="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                mb: 2, // Giảm margin-bottom để đồng bộ độ cao
              }}
            >
              <Box
                component="img"
                src={logo}
                alt="Volunteer Hub Logo"
                sx={{ height: 50, mr: 2 }}
              />
              <Typography
                variant="h5"
                noWrap
                className="font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-cyan-600"
              >
                VOLUNTEER HUB
              </Typography>
            </Box>
            <Typography
              variant="body2"
              className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm"
            >
              {"Kết nối - Hành động - Thay đổi"}
            </Typography>
            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              {[FacebookIcon, TwitterIcon, InstagramIcon, LinkedInIcon].map(
                (Icon, index) => (
                  <IconButton
                    key={index}
                    size="small"
                    className="bg-slate-100 hover:text-teal-600 dark:bg-slate-800 text-slate-500"
                  >
                    <Icon fontSize="small" />
                  </IconButton>
                )
              )}
            </Stack>
          </Grid>

          {/* CỘT 2: LIÊN KẾT (CHỈNH CAO & THƯA) */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
              {" "}
              {/* mb: 3 giúp tiêu đề gần nội dung hơn */}
              {language === "vi" ? "Liên kết" : "Quick Links"}
            </Typography>
            <Stack spacing={2.5}>
              {" "}
              {/* 2. TĂNG SPACING để các dòng thưa ra */}
              {[
                { name: t("nav.home"), path: "/" },
                { name: t("nav.events"), path: "/events" },
                { name: t("nav.register"), path: "/register" },
              ].map((item) => (
                <Link
                  key={item.name}
                  component={RouterLink}
                  to={item.path}
                  sx={{ lineHeight: 2.2, fontSize: "0.95rem" }} // 3. TĂNG LINE-HEIGHT để cột trông cao lên
                  className="text-slate-500 hover:text-teal-600 no-underline transition-colors"
                >
                  {item.name}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* CỘT 3: HỖ TRỢ (CHỈNH CAO & THƯA) */}
          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
              {language === "vi" ? "Hỗ trợ" : "Support"}
            </Typography>
            <Stack spacing={2.5}>
              {["Hướng dẫn", "Chính sách bảo mật", "Điều khoản"].map((text) => (
                <Link
                  key={text}
                  href="#"
                  sx={{ lineHeight: 2.2, fontSize: "0.95rem" }}
                  className="text-slate-500 hover:text-teal-600 no-underline transition-colors"
                >
                  {text}
                </Link>
              ))}
            </Stack>
          </Grid>

          {/* CỘT 4: LIÊN HỆ (CHỈNH CAO & THƯA) */}
          <Grid item xs={12} md={4}>
            <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 3 }}>
              {language === "vi" ? "Liên hệ" : "Contact"}
            </Typography>
            <Stack spacing={4}>
              {" "}
              {/* Spacing lớn hơn để phân tách rõ ràng các khối thông tin */}
              <Box>
                <Typography
                  variant="caption"
                  className="text-slate-400 uppercase font-bold"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Email
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", lineHeight: 1.5 }}
                >
                  support@volunteerhub.vn
                </Typography>
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  className="text-slate-400 uppercase font-bold"
                  sx={{ display: "block", mb: 0.5 }}
                >
                  Hotline
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ fontSize: "1rem", lineHeight: 1.5 }}
                >
                  +84 (0) 123 456 789
                </Typography>
              </Box>
            </Stack>
          </Grid>
        </Grid>

        <Divider sx={{ mt: 6, mb: 4, borderColor: borderColor }} />

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="caption" className="text-slate-500">
            © {currentYear} Volunteer Hub. All rights reserved.
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}

export default Footer;
