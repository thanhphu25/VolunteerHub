// src/pages/admin/EventRegistrations.jsx
import React, {useCallback, useEffect, useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from "@mui/material";
import {
  ArrowBack as BackIcon,
  Cancel as RejectIcon,
  CheckCircle as ApproveIcon,
} from "@mui/icons-material";
import registrationApi from "../../api/registrationApi";
import eventApi from "../../api/eventApi";
import {toast} from "react-toastify";
import {useLanguage} from "../../context/LanguageContext";

export default function EventRegistrations() {
  const {eventId} = useParams();
  const navigate = useNavigate();
  const {language} = useLanguage();
  const [registrations, setRegistrations] = useState([]);
  const [eventName, setEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const statusLabels = {
    pending: {vi: "Chờ duyệt", en: "Pending"},
    approved: {vi: "Đã duyệt", en: "Approved"},
    rejected: {vi: "Đã từ chối", en: "Rejected"},
    cancelled: {vi: "Đã hủy", en: "Cancelled"},
    completed: {vi: "Hoàn thành", en: "Completed"},
  };

  const statusColors = {
    pending: "warning",
    approved: "success",
    rejected: "error",
    cancelled: "default",
    completed: "info",
  };

  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      try {
        const eventRes = await eventApi.getById(eventId);
        setEventName(eventRes.data?.name || (language === "vi" ? `Sự kiện #${eventId}` : `Event #${eventId}`));
      } catch (eventErr) {
        console.warn("Không thể lấy tên sự kiện:", eventErr);
        setEventName(language === "vi" ? `Sự kiện #${eventId}` : `Event #${eventId}`);
      }
      const response = await registrationApi.getRegistrationsForEvent(eventId);
      setRegistrations(response.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đăng ký:", err);
      const errorMsg = language === "vi" ? "Không thể tải danh sách đăng ký. Vui lòng thử lại." : "Unable to load registrations. Please try again.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [eventId, language]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const handleApprove = async (registrationId) => {
    if (updatingId) {
      return;
    }
    setUpdatingId(registrationId);
    try {
      await registrationApi.approve(eventId, registrationId);
      toast.success(language === "vi" ? "Đã duyệt đăng ký!" : "Registration approved!");
      setRegistrations((prev) =>
          prev.map((reg) =>
              reg.id === registrationId ? {...reg, status: "approved"} : reg
          )
      );
    } catch (err) {
      console.error("Lỗi khi duyệt đăng ký:", err);
      toast.error(err.response?.data?.error || (language === "vi" ? "Duyệt đăng ký thất bại." : "Failed to approve registration."));
    } finally {
      setUpdatingId(null);
    }
  };

  const handleReject = async (registrationId) => {
    if (updatingId) {
      return;
    }
    setUpdatingId(registrationId);
    try {
      await registrationApi.reject(eventId, registrationId);
      toast.info(language === "vi" ? "Đã từ chối đăng ký." : "Registration rejected.");
      setRegistrations((prev) =>
          prev.map((reg) =>
              reg.id === registrationId ? {...reg, status: "rejected"} : reg
          )
      );
    } catch (err) {
      console.error("Lỗi khi từ chối đăng ký:", err);
      toast.error(err.response?.data?.error || (language === "vi" ? "Từ chối đăng ký thất bại." : "Failed to reject registration."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) {
    return (
        <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)"}}>
          <Container>
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
              <CircularProgress/>
            </Box>
          </Container>
        </Box>
    );
  }

  if (error) {
    return (
        <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4}}>
          <Container>
            <Alert severity="error" sx={{mb: 3, borderRadius: 2}}>{error}</Alert>
            <Button
                variant="outlined"
                startIcon={<BackIcon/>}
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                }}
            >
              {language === "vi" ? "Quay lại" : "Go Back"}
            </Button>
          </Container>
        </Box>
    );
  }

  return (
      <Box sx={{bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4}}>
        <Container maxWidth="lg">
          <Box display="flex" alignItems="center" mb={4}>
            <IconButton
                onClick={() => navigate(-1)}
                sx={{
                  mr: 2,
                  borderRadius: 2,
                }}
            >
              <BackIcon/>
            </IconButton>
            <Typography variant="h3" fontWeight="bold" sx={{color: "primary.main"}}>
              {language === "vi" ? "Đơn đăng ký cho sự kiện:" : "Registrations for Event:"} <strong>{eventName}</strong>
            </Typography>
          </Box>

          {registrations.length === 0 ? (
              <Alert severity="info" sx={{borderRadius: 2}}>
                {language === "vi" ? "Chưa có ai đăng ký tham gia sự kiện này." : "No registrations for this event yet."}
              </Alert>
          ) : (
              <Paper
                  elevation={0}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: "divider",
                    boxShadow: "0 4px 16px rgba(0,0,0,0.05)",
                    overflow: 'hidden'
                  }}
              >
                <TableContainer>
                  <Table stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{fontWeight: 700}}>{language === "vi" ? "Tình nguyện viên" : "Volunteer"}</TableCell>
                        <TableCell sx={{fontWeight: 700}}>Email</TableCell>
                        <TableCell sx={{fontWeight: 700}}>{language === "vi" ? "Ghi chú" : "Note"}</TableCell>
                        <TableCell align="center" sx={{fontWeight: 700}}>{language === "vi" ? "Trạng thái" : "Status"}</TableCell>
                        <TableCell align="center" sx={{fontWeight: 700}}>{language === "vi" ? "Hành động" : "Actions"}</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {registrations.map((reg) => (
                          <TableRow hover key={reg.id}>
                            <TableCell>{reg.volunteerName || "N/A"}</TableCell>
                            <TableCell>{reg.email || "-"}</TableCell>
                            <TableCell
                                sx={{
                                  maxWidth: 200,
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap'
                                }}
                            >
                              <Tooltip title={reg.note || ''}>
                                <span>{reg.note || "-"}</span>
                              </Tooltip>
                            </TableCell>
                            <TableCell align="center">
                              <Chip
                                  label={statusLabels[reg.status]?.[language] || reg.status}
                                  color={statusColors[reg.status] || "default"}
                                  size="small"
                                  sx={{fontWeight: 600}}
                              />
                            </TableCell>
                            <TableCell align="center">
                              {reg.status === "pending" ? (
                                  <Box display="flex" alignItems="center" justifyContent="center" gap={1}>
                                    <Tooltip title={language === "vi" ? "Duyệt" : "Approve"}>
                                      <span>
                                        <IconButton
                                            color="success"
                                            onClick={() => handleApprove(reg.id)}
                                            disabled={updatingId === reg.id}
                                            size="small"
                                        >
                                          {updatingId === reg.id ? (
                                              <CircularProgress size={20}/>
                                          ) : (
                                              <ApproveIcon/>
                                          )}
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                    <Tooltip title={language === "vi" ? "Từ chối" : "Reject"}>
                                      <span>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleReject(reg.id)}
                                            disabled={updatingId === reg.id}
                                            size="small"
                                        >
                                          <RejectIcon/>
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Box>
                              ) : (
                                  "-"
                              )}
                            </TableCell>
                          </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Paper>
          )}
        </Container>
      </Box>
  );
}
