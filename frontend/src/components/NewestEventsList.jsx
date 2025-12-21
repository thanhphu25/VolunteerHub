/**
 * NewestEventsList Component
 * Displays a scrollable list of the most recently created or updated events.
 * Shows event image, name, organizer, and relative time since creation/update.
 * Navigates to event details page on click.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.events - Array of event objects to display
 * @returns {JSX.Element} Scrollable list of newest events with activity indicators
 */
import React from 'react';
import { Box, Typography, List, ListItem, ListItemButton, ListItemAvatar, ListItemText, Avatar, Chip, Paper } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { formatDistance, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';
import { FiberNew, Update } from '@mui/icons-material';

export default function NewestEventsList({ events }) {
    const navigate = useNavigate();

    if (!events || events.length === 0) {
        return <Typography variant="body2" color="text.secondary">Chưa có hoạt động mới.</Typography>;
    }

    return (
        <Paper elevation={0} sx={{ height: '400px', overflowY: 'auto', p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary.main">
                Hoạt động mới nhất
            </Typography>
            <List sx={{ p: 0 }}>
                {events.map((event) => {
                    const isCreated = event.lastActivityType === 'CREATED';
                    const activityTime = event.lastActivityAt ? parseISO(event.lastActivityAt) : parseISO(event.createdAt);
                    const timeAgo = formatDistance(activityTime, new Date(), { addSuffix: true, locale: vi });

                    return (
                        <ListItem
                            key={event.id}
                            disablePadding
                            sx={{ borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}
                        >
                            <ListItemButton
                                alignItems="flex-start"
                                onClick={() => navigate(`/events/${event.id}`)}
                                sx={{ py: 1.5, px: 0 }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        variant="rounded"
                                        src={event.imageUrl}
                                        sx={{ width: 60, height: 60, mr: 1 }}
                                    >
                                        E
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle2" sx={{ fontWeight: 'bold', lineHeight: 1.2, mb: 0.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {event.name}
                                        </Typography>
                                    }
                                    secondaryTypographyProps={{ component: 'div' }}
                                    secondary={
                                        <Box>
                                            <Typography variant="caption" display="block" color="text.secondary" noWrap>
                                                {event.organizerName}
                                            </Typography>
                                            <Box display="flex" alignItems="center" gap={0.5} mt={0.5}>
                                                {isCreated ? <FiberNew fontSize="inherit" color="success" /> : <Update fontSize="inherit" color="info" />}
                                                <Typography variant="caption" color={isCreated ? 'success.main' : 'info.main'} sx={{ fontWeight: 500 }}>
                                                    {isCreated ? 'Đã tạo' : 'Cập nhật'} {timeAgo}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    }
                                />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Paper>
    );
}
