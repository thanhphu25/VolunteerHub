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
  Grid,
  Chip,
  Paper,
  Collapse,
  IconButton,
  OutlinedInput
} from "@mui/material";
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { vi, enUS } from 'date-fns/locale';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import eventApi from "../api/eventApi";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";
import {useLanguage} from "../context/LanguageContext";

const DEFAULT_FILTERS = {
  search: '',
  category: '',
  location: '',
  organizerName: '',
  startDate: new Date(),
  endDate: null,
  timeStatus: ''
};

export default function Events() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(() => ({ ...DEFAULT_FILTERS }));
  const {isAdmin} = useAuth();
  const {t, language} = useLanguage();

  const fetchEvents = useCallback(async (filterParams = {}) => {
    try {
      setLoading(true);
      setError(null);

      const combinedFilters = { ...DEFAULT_FILTERS, ...filters, ...filterParams };

      const params = {
        status: 'approved',
        page: 0,
        size: 50
      };

      if (combinedFilters.search) {
        params.search = combinedFilters.search;
      }
      if (combinedFilters.category) {
        params.category = combinedFilters.category;
      }
      if (combinedFilters.location) {
        params.location = combinedFilters.location;
      }
      if (combinedFilters.organizerName) {
        params.organizerName = combinedFilters.organizerName;
      }
      if (combinedFilters.timeStatus) {
        params.timeStatus = combinedFilters.timeStatus;
      }

      if (combinedFilters.startDate) {
        params.startDate = formatDateParam(combinedFilters.startDate);
      }
      if (combinedFilters.endDate) {
        params.endDate = formatDateParam(combinedFilters.endDate);
      }

      const response = await eventApi.getAll(params);
      setEvents(response.data.content || []);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(language === "vi" ? "Không thể tải danh sách sự kiện. Vui lòng thử lại sau." : "Unable to load events. Please try again later.");
    } finally {
      setLoading(false);
    }
  }, [filters, language]);

  const formatDateParam = (value) => {
    if (!value) return value;
    if (value instanceof Date) {
      const iso = value.toISOString();
      return iso.slice(0, 19); // remove milliseconds and timezone Z
    }
    // assume string already in correct format
    return value;
  };

  useEffect(() => {
    fetchEvents({ startDate: DEFAULT_FILTERS.startDate });
  }, [fetchEvents]);

  const handleFilterChange = (field, value) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyFilters = () => {
    const activeFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});

    fetchEvents(activeFilters);
  };

  const clearFilters = () => {
    const reset = { ...DEFAULT_FILTERS };
    setFilters(reset);
    fetchEvents(reset);
  };

  const hasActiveFilters = Object.entries(filters).some(([, value]) => value && value !== '');

  if (loading) {
    return (
      <Container>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={language === "vi" ? vi : enUS}>
      <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4}}>
        <Container maxWidth="lg">
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={4}
          >
            <Typography variant="h3" fontWeight="bold" sx={{color: "primary.main"}}>
              {t("events.title")}
            </Typography>

            <Box display="flex" gap={2}>
              <Button
                variant="outlined"
                startIcon={<FilterListIcon />}
                onClick={() => setShowFilters(!showFilters)}
                color={hasActiveFilters ? "primary" : "inherit"}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
              >
                {t("events.filters")} {hasActiveFilters && `(${Object.values(filters).filter(v => v && v !== '').length})`}
              </Button>

              {isAdmin() && (
                <Button
                  variant="contained"
                  color="primary"
                  component={Link}
                  to="/admin/events"
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                  }}
                >
                  {t("events.manage")}
                </Button>
              )}
            </Box>
          </Box>

          {/* Filter Panel */}
          <Collapse in={showFilters}>
            <Paper
              elevation={0}
              sx={{
                p: 4,
                mb: 4,
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
              }}
            >
              <Typography variant="h6" fontWeight="bold" gutterBottom sx={{mb: 3}}>
                {t("events.filters")}
              </Typography>

            <Grid container spacing={2} sx={{
                '& > .MuiGrid-item': {
                    minWidth: 0
                }
            }}>
              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label={t("events.search")}
                  placeholder={t("events.searchPlaceholder")}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label={t("events.category")}
                  placeholder={language === "vi" ? "Nhập danh mục..." : "Enter category..."}
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label={t("events.location")}
                  placeholder={language === "vi" ? "Nhập địa điểm..." : "Enter location..."}
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                    fullWidth
                    label={t("events.organizer")}
                    placeholder={language === "vi" ? "Nhập tên tổ chức..." : "Enter organizer name..."}
                    value={filters.organizerName}
                    onChange={(e) => handleFilterChange('organizerName', e.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <FormControl fullWidth>
                  <InputLabel id="time-status-label">{t("events.timeStatus")}</InputLabel>
                  <Select
                    labelId="time-status-label"
                    label={t("events.timeStatus")}
                    value={filters.timeStatus}
                    onChange={(e) => handleFilterChange('timeStatus', e.target.value)}
                    sx={{
                      borderRadius: 2,
                    }}
                  >
                    <MenuItem value="ongoing">{t("events.ongoing")}</MenuItem>
                    <MenuItem value="upcoming">{t("events.upcoming")}</MenuItem>
                    <MenuItem value="ended">{t("events.ended")}</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{xs: 12, md: 3}}>
                <DatePicker
                  label={t("events.fromDate")}
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 3}}>
                <DatePicker
                  label={t("events.toDate")}
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      sx: {
                        "& .MuiOutlinedInput-root": {
                          borderRadius: 2,
                        },
                      },
                    },
                  }}
                />
              </Grid>
            </Grid>

              <Box display="flex" gap={2} mt={3}>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                  }}
                >
                  {t("events.apply")}
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  startIcon={<ClearIcon />}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 4,
                  }}
                >
                  {t("events.clear")}
                </Button>
              </Box>

              {/* Active Filters Chips */}
              {hasActiveFilters && (
                <Box mt={3}>
                  <Typography variant="body2" color="text.secondary" gutterBottom fontWeight={600}>
                    {t("events.activeFilters")}
                  </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {filters.search && (
                    <Chip
                      label={`${t("events.search")}: "${filters.search}"`}
                      onDelete={() => handleFilterChange('search', '')}
                      size="small"
                    />
                  )}
                  {filters.category && (
                    <Chip
                      label={`${t("events.category")}: ${filters.category}`}
                      onDelete={() => handleFilterChange('category', '')}
                      size="small"
                    />
                  )}
                  {filters.location && (
                    <Chip
                      label={`${t("events.location")}: ${filters.location}`}
                      onDelete={() => handleFilterChange('location', '')}
                      size="small"
                    />
                  )}
                  {filters.organizerName && (
                    <Chip
                        label={`${t("events.organizer")}: ${filters.organizerName}`}
                        onDelete={() => handleFilterChange('organizerName', '')}
                      size="small"
                    />
                  )}
                  {filters.startDate && (
                    <Chip
                      label={`${t("events.fromDate")}: ${filters.startDate.toLocaleDateString(language === "vi" ? 'vi-VN' : 'en-US')}`}
                      onDelete={() => handleFilterChange('startDate', null)}
                      size="small"
                    />
                  )}
                  {filters.endDate && (
                    <Chip
                      label={`${t("events.toDate")}: ${filters.endDate.toLocaleDateString(language === "vi" ? 'vi-VN' : 'en-US')}`}
                      onDelete={() => handleFilterChange('endDate', null)}
                      size="small"
                    />
                  )}
                  {filters.timeStatus && (
                    <Chip
                      label={`${t("events.timeStatus")}: ${filters.timeStatus === 'ended' ? t("events.ended") : filters.timeStatus === 'upcoming' ? t("events.upcoming") : t("events.ongoing")}`}
                      onDelete={() => handleFilterChange('timeStatus', '')}
                      size="small"
                    />
                  )}
                </Box>
              </Box>
            )}
          </Paper>
        </Collapse>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          {!loading && events.length === 0 && (
            <Alert severity="info" sx={{ borderRadius: 2 }}>
              {hasActiveFilters
                ? t("events.noResults")
                : t("events.noEvents")
              }
            </Alert>
          )}

          {events.length > 0 && (
            <Grid container spacing={3} sx={{alignItems: 'stretch', width: '100%', margin: 0}}>
              {events.map(event => (
                <Grid 
                  item
                  size={{xs: 12, sm: 6, md: 6}}
                  key={event.id} 
                  sx={{
                    display: 'flex', 
                    minHeight: 0,
                  }}
                >
                  <EventCard event={event} />
                </Grid>
              ))}
            </Grid>
          )}
        </Container>
      </Box>
    </LocalizationProvider>
  );
}
