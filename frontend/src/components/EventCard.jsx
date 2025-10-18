import React from "react";
import { 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  CardActions, 
  Chip, 
  Box,
  CardMedia 
} from "@mui/material";

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

export default function EventCard({ 
  event, 
  showStatus = false, 
  showOrganizerName = false,
  onEdit,
  onDelete,
  onCancel,
  onApprove,
  onReject 
}) {
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleString('vi-VN', { 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Card sx={{ mb: 2 }}>
      {event.imageUrl && (
        <CardMedia
          component="img"
          height="200"
          image={event.imageUrl}
          alt={event.name}
          sx={{ objectFit: 'cover' }}
        />
      )}
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
          <Typography variant="h6" component="div" sx={{ flex: 1 }}>
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
          <Typography variant="caption" color="text.secondary" display="block" mb={1}>
            👤 Người tổ chức: {event.organizerName}
          </Typography>
        )}

        <Typography variant="body2" color="text.secondary" mb={1}>
          {event.description}
        </Typography>

        <Typography variant="caption" display="block" sx={{ mt: 1 }}>
          🏷️ {event.category}
        </Typography>

        <Typography variant="caption" display="block">
          📍 {event.location}
        </Typography>

        <Typography variant="caption" display="block">
          📅 {formatDate(event.startDate)} - {formatDate(event.endDate)}
        </Typography>

        {event.maxVolunteers && (
          <Typography variant="caption" display="block">
            👥 {event.currentVolunteers || 0} / {event.maxVolunteers} tình nguyện viên
          </Typography>
        )}
      </CardContent>

      <CardActions>
        {!showStatus && (
          <Button size="small" variant="contained">
            Tham gia
          </Button>
        )}

        {onEdit && (
          <Button size="small" variant="outlined" color="primary" onClick={() => onEdit(event)}>
            Sửa
          </Button>
        )}

        {onCancel && event.status === 'approved' && (
          <Button size="small" variant="outlined" color="warning" onClick={() => onCancel(event.id)}>
            Hủy sự kiện
          </Button>
        )}

        {onApprove && event.status === 'pending' && (
          <Button size="small" variant="contained" color="success" onClick={() => onApprove(event.id)}>
            Duyệt
          </Button>
        )}

        {onReject && event.status === 'pending' && (
          <Button size="small" variant="outlined" color="error" onClick={() => onReject(event.id)}>
            Từ chối
          </Button>
        )}

        {onDelete && (
          <Button size="small" variant="outlined" color="error" onClick={() => onDelete(event.id)}>
            Xóa
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
