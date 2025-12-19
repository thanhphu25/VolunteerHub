import React, { useEffect, useState, useCallback } from "react";
import EventCard from "../components/EventCard";
import {
  Typography,
  Box,
  CircularProgress,
  Alert,
  Container,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  InputAdornment,
  Pagination,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import eventApi from "../api/eventApi";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useLanguage } from "../context/LanguageContext";

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  sort: "createdAt,desc",
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { isAdmin } = useAuth();
  const { t, language } = useLanguage();

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        status: "approved",
        page: page - 1,
        size: 12,
        sort: filters.sort,
      };

      if (filters.search) params.search = filters.search;
      if (filters.category && filters.category !== "all")
        params.category = filters.category;

      const response = await eventApi.getAll(params);
      setEvents(response.data.content || []);
      setTotalPages(response.data.totalPages || 1);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        language === "vi"
          ? "Không thể tải danh sách sự kiện."
          : "Unable to load events."
      );
    } finally {
      setLoading(false);
    }
  }, [filters, page, language]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
    setPage(1);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh", pb: 8 }}>
      {/* HEADER */}
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 6,
          borderBottom: "1px solid",
          borderColor: "divider",
          mb: 5,
          color: "text.primary",
        }}
      >
        <Container maxWidth="lg">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box>
              <Typography
                variant="h3"
                fontWeight="800"
                color="primary.main"
                gutterBottom
                sx={{ letterSpacing: "-1px" }}
              >
                {t("events.title")}
              </Typography>
              <Typography variant="h6" color="text.secondary" fontWeight="normal">
                {language === "vi"
                  ? "Khám phá và tham gia các hoạt động ý nghĩa."
                  : "Discover and join meaningful activities."}
              </Typography>
            </Box>

            {isAdmin() && (
              <Button
                variant="contained"
                component={Link}
                to="/admin/events"
                sx={{
                  borderRadius: 3,
                  textTransform: "none",
                  fontWeight: "bold",
                  px: 3,
                }}
              >
                {t("events.manage")}
              </Button>
            )}
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* EVENT GRID */}
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        ) : events.length === 0 ? (
          <Box textAlign="center" py={10}>
            <Typography variant="h6" color="text.secondary">
              {t("events.noResults")}
            </Typography>
          </Box>
        ) : (
          <Box
            display="grid"
            gridTemplateColumns={{
              xs: "1fr",                // 📱 Mobile: 1 cột
              sm: "1fr 1fr",            // 💻 Tablet: 2 cột
              md: "1fr 1fr 1fr",        // 🖥️ Desktop: 3 cột
            }}
            gap={{ xs: 2, sm: 3, md: 4 }} // khoảng cách tùy kích thước
            justifyContent="center"
            sx={{
              width: "100%",
              alignItems: "stretch",     // các card cao bằng nhau
            }}
          >
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                showOrganizerName={true}
                sx={{
                  height: "100%",
                  width: "100%",
                  maxWidth: 450,
                  justifySelf: "center",
                }}
              />
            ))}
          </Box>
        )}

        {/* PAGINATION */}
        {!loading && totalPages > 1 && (
          <Box display="flex" justifyContent="center" mt={8}>
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              size="large"
              shape="rounded"
            />
          </Box>
        )}
      </Container>
    </Box>
  );
}
