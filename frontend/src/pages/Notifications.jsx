import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Container,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemSecondaryAction,
  ListItemText,
  Stack,
  Typography
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircleIcon from "@mui/icons-material/Circle";
import { Link as RouterLink } from "react-router-dom";
import notificationApi from "../api/notificationApi";

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await notificationApi.list();
      const data = Array.isArray(response.data) ? response.data : (response.data?.items ?? []);
      setNotifications((data ?? []).sort(sortByNewest));
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Không thể tải thông báo. Vui lòng thử lại sau.");
    } finally {
      setLoading(false);
    }
  };

  const sortByNewest = (a, b) => {
    const da = new Date(a?.createdAt ?? 0).getTime();
    const db = new Date(b?.createdAt ?? 0).getTime();
    return db - da;
  };

  const groupedNotifications = useMemo(() => {
    const map = new Map();
    notifications.forEach((notification) => {
      const key = notification.category ?? "Khác";
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key).push(notification);
    });
    return Array.from(map.entries());
  }, [notifications]);

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markRead(id);
      setNotifications(prev => prev.map(item => item.id === id ? { ...item, isRead: true } : item));
    } catch (err) {
      console.error("Failed to mark read", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);
      await notificationApi.markAllRead();
      setNotifications(prev => prev.map(item => ({ ...item, isRead: true })));
    } catch (err) {
      console.error("Failed to mark all read", err);
    } finally {
      setMarkingAll(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} justifyContent="space-between" alignItems={{ xs: "stretch", sm: "center" }} mb={3}>
        <Typography variant="h4" fontWeight={600}>
          Thông báo
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchNotifications}
          >
            Làm mới
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            disabled={markingAll}
          >
            {markingAll ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
          </Button>
        </Stack>
      </Stack>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      {notifications.length === 0 ? (
        <Card>
          <CardContent>
            <Typography color="text.secondary">Chưa có thông báo nào.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Stack spacing={3}>
          {groupedNotifications.map(([category, items]) => (
            <Card key={category} variant="outlined">
              <CardHeader
                title={category}
                subheader={`${items.length} thông báo`}
              />
              <CardContent sx={{ pt: 0 }}>
                <List>
                  {items.map((item, idx) => (
                    <React.Fragment key={item.id ?? idx}>
                      <ListItem
                        alignItems="flex-start"
                        sx={{
                          py: 2,
                          flexDirection: { xs: 'column', md: 'row' },
                          gap: { xs: 2, md: 0 }
                        }}
                      >
                        <Box sx={{ display: 'flex', flex: 1, width: '100%', mr: { md: 2 } }}>
                          <Box sx={{ mr: 2, mt: 0.5, flexShrink: 0 }}>
                            {item.isRead ? (
                              <CheckCircleIcon fontSize="small" color="success" />
                            ) : (
                              <CircleIcon fontSize="small" color="primary" />
                            )}
                          </Box>
                          <ListItemText
                            primary={item.title ?? "Thông báo"}
                            secondaryTypographyProps={{ component: 'div' }}
                            secondary={
                              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                <Typography component="div" variant="body2" color="text.primary">
                                  {item.message ?? item.body ?? ""}
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <Typography component="span" variant="caption" color="text.secondary">
                                    {formatDateTime(item.createdAt)}
                                  </Typography>
                                  {item.meta?.eventName && (
                                    <Chip label={item.meta.eventName} size="small" />
                                  )}
                                </Box>
                              </Box>
                            }
                          />
                        </Box>

                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          alignSelf: { xs: 'flex-start', md: 'center' },
                          ml: { xs: 4, md: 0 } // Indent on mobile to align with text roughly if desired, or 0
                        }}>
                          <Stack direction="row" spacing={1}>
                            {item.link && (
                              <Button
                                size="small"
                                component={RouterLink}
                                to={item.link}
                                onClick={() => handleMarkRead(item.id)}
                              >
                                Xem chi tiết
                              </Button>
                            )}
                            {!item.isRead && (
                              <Button size="small" onClick={() => handleMarkRead(item.id)}>
                                Đánh dấu đã đọc
                              </Button>
                            )}
                          </Stack>
                        </Box>
                      </ListItem>
                      {idx < items.length - 1 && <Divider component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </CardContent>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}
