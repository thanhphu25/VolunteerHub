/**
 * PopularEventsSlider Component
 * Displays a carousel of popular volunteer events with featured promotions.
 * Shows event image, title, date, location, and volunteer capacity.
 * Auto-rotates through events with manual navigation and click-to-view functionality.
 *
 * @component
 * @param {Object} props - Component props
 * @param {Array<Object>} props.events - Array of popular event objects
 * @returns {JSX.Element} Carousel slider showcasing popular volunteer events
 */
import React from 'react';
import Slider from "react-slick";
import { Box, Typography, Button, Container, Card, CardContent, Chip } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { AccessTime, LocationOn, Group } from '@mui/icons-material';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function PopularEventsSlider({ events }) {
    const navigate = useNavigate();

    const settings = {
        dots: true,
        infinite: true,
        speed: 800,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: true,
        arrows: false,
        appendDots: dots => (
            <Box sx={{ position: "absolute", bottom: "10px", width: "100%" }}>
                <ul style={{ margin: "0px", padding: "0px" }}> {dots} </ul>
            </Box>
        ),
    };

    if (!events || events.length === 0) return null;

    return (
        <Box sx={{ width: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <Slider {...settings}>
                {events.map((event) => (
                    <Box key={event.id} sx={{ outline: 'none', position: 'relative' }}>
                        { }
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: { xs: '16/9', md: '21/9' },
                                minHeight: '400px',
                                backgroundImage: `url(${event.imageUrl || 'https://source.unsplash.com/random?volunteer'})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                                position: 'relative',
                            }}
                        >
                            { }
                            <Box
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.2))',
                                }}
                            />

                            { }
                            <Container
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'flex-end',
                                    alignItems: 'flex-start',
                                    pb: 5,
                                    pt: 2,
                                    color: 'white',
                                    position: 'relative',
                                    zIndex: 1
                                }}
                            >
                                <Chip
                                    label="Nổi bật"
                                    color="error"
                                    size="small"
                                    sx={{ mb: 1, fontWeight: 'bold' }}
                                />
                                <Typography variant="h4" fontWeight="bold" gutterBottom sx={{ textShadow: '1px 1px 3px rgba(0,0,0,0.5)' }}>
                                    {event.name}
                                </Typography>

                                <Box display="flex" gap={2} mb={2} flexWrap="wrap">
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <AccessTime fontSize="small" sx={{ opacity: 0.8 }} />
                                        <Typography variant="body2">
                                            {format(new Date(event.startDate), "dd/MM/yyyy HH:mm", { locale: vi })}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <LocationOn fontSize="small" sx={{ opacity: 0.8 }} />
                                        <Typography variant="body2" sx={{ maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {event.location}
                                        </Typography>
                                    </Box>
                                    <Box display="flex" alignItems="center" gap={0.5}>
                                        <Group fontSize="small" sx={{ opacity: 0.8 }} />
                                        <Typography variant="body2">
                                            {event.currentVolunteers} / {event.maxVolunteers || '∞'}
                                        </Typography>
                                    </Box>
                                </Box>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    onClick={() => navigate(`/events/${event.id}`)}
                                    sx={{ borderRadius: 20, px: 3 }}
                                >
                                    Xem chi tiết
                                </Button>
                            </Container>
                        </Box>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
}
