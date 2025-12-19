import React from "react";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Typography,
  LinearProgress,
  Stack,
  Avatar,
  useTheme
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import { 
  AccessTime as TimeIcon, 
  LocationOn as LocationIcon,
  Group as GroupIcon
} from "@mui/icons-material";

export default function EventCard({ event, showOrganizerName = false, sx = {} }) {
  const { t } = useLanguage();
  const theme = useTheme();

  const current = event.currentVolunteers || 0;
  const max = event.maxVolunteers || 100; 
  const progress = Math.min((current / max) * 100, 100);

  return (
    <Card
      elevation={0}
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: 'background.paper',
        overflow: 'hidden',
        transition: "all 0.3s ease",
        "&:hover": {
          boxShadow: theme.shadows[4],
          borderColor: "primary.main",
        },
        ...sx
      }}
    >
      {/* KHUNG ẢNH 16:9 */}
      <Box 
        sx={{ 
          width: '100%',
          paddingTop: '56.25%',
          position: 'relative',
          bgcolor: 'grey.100',
          overflow: 'hidden'
        }}
      >
        <Box
          component="img"
          src={event.imageUrl || "https://via.placeholder.com/400x225?text=No+Image"}
          alt={event.name}
          sx={{ 
            position: 'absolute',
            top: 0, left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover', // ✅ giữ ảnh lấp đầy khung, cao đều
            p: 0.5
          }}
        />
        <Chip 
          label={event.category} 
          size="small" 
          sx={{ 
            position: 'absolute', 
            top: 12, 
            left: 12, 
            bgcolor: 'rgba(255,255,255,0.9)', 
            fontWeight: 'bold' 
          }} 
        />
      </Box>

      <CardContent sx={{ flexGrow: 1, p: 2.5, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" fontWeight="bold" sx={{ 
          display: '-webkit-box', 
          WebkitLineClamp: 2, 
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden', 
          height: '2.6em', 
          lineHeight: 1.3, 
          mb: 1
        }}>
          {event.name}
        </Typography>

        {showOrganizerName && (
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <Avatar sx={{ width: 20, height: 20, fontSize: 10 }}>
              {event.organizerName?.charAt(0)}
            </Avatar>
            <Typography variant="caption" color="text.secondary" noWrap>
              {event.organizerName}
            </Typography>
          </Stack>
        )}

        <Stack spacing={1} mb={2} sx={{ mt: 'auto' }}>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <TimeIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2">
              {new Date(event.startDate).toLocaleDateString()}
            </Typography>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center" color="text.secondary">
            <LocationIcon sx={{ fontSize: 18 }} />
            <Typography variant="body2" noWrap>{event.location}</Typography>
          </Stack>
        </Stack>

        <Box>
          <Stack direction="row" justifyContent="space-between" mb={0.5}>
            <Typography variant="caption" fontWeight="bold" color="primary.main">
              {current}/{max} <GroupIcon sx={{ fontSize: 12 }} />
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {progress.toFixed(0)}%
            </Typography>
          </Stack>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 6, borderRadius: 3 }} />
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        <Button 
          component={RouterLink} 
          to={`/events/${event.id}`} 
          variant="contained" 
          fullWidth 
          sx={{ borderRadius: 2, textTransform: 'none' }}
        >
          {t("common.viewDetails")}
        </Button>
      </CardActions>
    </Card>
  );
}
