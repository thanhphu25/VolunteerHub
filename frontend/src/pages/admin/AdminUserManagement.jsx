// src/pages/admin/AdminUserManagement.jsx
import React, {useCallback, useEffect, useState} from 'react';
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
  Refresh as RefreshIcon
} from '@mui/icons-material';
import adminApi from '../../api/adminApi'; // Import API bạn vừa tạo
import {toast} from 'react-toastify';

/**
 * Kích hoạt trình duyệt tải về file từ dữ liệu Blob
 * @param {Blob} blob - Dữ liệu file (Blob) nhận từ API
 * @param {string} filename - Tên file mong muốn (vd: users.csv)
 */
const downloadFile = (blob, filename) => {
  // Tạo một URL tạm thời cho dữ liệu Blob
  const url = window.URL.createObjectURL(blob);
  // Tạo một thẻ <a> ẩn
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = filename; // Đặt tên file tải về
  // Thêm thẻ <a> vào DOM, click nó, rồi xóa đi
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url); // Giải phóng URL tạm thời
  document.body.removeChild(a);
};

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null); // Lưu ID của user đang được cập nhật
  const [exporting, setExporting] = useState(false);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Gọi API lấy user, backend trả về dữ liệu có phân trang trong 'content'
      const response = await adminApi.listUsers({page: 0, size: 100}); // Lấy 100 user đầu tiên
      setUsers(response.data.content || response.data || []); // Hỗ trợ cả 2 kiểu trả về
    } catch (err) {
      console.error("Lỗi tải danh sách người dùng:", err);
      setError("Không thể tải danh sách người dùng.");
      toast.error("Không thể tải danh sách người dùng.");
    } finally {
      setLoading(false);
    }
  }, []); // useCallback dependency rỗng vì fetchUsers không phụ thuộc state/prop nào

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // useEffect sẽ gọi fetchUsers khi component mount

  // --- Hàm xử lý khóa/mở khóa ---
  const handleToggleLock = async (userId, currentStatus) => {
    if (updatingId) {
      return;
    } // Nếu đang xử lý user khác, không làm gì cả
    setUpdatingId(userId); // Đánh dấu user này đang được cập nhật

    const isLocking = currentStatus !== 'locked'; // Kiểm tra hành động là Khóa hay Mở khóa
    const action = isLocking ? adminApi.lockUser : adminApi.unlockUser; // Chọn API tương ứng
    const successMessage = isLocking ? "Đã khóa tài khoản!"
        : "Đã mở khóa tài khoản!";
    const errorMessage = isLocking ? "Khóa tài khoản thất bại."
        : "Mở khóa tài khoản thất bại.";

    try {
      await action(userId);
      toast.success(successMessage);

      // Cập nhật lại trạng thái của user đó ngay trên UI mà không cần gọi lại API
      setUsers(prevUsers =>
          prevUsers.map(u =>
              u.id === userId ? {...u, status: isLocking ? 'locked' : 'active'}
                  : u
          )
      );
    } catch (err) {
      console.error("Lỗi khi cập nhật trạng thái user:", err);
      toast.error(err.response?.data?.error || errorMessage);
    } finally {
      setUpdatingId(null); // Hoàn tất cập nhật, reset updatingId
    }
  };

  const handleExportUsers = async (format) => {
    if (exporting) {
      return;
    }
    setExporting(true); // Bắt đầu xuất
    toast.info(`Đang chuẩn bị file ${format.toUpperCase()}...`);

    try {
      // Gọi API export
      const response = await adminApi.exportUsers(format);
      const filename = `users.${format}`;

      // Dùng hàm helper để tải file
      downloadFile(response.data, filename);
      toast.success(`Đã xuất danh sách người dùng (${format.toUpperCase()})!`);
    } catch (err) {
      console.error("Lỗi khi xuất người dùng:", err);
      toast.error("Xuất dữ liệu thất bại.");
    } finally {
      setExporting(false); // Kết thúc xuất
    }
  };

  // Render UI
  if (loading) {
    return <Box display="flex" justifyContent="center" p={5}><CircularProgress/></Box>;
  }

  if (error) {
    return <Container sx={{py: 4}}><Alert
        severity="error">{error}</Alert></Container>;
  }

  return (
      <Container maxWidth="lg" sx={{py: 4}}>
        <Box display="flex" justifyContent="space-between" alignItems="center"
             mb={3}>
          <Typography variant="h4" component="h1">
            Quản lý Người dùng
          </Typography>
          <Box>
            <Button
                sx={{mr: 1}}
                variant="outlined"
                onClick={() => handleExportUsers('csv')}
                disabled={exporting}
            >
              {exporting ? 'Đang xuất...' : 'Xuất CSV'}
            </Button>
            <Button
                sx={{mr: 1}}
                variant="outlined"
                onClick={() => handleExportUsers('json')}
                disabled={exporting}
            >
              {exporting ? 'Đang xuất...' : 'Xuất JSON'}
            </Button>
            <Button
                variant="outlined"
                startIcon={<RefreshIcon/>}
                onClick={fetchUsers}
                disabled={loading}
            >
              Làm mới
            </Button>
          </Box>
        </Box>

        {users.length === 0 ? (
            <Alert severity="info">Không tìm thấy người dùng nào.</Alert>
        ) : (
            <Paper elevation={3} sx={{overflow: 'hidden'}}>
              <TableContainer>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>ID</TableCell>
                      <TableCell>Họ Tên</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell align="center">Vai trò</TableCell>
                      <TableCell align="center">Trạng thái</TableCell>
                      <TableCell align="center">Hành động</TableCell>
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
                                label={user.role} //
                                color={
                                  user.role === 'admin' ? 'secondary' :
                                      user.role === 'organizer' ? 'primary'
                                          : 'default'
                                }
                                size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                                label={user.status === 'locked' ? 'Đã khóa'
                                    : 'Hoạt động'} //
                                color={user.status === 'locked' ? 'error'
                                    : 'success'}
                                size="small"
                            />
                          </TableCell>
                          <TableCell align="center">
                            {/* Nút Khóa / Mở khóa */}
                            <Tooltip title={user.status === 'locked'
                                ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}>
                        <span> {/* Span để Tooltip hoạt động khi IconButton bị disabled */}
                          <IconButton
                              color={user.status === 'locked' ? 'success'
                                  : 'error'}
                              onClick={() => handleToggleLock(user.id,
                                  user.status)}
                              disabled={updatingId
                                  === user.id} // Disable nút khi đang cập nhật
                              size="small"
                          >
                            {updatingId === user.id ? (
                                <CircularProgress size={20}/> // Hiển thị loading nhỏ
                            ) : user.status === 'locked' ? (
                                <LockOpenIcon/> // Icon Mở khóa
                            ) : (
                                <LockIcon/> // Icon Khóa
                            )}
                          </IconButton>
                        </span>
                            </Tooltip>
                            {/* (Nút Thay đổi vai trò có thể thêm ở đây) */}
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              {/* TODO: Thêm phân trang (TablePagination) nếu danh sách quá dài */}
            </Paper>
        )}
      </Container>
  );
}