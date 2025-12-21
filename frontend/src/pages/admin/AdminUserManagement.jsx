/**
 * AdminUserManagement Page
 * Admin dashboard for managing user accounts across the platform.
 * Displays user information in a table with lock/unlock status controls.
 * Allows admins to export user data and manage user account statuses.
 *
 * @component
 * @returns {JSX.Element} Admin user management page with user table and controls
 */
import React, { useCallback, useEffect, useState } from 'react';
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
  Typography
} from '@mui/material';
import {
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Refresh as RefreshIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import adminApi from '../../api/adminApi';
import { toast } from 'react-toastify';
import { useLanguage } from '../../context/LanguageContext';

/**
 * Triggers browser download of a blob file
 * @param {Blob} blob - File blob to download
 * @param {string} filename - Name for the downloaded file
 */
const downloadFile = (blob, filename) => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

export default function AdminUserManagement() {
  const { language } = useLanguage();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [exporting, setExporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await adminApi.listUsers({ page: 0, size: 100 });
      setUsers(response.data.content || response.data || []);
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
      const errorMsg = language === "vi" ? "Không thể tải danh sách người dùng." : "Unable to load users.";
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [language]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleLock = async (userId, currentStatus) => {
    if (updatingId) {
      return;
    }
    setUpdatingId(userId);

    const isLocking = currentStatus !== 'locked';
    const action = isLocking ? adminApi.lockUser : adminApi.unlockUser;
    const successMessage = isLocking
      ? (language === "vi" ? "Đã khóa tài khoản!" : "Account locked!")
      : (language === "vi" ? "Đã mở khóa tài khoản!" : "Account unlocked!");
    const errorMessage = isLocking
      ? (language === "vi" ? "Khóa tài khoản thất bại." : "Failed to lock account.")
      : (language === "vi" ? "Mở khóa tài khoản thất bại." : "Failed to unlock account.");

    try {
      await action(userId);
      toast.success(successMessage);

      setUsers(prevUsers =>
        prevUsers.map(u =>
          u.id === userId ? { ...u, status: isLocking ? 'locked' : 'active' }
            : u
        )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái user:", err);
      toast.error(err.response?.data?.error || errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleExportUsers = async (format) => {
    if (exporting) {
      return;
    }
    setExporting(true);
    toast.info(language === "vi" ? `Đang chuẩn bị file ${format.toUpperCase()}...` : `Preparing ${format.toUpperCase()} file...`);

    try {
      const response = await adminApi.exportUsers(format);
      const filename = `users.${format}`;

      downloadFile(response.data, filename);
      toast.success(language === "vi" ? `Đã xuất danh sách người dùng (${format.toUpperCase()})!` : `Users exported successfully (${format.toUpperCase()})!`);
    } catch (err) {
      console.error("Lỗi khi xuất người dùng:", err);
      toast.error(language === "vi" ? "Xuất dữ liệu thất bại." : "Export failed.");
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)" }}>
        <Container>
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="50vh">
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "calc(100vh - 64px)", py: 4 }}>
      <Container maxWidth="lg">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
          <Typography variant="h3" fontWeight="bold" sx={{ color: "primary.main" }}>
            {language === "vi" ? "Quản lý Người dùng" : "User Management"}
          </Typography>
          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportUsers('csv')}
              disabled={exporting}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {exporting ? (language === "vi" ? 'Đang xuất...' : 'Exporting...') : (language === "vi" ? 'Xuất CSV' : 'Export CSV')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<FileDownloadIcon />}
              onClick={() => handleExportUsers('json')}
              disabled={exporting}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {exporting ? (language === "vi" ? 'Đang xuất...' : 'Exporting...') : (language === "vi" ? 'Xuất JSON' : 'Export JSON')}
            </Button>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchUsers}
              disabled={loading}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              {language === "vi" ? "Làm mới" : "Refresh"}
            </Button>
          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            {error}
          </Alert>
        )}

        {users.length === 0 ? (
          <Alert severity="info" sx={{ borderRadius: 2 }}>
            {language === "vi" ? "Không tìm thấy người dùng nào." : "No users found."}
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
                    <TableCell sx={{ fontWeight: 700 }}>ID</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>{language === "vi" ? "Họ Tên" : "Full Name"}</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{language === "vi" ? "Vai trò" : "Role"}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{language === "vi" ? "Trạng thái" : "Status"}</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>{language === "vi" ? "Hành động" : "Actions"}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user) => (
                    <TableRow hover key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.fullName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.role}
                          color={
                            user.role === 'admin' ? 'secondary' :
                              user.role === 'organizer' ? 'primary'
                                : 'default'
                          }
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={user.status === 'locked'
                            ? (language === "vi" ? 'Đã khóa' : 'Locked')
                            : (language === "vi" ? 'Hoạt động' : 'Active')}
                          color={user.status === 'locked' ? 'error' : 'success'}
                          size="small"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title={user.status === 'locked'
                          ? (language === "vi" ? 'Mở khóa tài khoản' : 'Unlock account')
                          : (language === "vi" ? 'Khóa tài khoản' : 'Lock account')}>
                          <span>
                            <IconButton
                              color={user.status === 'locked' ? 'success' : 'error'}
                              onClick={() => handleToggleLock(user.id, user.status)}
                              disabled={updatingId === user.id}
                              size="small"
                            >
                              {updatingId === user.id ? (
                                <CircularProgress size={20} />
                              ) : user.status === 'locked' ? (
                                <LockOpenIcon />
                              ) : (
                                <LockIcon />
                              )}
                            </IconButton>
                          </span>
                        </Tooltip>
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
