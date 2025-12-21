/**
 * EventFilter Component
 * Provides comprehensive filtering and search capabilities for event listings.
 * Allows users to filter by search text, category, location, date range, and sort options.
 * Includes admin-specific status filtering for event management.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Object} props.filters - Current filter state containing search, category, location, dates
 * @param {Function} props.onChange - Callback function triggered when any filter changes
 * @param {boolean} [props.showStatus=false] - Whether to display event status filter (admin only)
 * @param {boolean} [props.isAdmin=false] - Whether user is admin to show additional filters
 * @returns {JSX.Element} Filter UI with search bar, filter button, and optional date range picker
 */
import React, { useState } from "react";
import {
    Box,
    TextField,
    MenuItem,
    InputAdornment,
    Grid,
    Button,
    Popover,
    Stack,
    Typography
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import SortIcon from "@mui/icons-material/Sort";
import DateRangeIcon from "@mui/icons-material/DateRange";
import { useLanguage } from "../context/LanguageContext";
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { vi, enUS } from 'date-fns/locale';

export default function EventFilter({
    filters,
    onChange,
    showStatus = false,
    isAdmin = false
}) {
    const { t, language } = useLanguage();
    const [anchorEl, setAnchorEl] = useState(null);

    const handleOpenFilter = (event) => setAnchorEl(event.currentTarget);
    const handleCloseFilter = () => setAnchorEl(null);

    const open = Boolean(anchorEl);
    const id = open ? 'simple-popover' : undefined;

    const handleChange = (field, value) => {
        onChange(field, value);
    };

    const categories = [
        { value: 'all', label: language === 'vi' ? 'Tất cả danh mục' : 'All categories' },
        { value: 'Giáo dục', label: language === 'vi' ? 'Giáo dục' : 'Education' },
        { value: 'Môi trường', label: language === 'vi' ? 'Môi trường' : 'Environment' },
        { value: 'Y tế', label: language === 'vi' ? 'Y tế' : 'Health' },
        { value: 'Cộng đồng', label: language === 'vi' ? 'Cộng đồng' : 'Community' },
        { value: 'Khẩn cấp', label: language === 'vi' ? 'Khẩn cấp' : 'Emergency' },
        { value: 'Khác', label: language === 'vi' ? 'Khác' : 'Other' }
    ];

    const locations = [
        { value: 'all', label: language === 'vi' ? 'Tất cả địa điểm' : 'All locations' },
        { value: 'Hà Nội', label: language === 'vi' ? 'Hà Nội' : 'Hanoi' },
        { value: 'Hồ Chí Minh', label: language === 'vi' ? 'Hồ Chí Minh' : 'Ho Chi Minh' },
        { value: 'Đà Nẵng', label: language === 'vi' ? 'Đà Nẵng' : 'Da Nang' },
        { value: 'Khác', label: language === 'vi' ? 'Khác' : 'Other' }
    ];

    const statusOptions = [
        { value: 'all', label: language === 'vi' ? 'Tất cả trạng thái' : 'All status' },
        { value: 'pending', label: language === 'vi' ? 'Chờ duyệt' : 'Pending' },
        { value: 'approved', label: language === 'vi' ? 'Đã duyệt' : 'Approved' },
        { value: 'rejected', label: language === 'vi' ? 'Đã từ chối' : 'Rejected' },
        { value: 'cancelled', label: language === 'vi' ? 'Đã hủy' : 'Cancelled' },
        { value: 'completed', label: language === 'vi' ? 'Hoàn thành' : 'Completed' }
    ];

    const sortOptions = [
        { value: 'createdAt,desc', label: language === 'vi' ? 'Mới nhất' : 'Newest' },
        { value: 'createdAt,asc', label: language === 'vi' ? 'Cũ nhất' : 'Oldest' },
        { value: 'popularity', label: language === 'vi' ? 'Phổ biến nhất' : 'Most Popular' },
    ];

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={language === 'vi' ? vi : enUS}>
            <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>

                { }
                <Box display="flex" gap={2} flexWrap="wrap">
                    <TextField
                        placeholder={t('events.searchPlaceholder') || (language === 'vi' ? "Tìm kiếm sự kiện..." : "Search events...")}
                        value={filters.search || ''}
                        onChange={(e) => handleChange('search', e.target.value)}
                        sx={{ flexGrow: 1, minWidth: '200px' }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon color="action" />
                                </InputAdornment>
                            ),
                        }}
                        size="small"
                    />

                    { }
                    <Button
                        variant="outlined"
                        startIcon={<FilterListIcon />}
                        onClick={handleOpenFilter}
                        color={anchorEl ? "primary" : "inherit"}
                        sx={{ borderColor: 'divider' }}
                    >
                        {language === 'vi' ? 'Bộ lọc' : 'Filters'}
                    </Button>

                    { }
                    <TextField
                        select
                        value={filters.sort || 'createdAt,desc'}
                        onChange={(e) => handleChange('sort', e.target.value)}
                        size="small"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SortIcon fontSize="small" />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ minWidth: 160 }}
                    >
                        {sortOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                </Box>

                { }
                <Popover
                    id={id}
                    open={open}
                    anchorEl={anchorEl}
                    onClose={handleCloseFilter}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                    }}
                    PaperProps={{
                        sx: { p: 3, maxWidth: 600, width: '100%', mt: 1, borderRadius: 3, boxShadow: 4 }
                    }}
                >
                    <Typography variant="subtitle1" fontWeight="bold" mb={2}>
                        {language === 'vi' ? 'Tùy chọn lọc' : 'Filter Options'}
                    </Typography>

                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label={language === 'vi' ? "Danh mục" : "Category"}
                                value={filters.category || 'all'}
                                onChange={(e) => handleChange('category', e.target.value)}
                                size="small"
                            >
                                {categories.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                select
                                fullWidth
                                label={language === 'vi' ? "Địa điểm" : "Location"}
                                value={filters.location || 'all'}
                                onChange={(e) => handleChange('location', e.target.value)}
                                size="small"
                            >
                                {locations.map((option) => (
                                    <MenuItem key={option.value} value={option.value}>
                                        {option.label}
                                    </MenuItem>
                                ))}
                            </TextField>
                        </Grid>

                        {showStatus && (
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    select
                                    fullWidth
                                    label={language === 'vi' ? "Trạng thái" : "Status"}
                                    value={filters.status || 'all'}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    size="small"
                                >
                                    {statusOptions.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </Grid>
                        )}

                        <Grid item xs={12} sm={showStatus ? 6 : 12}>
                            <Stack direction="row" spacing={2}>
                                <DatePicker
                                    label={language === 'vi' ? "Từ ngày" : "Start Date"}
                                    value={filters.startDate ? new Date(filters.startDate) : null}
                                    onChange={(newValue) => handleChange('startDate', newValue ? newValue.toISOString() : null)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                                <DatePicker
                                    label={language === 'vi' ? "Đến ngày" : "End Date"}
                                    value={filters.endDate ? new Date(filters.endDate) : null}
                                    onChange={(newValue) => handleChange('endDate', newValue ? newValue.toISOString() : null)}
                                    slotProps={{ textField: { size: 'small', fullWidth: true } }}
                                />
                            </Stack>
                        </Grid>

                        <Grid item xs={12}>
                            <Box display="flex" justifyContent="flex-end" gap={1} mt={1}>
                                <Button onClick={() => {
                                    onChange('category', 'all');
                                    onChange('location', 'all');
                                    if (showStatus) onChange('status', 'all');
                                    onChange('startDate', null);
                                    onChange('endDate', null);
                                }}>
                                    {language === 'vi' ? 'Xóa lọc' : 'Clear'}
                                </Button>
                                <Button variant="contained" onClick={handleCloseFilter}>
                                    {language === 'vi' ? 'Áp dụng' : 'Apply'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Popover>
            </Box>
        </LocalizationProvider>
    );
}
