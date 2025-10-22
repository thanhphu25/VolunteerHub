// src/components/EventCard.jsx
import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  Typography
} from "@mui/material";
import {Link as RouterLink} from "react-router-dom"; // 1. Import RouterLink

// ... (phần code statusColors, statusLabels, formatDate giữ nguyên) ...
const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
  completed: "info"
};

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Đã từ chối",
  cancelled: "Đã hủy",
  completed: "Hoàn thành"
};

const formatDate = (dateString) => {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  return date.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export default function EventCard({
  event,
  showStatus = false,
  showOrganizerName = false,
  showViewRegistrationsButton = false,
  onEdit,
  onDelete,
  onCancel,
  onApprove,
  onReject
}) {

  return (
      <Card sx={{
        mb: 2,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
      }}>
        {/* Thêm height: '100%' để đảm bảo CardActions ở cuối */}
        {event.imageUrl && (
            <CardMedia
                component="img"
                height="400"
                image={event.imageUrl}
                alt={event.name}
                sx={{objectFit: 'contain'}}
            />
        )}
        {/* Thêm flexGrow: 1 để nội dung chiếm không gian còn lại */}
        <CardContent sx={{flexGrow: 1}}>
          <Box display="flex" justifyContent="space-between"
               alignItems="flex-start" mb={1}>
            <Typography variant="h6" component="div" sx={{flex: 1}}>
              {event.name}
            </Typography>
            {showStatus && (
                <Chip
                    label={statusLabels[event.status] || event.status}
                    color={statusColors[event.status] || "default"}
                    size="small"
                />
            )}
          </Box>

          {showOrganizerName && event.organizerName && (
              <Typography variant="caption" color="text.secondary"
                          display="block" mb={1}>
                👤 Người tổ chức: {event.organizerName}
              </Typography>
          )}

          {/* Rút gọn mô tả nếu quá dài */}
          <Typography variant="body2" color="text.secondary" mb={1}
                      sx={{
                        display: '-webkit-box',
                        WebkitLineClamp: 3, // Giới hạn 3 dòng
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        minHeight: '3.6em' // Đảm bảo chiều cao tối thiểu cho 3 dòng
                      }}>
            {event.description}
          </Typography>

          <Typography variant="caption" display="block" sx={{mt: 1}}>
            🏷️ {event.category}
          </Typography>

          <Typography variant="caption" display="block">
            📍 {event.location}
          </Typography>

          <Typography variant="caption" display="block">
            📅 {formatDate(event.startDate)} - {formatDate(event.endDate)}
          </Typography>

          {event.maxVolunteers != null && ( // Kiểm tra cả null và undefined
              <Typography variant="caption" display="block">
                👥 {event.currentVolunteers ?? 0} / {event.maxVolunteers} tình
                nguyện viên
              </Typography>
          )}
        </CardContent>

        <CardActions>
          <Button
              size="small"
              variant="outlined"
              component={RouterLink} // Sử dụng RouterLink
              to={`/events/${event.id}`} // Link tới trang chi tiết
          >
            Xem chi tiết
          </Button>

          {/* Bỏ nút Tham gia ở đây vì đã có nút Đăng ký ở trang chi tiết */}
          {/* {!showStatus && (
          <Button size="small" variant="contained">
            Tham gia
          </Button>
        )} */}
          {showViewRegistrationsButton && (
              <Button
                  size="small"
                  variant="outlined"
                  color="secondary" // Màu khác để phân biệt
                  component={RouterLink}
                  to={`/organizer/events/${event.id}/registrations`} // Link tới trang quản lý đăng ký
              >
                Xem đăng ký
              </Button>
          )}
          {/* Giữ nguyên các nút hành động khác */}
          {onEdit && (
              <Button size="small" variant="outlined" color="primary"
                      onClick={() => onEdit(event)}>
                Sửa
              </Button>
          )}
          {/* ... (các nút khác giữ nguyên) ... */}
          {onCancel && event.status === 'approved' && (
              <Button size="small" variant="outlined" color="warning"
                      onClick={() => onCancel(event.id)}>
                Hủy sự kiện
              </Button>
          )}

          {onApprove && event.status === 'pending' && (
              <Button size="small" variant="contained" color="success"
                      onClick={() => onApprove(event.id)}>
                Duyệt
              </Button>
          )}

          {onReject && event.status === 'pending' && (
              <Button size="small" variant="outlined" color="error"
                      onClick={() => onReject(event.id)}>
                Từ chối
              </Button>
          )}

          {onDelete && (
              <Button size="small" variant="outlined" color="error"
                      onClick={() => onDelete(event.id)}>
                Xóa
              </Button>
          )}
        </CardActions>
      </Card>
  );
}