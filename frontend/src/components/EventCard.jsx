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
import {Link as RouterLink} from "react-router-dom";
import {useLanguage} from "../context/LanguageContext";

const statusColors = {
  pending: "warning",
  approved: "success",
  rejected: "error",
  cancelled: "default",
  completed: "info"
};

const statusLabels = {
  pending: {vi: "Chờ duyệt", en: "Pending"},
  approved: {vi: "Đã duyệt", en: "Approved"},
  rejected: {vi: "Đã từ chối", en: "Rejected"},
  cancelled: {vi: "Đã hủy", en: "Cancelled"},
  completed: {vi: "Hoàn thành", en: "Completed"}
};

const formatDate = (dateString, language = "vi") => {
  if (!dateString) {
    return "";
  }
  const date = new Date(dateString);
  return date.toLocaleString(language === "vi" ? 'vi-VN' : 'en-US', {
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
  const {t, language} = useLanguage();

  return (
      <Card
          elevation={0}
          sx={{
            width: '100%',
            maxWidth: '100%',
            mb: 0,
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
            minHeight: 0,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "divider",
            transition: "all 0.3s ease",
            "&:hover": {
              boxShadow: "0 8px 24px rgba(2, 136, 209, 0.15)",
              transform: "translateY(-4px)",
              borderColor: "primary.main",
            },
          }}
      >
        <Box
            sx={{
              width: '100%',
              height: 480,
              minHeight: 480,
              overflow: 'hidden',
              borderTopLeftRadius: 12,
              borderTopRightRadius: 12,
              position: 'relative',
              bgcolor: 'grey.200',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
        >
          {event.imageUrl ? (
              <Box
                  component="img"
                  src={event.imageUrl}
                  alt={event.name}
                  sx={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fill',
                    objectPosition: 'center',
                    display: 'block',
                  }}
              />
          ) : (
              <Box
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'text.secondary',
                  }}
              >
                {/* Placeholder khi không có ảnh */}
              </Box>
          )}
        </Box>
        <CardContent sx={{flexGrow: 1, p: 3, display: 'flex', flexDirection: 'column', minHeight: 0, width: '100%', maxWidth: '100%', overflow: 'hidden'}}>
          <Box display="flex" justifyContent="space-between"
               alignItems="flex-start" mb={1.5}>
            <Typography
                variant="h6"
                component="div"
                sx={{
                  flex: 1,
                  fontWeight: 700,
                  fontSize: "1.25rem",
                  lineHeight: 1.3,
                  color: "text.primary",
                }}
            >
              {event.name}
            </Typography>
            {showStatus && (
                <Chip
                    label={statusLabels[event.status]?.[language] || event.status}
                    color={statusColors[event.status] || "default"}
                    size="small"
                    sx={{
                      fontWeight: 600,
                      ml: 1,
                    }}
                />
            )}
          </Box>

          {showOrganizerName && event.organizerName && (
              <Typography
                  variant="caption"
                  color="text.secondary"
                  display="block"
                  mb={1.5}
                  sx={{
                    fontWeight: 500,
                  }}
              >
                👤 {language === "vi" ? "Người tổ chức" : "Organizer"}: {event.organizerName}
              </Typography>
          )}

          <Typography
              variant="body2"
              color="text.secondary"
              mb={2}
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 3,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                minHeight: '3.6em',
                lineHeight: 1.6,
              }}
          >
            {event.description}
          </Typography>

          <Box sx={{display: "flex", flexDirection: "column", gap: 0.75, flexGrow: 1}}>
            <Typography variant="caption" display="block" sx={{fontWeight: 500}}>
              🏷️ {event.category}
            </Typography>

            <Typography variant="caption" display="block" sx={{fontWeight: 500}}>
              📍 {event.location}
            </Typography>

            <Typography variant="caption" display="block" sx={{fontWeight: 500}}>
              📅 {formatDate(event.startDate, language)} - {formatDate(event.endDate, language)}
            </Typography>

            <Typography variant="caption" display="block" sx={{fontWeight: 500}}>
              👥 {event.currentVolunteers ?? 0}
              {event.maxVolunteers != null
                  ? ` / ${event.maxVolunteers} ${language === "vi" ? "tình nguyện viên" : "volunteers"}`
                  : ` ${language === "vi" ? "tình nguyện viên đã đăng ký" : "volunteers registered"}`}
            </Typography>
          </Box>
        </CardContent>

        <CardActions sx={{p: 2, pt: 0, gap: 1, flexWrap: "wrap", mt: 'auto', width: '100%', maxWidth: '100%'}}>
          <Button
              size="medium"
              variant="contained"
              component={RouterLink}
              to={`/events/${event.id}`}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 3,
                boxShadow: "0 2px 8px rgba(2, 136, 209, 0.2)",
                "&:hover": {
                  boxShadow: "0 4px 12px rgba(2, 136, 209, 0.3)",
                },
              }}
          >
            {t("common.viewDetails")}
          </Button>

          {showViewRegistrationsButton && (
              <Button
                  size="medium"
                  variant="outlined"
                  color="secondary"
                  component={RouterLink}
                  to={`/organizer/events/${event.id}/registrations`}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {language === "vi" ? "Xem đăng ký" : "View Registrations"}
              </Button>
          )}

          {onEdit && (
              <Button
                  size="medium"
                  variant="outlined"
                  color="primary"
                  onClick={() => onEdit(event)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {t("common.edit")}
              </Button>
          )}

          {onCancel && event.status === 'approved' && (
              <Button
                  size="medium"
                  variant="outlined"
                  color="warning"
                  onClick={() => onCancel(event.id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {language === "vi" ? "Hủy sự kiện" : "Cancel Event"}
              </Button>
          )}

          {onApprove && event.status === 'pending' && (
              <Button
                  size="medium"
                  variant="contained"
                  color="success"
                  onClick={() => onApprove(event.id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {language === "vi" ? "Duyệt" : "Approve"}
              </Button>
          )}

          {onReject && event.status === 'pending' && (
              <Button
                  size="medium"
                  variant="outlined"
                  color="error"
                  onClick={() => onReject(event.id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {language === "vi" ? "Từ chối" : "Reject"}
              </Button>
          )}

          {onDelete && (
              <Button
                  size="medium"
                  variant="outlined"
                  color="error"
                  onClick={() => onDelete(event.id)}
                  sx={{
                    borderRadius: 2,
                    textTransform: "none",
                    fontWeight: 600,
                    px: 3,
                  }}
              >
                {t("common.delete")}
              </Button>
          )}
        </CardActions>
      </Card>
  );
}
