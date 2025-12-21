/**
 * Events Page
 * Displays paginated list of volunteer events with advanced filtering and search capabilities.
 * Allows filtering by category, location, date range, and sorting options.
 * Shows admin-specific status filtering for event management.
 *
 * @component
 * @returns {JSX.Element} Events listing page with filter controls and event cards
 */
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
import EventFilter from "../components/EventFilter";

const DEFAULT_FILTERS = {
  search: "",
  category: "all",
  location: "all",
  startDate: null,
  endDate: null,
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
      if (filters.category && filters.category !== "all") params.category = filters.category;
      if (filters.location && filters.location !== "all") params.location = filters.location;
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;

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
      { }
      <Box
        sx={{
          bgcolor: "background.paper",
          py: 3,
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
                variant="h4"
                fontWeight="800"
                color="primary.main"
                gutterBottom
                sx={{ letterSpacing: "-1px" }}
              >
                {t("events.title")}
              </Typography>
              <Typography variant="body2" color="text.secondary" fontWeight="normal">
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


      <Container maxWidth="lg" sx={{ mb: 4 }}>
        <EventFilter
          filters={filters}
          onChange={handleFilterChange}
        />
      </Container>

      <Container maxWidth="lg">
        { }
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
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            }}
            gap={{ xs: 2, sm: 3, md: 4 }}
            justifyContent="center"
            sx={{
              width: "100%",
              alignItems: "stretch",
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

        { }
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
    </Box >
  );
}
