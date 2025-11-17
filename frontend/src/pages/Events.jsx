import React, { useEffect, useState } from "react";
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
import { vi } from 'date-fns/locale';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';
import eventApi from "../api/eventApi";
import {Link} from "react-router-dom";
import {useAuth} from "../context/AuthContext.jsx";

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
  const [categories, setCategories] = useState([]);
  const {token, user, logout, isAdmin, isOrganizer} = useAuth();

  useEffect(() => {
    fetchEvents({ startDate: DEFAULT_FILTERS.startDate });
    fetchCategories();
  }, []);

  const fetchEvents = async (filterParams = {}) => {
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
      setError("Không thể tải danh sách sự kiện. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const formatDateParam = (value) => {
    if (!value) return value;
    if (value instanceof Date) {
      const iso = value.toISOString();
      return iso.slice(0, 19); // remove milliseconds and timezone Z
    }
    // assume string already in correct format
    return value;
  };

  const fetchCategories = async () => {
    try {
      // Get all events to extract unique categories
      const response = await eventApi.getAll({ status: 'approved', size: 1000 });
      const uniqueCategories = [...new Set(response.data.content?.map(event => event.category) || [])];
      setCategories(uniqueCategories);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

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
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={vi}>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h4" fontWeight="bold">
            Danh sách sự kiện
          </Typography>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
              onClick={() => setShowFilters(!showFilters)}
              color={hasActiveFilters ? "primary" : "inherit"}
            >
              Bộ lọc {hasActiveFilters && `(${Object.values(filters).filter(v => v && v !== '').length})`}
            </Button>

            {isAdmin() && (
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/admin/events"
              >
                Quản lý
              </Button>
            )}
          </Box>
        </Box>

        {/* Filter Panel */}
        <Collapse in={showFilters}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Bộ lọc sự kiện
            </Typography>

            <Grid container spacing={2} sx={{
                '& > .MuiGrid-item': {
                    minWidth: 0
                }
            }}>
              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label="Tìm kiếm"
                  placeholder="Tìm theo tên hoặc mô tả sự kiện..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label="Danh mục"
                  placeholder="Nhập danh mục..."
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                  fullWidth
                  label="Địa điểm"
                  placeholder="Nhập địa điểm..."
                  value={filters.location}
                  onChange={(e) => handleFilterChange('location', e.target.value)}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <TextField
                    fullWidth
                    label="Tên người tổ chức"
                    placeholder="Nhập tên tổ chức..."
                    value={filters.organizerName}
                    onChange={(e) => handleFilterChange('organizerName', e.target.value)}
                />
              </Grid>

              <Grid size={{xs: 12, md: 6}}>
                <FormControl fullWidth>
                  <InputLabel id="time-status-label">Trạng thái thời gian</InputLabel>
                  <Select
                    labelId="time-status-label"
                    label="Trạng thái thời gian"
                    value={filters.timeStatus}
                    onChange={(e) => handleFilterChange('timeStatus', e.target.value)}
                  >
                    <MenuItem value="ongoing">Đang diễn ra</MenuItem>
                    <MenuItem value="upcoming">Chưa diễn ra</MenuItem>
                    <MenuItem value="ended">Đã kết thúc</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid size={{xs: 12, md: 3}}>
                <DatePicker
                  label="Từ ngày"
                  value={filters.startDate}
                  onChange={(date) => handleFilterChange('startDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>

              <Grid size={{xs: 12, md: 3}}>
                <DatePicker
                  label="Đến ngày"
                  value={filters.endDate}
                  onChange={(date) => handleFilterChange('endDate', date)}
                  slotProps={{ textField: { fullWidth: true } }}
                />
              </Grid>
            </Grid>

            <Box display="flex" gap={2} mt={2}>
              <Button variant="contained" onClick={applyFilters}>
                Áp dụng bộ lọc
              </Button>
              <Button variant="outlined" onClick={clearFilters} startIcon={<ClearIcon />}>
                Xóa bộ lọc
              </Button>
            </Box>

            {/* Active Filters Chips */}
            {hasActiveFilters && (
              <Box mt={2}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Bộ lọc đang áp dụng:
                </Typography>
                <Box display="flex" gap={1} flexWrap="wrap">
                  {filters.search && (
                    <Chip
                      label={`Tìm kiếm: "${filters.search}"`}
                      onDelete={() => handleFilterChange('search', '')}
                      size="small"
                    />
                  )}
                  {filters.category && (
                    <Chip
                      label={`Danh mục: ${filters.category}`}
                      onDelete={() => handleFilterChange('category', '')}
                      size="small"
                    />
                  )}
                  {filters.location && (
                    <Chip
                      label={`Địa điểm: ${filters.location}`}
                      onDelete={() => handleFilterChange('location', '')}
                      size="small"
                    />
                  )}
                  {filters.organizerName && (
                    <Chip
                        label={`Tổ chức: ${filters.organizerName}`}
                        onDelete={() => handleFilterChange('organizerName', '')}
                      size="small"
                    />
                  )}
                  {filters.startDate && (
                    <Chip
                      label={`Từ: ${filters.startDate.toLocaleDateString('vi-VN')}`}
                      onDelete={() => handleFilterChange('startDate', null)}
                      size="small"
                    />
                  )}
                  {filters.endDate && (
                    <Chip
                      label={`Đến: ${filters.endDate.toLocaleDateString('vi-VN')}`}
                      onDelete={() => handleFilterChange('endDate', null)}
                      size="small"
                    />
                  )}
                  {filters.timeStatus && (
                    <Chip
                      label={`Trạng thái: ${filters.timeStatus === 'ended' ? 'Đã kết thúc' : filters.timeStatus === 'upcoming' ? 'Chưa diễn ra' : 'Đang diễn ra'}`}
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
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && events.length === 0 && (
          <Alert severity="info">
            {hasActiveFilters
              ? "Không tìm thấy sự kiện nào phù hợp với bộ lọc của bạn."
              : "Hiện tại chưa có sự kiện nào được phê duyệt."
            }
          </Alert>
        )}

        {events.map(event => (
          <EventCard key={event.id} event={event} />
        ))}
      </Container>
    </LocalizationProvider>
  );
}
