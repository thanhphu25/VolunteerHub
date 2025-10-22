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
import eventApi from "../../api/eventApi"; // Import để lấy tên sự kiện
import {toast} from "react-toastify";

// Nhãn và màu cho trạng thái đăng ký
const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
  completed: "Hoàn thành",
};
const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
  completed: "info",
};

export default function EventRegistrations() {
  const {eventId} = useParams();
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [eventName, setEventName] = useState(""); // Lưu tên sự kiện
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // ID của đăng ký đang được cập nhật

  // Hàm fetch dữ liệu đăng ký
  const fetchRegistrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Lấy tên sự kiện
      try {
        const eventRes = await eventApi.getById(eventId);
        setEventName(eventRes.data?.name || `Sự kiện #${eventId}`);
      } catch (eventErr) {
        console.warn("Không thể lấy tên sự kiện:", eventErr);
        setEventName(`Sự kiện #${eventId}`);
      }
      // Lấy danh sách đăng ký
      const response = await registrationApi.getRegistrationsForEvent(eventId);
      setRegistrations(response.data || []);
    } catch (err) {
      console.error("Lỗi khi tải danh sách đăng ký:", err);
      setError("Không thể tải danh sách đăng ký. Vui lòng thử lại.");
      toast.error("Không thể tải danh sách đăng ký.");
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  // Hàm xử lý duyệt đăng ký
  const handleApprove = async (registrationId) => {
    if (updatingId) {
      return;
    } // Ngăn chặn click nhiều lần
    setUpdatingId(registrationId);
    try {
      await registrationApi.approve(eventId, registrationId);
      toast.success("Đã duyệt đăng ký!");
      // Cập nhật lại danh sách hoặc chỉ cập nhật trạng thái của item này
      setRegistrations((prev) =>
          prev.map((reg) =>
              reg.id === registrationId ? {...reg, status: "approved"} : reg
          )
      );
    } catch (err) {
      console.error("Lỗi khi duyệt đăng ký:", err);
      toast.error(err.response?.data?.error || "Duyệt đăng ký thất bại.");
    } finally {
      setUpdatingId(null);
    }
  };

  // Hàm xử lý từ chối đăng ký
  const handleReject = async (registrationId) => {
    if (updatingId) {
      return;
    }
    setUpdatingId(registrationId);
    try {
      await registrationApi.reject(eventId, registrationId);
      toast.info("Đã từ chối đăng ký.");
      setRegistrations((prev) =>
          prev.map((reg) =>
              reg.id === registrationId ? {...reg, status: "rejected"} : reg
          )
      );
    } catch (err) {
      console.error("Lỗi khi từ chối đăng ký:", err);
      toast.error(err.response?.data?.error || "Từ chối đăng ký thất bại.");
    } finally {
      setUpdatingId(null);
    }
  };

  // ----- Render UI -----

  if (loading) {
    return (
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center"
               minHeight="50vh">
            <CircularProgress/>
          </Box>
        </Container>
    );
  }

  if (error) {
    return (
        <Container sx={{py: 4}}>
          <Alert severity="error">{error}</Alert>
          <Button
              startIcon={<BackIcon/>}
              onClick={() => navigate(-1)} // Quay lại trang trước đó
              sx={{mt: 2}}
          >
            Quay lại
          </Button>
        </Container>
    );
  }

  return (
      <Container maxWidth="lg" sx={{py: 4}}>
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton onClick={() => navigate(-1)}
                      sx={{mr: 1}}> {/* Nút quay lại */}
            <BackIcon/>
          </IconButton>
          <Typography variant="h5" component="h1">
            Đơn đăng ký cho sự kiện: <strong>{eventName}</strong>
          </Typography>
        </Box>


        {registrations.length === 0 ? (
            <Alert severity="info">Chưa có ai đăng ký tham gia sự kiện
              này.</Alert>
        ) : (
            <Paper elevation={3} sx={{overflow: 'hidden'}}>
              <TableContainer>
                <Table stickyHeader aria-label="danh sách đăng ký">
                  <TableHead>
                    <TableRow>
                      <TableCell>Tình nguyện viên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Ghi chú</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Hành động</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {registrations.map((reg) => (
                        <TableRow hover key={reg.id}>
                          <TableCell>{reg.volunteerName || "N/A"}</TableCell>
                          <TableCell>{/* Cần thêm email vào RegistrationResponse backend */}</TableCell>
                          <TableCell sx={{
                            maxWidth: 200,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            <Tooltip title={reg.note || ''}>
                              <span>{reg.note || "-"}</span>
                            </Tooltip>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                                label={statusLabels[reg.status] || reg.status}
                                color={statusColors[reg.status] || "default"}
                                size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {reg.status === "pending" ? (
                                <Box>
                                  <Tooltip title="Duyệt">
                            <span> {/* Span để Tooltip hoạt động khi Button disabled */}
                              <IconButton
                                  color="success"
                                  onClick={() => handleApprove(reg.id)}
                                  disabled={updatingId
                                      === reg.id} // Disable khi đang xử lý
                                  size="small"
                              >
                                <ApproveIcon/>
                              </IconButton>
                            </span>
                                  </Tooltip>
                                  <Tooltip title="Từ chối">
                            <span>
                              <IconButton
                                  color="error"
                                  onClick={() => handleReject(reg.id)}
                                  disabled={updatingId === reg.id}
                                  size="small"
                                  sx={{ml: 1}}
                              >
                                <RejectIcon/>
                              </IconButton>
                            </span>
                                  </Tooltip>
                                  {/* Hiển thị loading nhỏ nếu đang cập nhật item này */}
                                  {updatingId === reg.id && <CircularProgress
                                      size={16}
                                      sx={{ml: 1, verticalAlign: 'middle'}}/>}
                                </Box>
                            ) : (
                                "-" // Không có hành động nếu không phải pending
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
  );
}