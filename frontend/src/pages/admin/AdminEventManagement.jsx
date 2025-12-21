/**
 * AdminEventManagement Page
 * Admin dashboard for managing all volunteer events across the platform.
 * Allows admins to approve/reject events, view event details, and export event data.
 * Includes filtering by status, category, location, and date range.
 *
 * @component
 * @returns {JSX.Element} Admin event management page with approval controls
 */
import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  Tab,
  Tabs,
  Paper,
} from "@mui/material";
import {
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import EventCard from "../../components/EventCard";
import eventApi from "../../api/eventApi";
import { toast } from "react-toastify";
import adminApi from "../../api/adminApi.js";
import { useLanguage } from "../../context/LanguageContext";
import EventFilter from "../../components/EventFilter";

/**
 * Triggers browser download of a blob file
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Name for the downloaded file
 */
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.style.display = "none";
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function AdminEventManagement() {
  const { language } = useLanguage();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    status: "pending",
    search: "",
    category: "all",
    location: "all",
    startDate: null,
    endDate: null,
    sort: "createdAt,desc",
  });
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [filters]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = { ...filters };
      if (params.status === "all") delete params.status;
      if (params.category === "all") delete params.category;
      if (params.location === "all") delete params.location;

      const response = await eventApi.getAll(params);

      const validEvents = (response.data.content || []).filter(
        (e) => e.status !== "cancelled"
      );

      setEvents(validEvents);
    } catch (err) {
      console.error("Error fetching events:", err);
      setError(
        language === "vi"
          ? "Không thể tải danh sách sự kiện. Vui lòng thử lại sau."
          : "Unable to load events. Please try again later."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleApproveEvent = async (eventId) => {
    if (
      !window.confirm(
        language === "vi"
          ? "Bạn có chắc chắn muốn duyệt sự kiện này?"
          : "Are you sure you want to approve this event?"
      )
    )
      return;
    try {
      await eventApi.approve(eventId);
      toast.success(
        language === "vi"
          ? "Duyệt sự kiện thành công!"
          : "Event approved successfully!"
      );
      fetchEvents();
    } catch (err) {
      console.error("Error approving event:", err);
      toast.error(
        err.response?.data?.error ||
        (language === "vi"
          ? "Không thể duyệt sự kiện."
          : "Unable to approve event.")
      );
    }
  };

  const handleRejectEvent = async (eventId) => {
    if (
      !window.confirm(
        language === "vi"
          ? "Bạn có chắc chắn muốn từ chối sự kiện này?"
          : "Are you sure you want to reject this event?"
      )
    )
      return;
    try {
      await eventApi.reject(eventId);
      toast.success(
        language === "vi"
          ? "Từ chối sự kiện thành công!"
          : "Event rejected successfully!"
      );
      fetchEvents();
    } catch (err) {
      console.error("Error rejecting event:", err);
      toast.error(
        err.response?.data?.error ||
        (language === "vi"
          ? "Không thể từ chối sự kiện."
          : "Unable to reject event.")
      );
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (
      !window.confirm(
        language === "vi"
          ? "Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác."
          : "Are you sure you want to delete this event? This action cannot be undone."
      )
    )
      return;
    try {
      await eventApi.delete(eventId);
      toast.success(
        language === "vi"
          ? "Xóa sự kiện thành công!"
          : "Event deleted successfully!"
      );
      fetchEvents();
    } catch (err) {
      console.error("Error deleting event:", err);
      toast.error(
        err.response?.data?.error ||
        (language === "vi"
          ? "Không thể xóa sự kiện."
          : "Unable to delete event.")
      );
    }
  };

  const handleTabChange = (event, newValue) => {
    setFilters((prev) => ({ ...prev, status: newValue }));
  };

  const handleExportEvents = async (format) => {
    if (exporting) return;

    setExporting(true);
    toast.info(
      language === "vi"
        ? `Đang chuẩn bị file ${format.toUpperCase()}...`
        : `Preparing ${format.toUpperCase()} file...`
    );

    try {
      const response = await adminApi.exportEvents(format);
      const filename = `events.${format}`;
      downloadFile(response.data, filename);
      toast.success(
        language === "vi"
          ? `Đã xuất danh sách sự kiện (${format.toUpperCase()})!`
          : `Events exported successfully (${format.toUpperCase()})!`
      );
    } catch (err) {
      console.error("Lỗi khi xuất sự kiện:", err);
      toast.error(
        language === "vi" ? "Xuất dữ liệu thất bại." : "Export failed."
      );
    } finally {
      setExporting(false);
    }
  };

  const statusTabs = [
    { value: "pending", label: language === "vi" ? "Chờ duyệt" : "Pending" },
    { value: "approved", label: language === "vi" ? "Đã duyệt" : "Approved" },
    { value: "rejected", label: language === "vi" ? "Đã từ chối" : "Rejected" },
    { value: "all", label: language === "vi" ? "Tất cả" : "All" },
  ];

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        minHeight: "calc(100vh - 64px)",
        py: 4,
      }}
    >
      <Container maxWidth="lg">
        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        <EventFilter
          filters={filters}
          onChange={handleFilterChange}
          showStatus={false}
        />

        <Paper
          elevation={0}
          sx={{
            mb: 4,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
            overflow: "hidden",
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            sx={{ pr: 2 }}
          >
            <Tabs
              value={filters.status}
              onChange={handleTabChange}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                flexGrow: 1,
                borderBottom: 0,
                px: 2,
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                },
              }}
            >
              {statusTabs.map((tab) => (
                <Tab
                  key={tab.value}
                  label={tab.label}
                  value={tab.value}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    minHeight: 60,
                  }}
                />
              ))}
            </Tabs>

            <Box display="flex" gap={1.5}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon fontSize="small" />}
                onClick={() => handleExportEvents("csv")}
                disabled={exporting}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FileDownloadIcon fontSize="small" />}
                onClick={() => handleExportEvents("json")}
                disabled={exporting}
              >
                JSON
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<RefreshIcon fontSize="small" />}
                onClick={fetchEvents}
              >
                {language === "vi" ? "Làm mới" : "Refresh"}
              </Button>
            </Box>
          </Box>
        </Paper>

        { }
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="50vh"
          >
            <CircularProgress />
          </Box>
        ) : events.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {language === "vi"
              ? "Không có sự kiện nào ở trạng thái này."
              : "No events in this status."}
          </Alert>
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
                showStatus={true}
                showOrganizerName={true}
                onApprove={
                  event.status === "pending" ? handleApproveEvent : null
                }
                onReject={
                  event.status === "pending" ? handleRejectEvent : null
                }
                onDelete={handleDeleteEvent}
                sx={{
                  height: "100%",
                  width: "100%",
                  maxWidth: 420,
                  justifySelf: "center",
                }}
              />
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}
