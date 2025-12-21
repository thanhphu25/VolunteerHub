/**
 * HeroSlider Component
 * Displays an auto-rotating carousel of hero slides on the home page.
 * Features images, titles, subtitles, and call-to-action buttons.
 * Responsive with mobile-optimized controls and animations.
 *
 * @component
 * @returns {JSX.Element} Full-width hero carousel with volunteer-themed slides
 */
import React from 'react';
import Slider from "react-slick";
import { Box, Typography, Button, Container, Stack, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';

import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

/**
 * Array of hero slide content with images, titles, and subtitles
 * @type {Array<Object>}
 */
const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=2000&q=80',
        title: 'Kết nối trái tim – Lan tỏa yêu thương',
        subtitle: 'Tham gia cộng đồng tình nguyện lớn nhất Việt Nam ngay hôm nay.'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=2000&q=80',
        title: 'Hành động nhỏ, Ý nghĩa lớn',
        subtitle: 'Chung tay bảo vệ môi trường và xây dựng không gian xanh sạch đẹp.'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=2000&q=80',
        title: 'Sẻ chia là hạnh phúc',
        subtitle: 'Hỗ trợ trẻ em nghèo và những hoàn cảnh khó khăn trên khắp cả nước.'
    },
    {
        id: 4,
        image: 'https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?auto=format&fit=crop&w=2000&q=80',
        title: 'Ấm áp tình già',
        subtitle: 'Mang niềm vui và sự an ủi đến những cụ già neo đơn.'
    },
    {
        id: 5,
        image: 'https://images.unsplash.com/photo-1593113630400-ea4288922497?auto=format&fit=crop&w=2000&q=80',
        title: 'Bữa cơm nhân ái',
        subtitle: 'Cùng nhau chia sẻ gánh nặng lương thực cho các gia đình khó khăn.'
    }
];

export default function HeroSlider() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const settings = {
        dots: true,
        infinite: true,
        speed: 1000,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        autoplaySpeed: 5000,
        pauseOnHover: false,
        pauseOnFocus: false,
        fade: true,
        arrows: !isMobile,
        appendDots: dots => (
            <Box sx={{ position: "absolute", bottom: "25px", width: "100%" }}>
                <ul style={{ margin: "0px", padding: "0px" }}> {dots} </ul>
            </Box>
        ),
    };

    return (
        <Box
            sx={{
                width: '100%',
                overflow: 'hidden',
                bgcolor: 'black',
                "& .slick-dots li button:before": {
                    fontSize: "12px",
                    color: "white",
                    opacity: 0.4,
                },
                "& .slick-dots li.slick-active button:before": {
                    color: "#00bfa5",
                    opacity: 1,
                    fontSize: "14px",
                }
            }}
        >
            <Slider {...settings}>
                {slides.map((slide) => (
                    <Box key={slide.id} sx={{ outline: 'none', position: 'relative' }}>

                        { }
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: { xs: '16/9', md: '21/9' },
                                minHeight: { xs: '350px', md: 'auto' },
                                backgroundImage: `url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center 15%',
                                position: 'relative',
                            }}
                        >
                            { }
                            <Box
                                sx={{
                                    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                    background: 'linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7))',
                                }}
                            />

                            { }
                            <Container
                                sx={{
                                    height: '100%',
                                    display: 'flex', flexDirection: 'column',
                                    justifyContent: 'center', alignItems: 'center',
                                    textAlign: 'center', position: 'relative', zIndex: 2, color: 'white'
                                }}
                            >
                                <Typography
                                    variant="h2"
                                    sx={{
                                        fontWeight: 800,
                                        fontSize: { xs: '1.8rem', md: '3.5rem' },
                                        mb: 1,
                                        textShadow: '2px 2px 10px rgba(0,0,0,0.5)'
                                    }}
                                >
                                    {slide.title}
                                </Typography>

                                <Typography
                                    variant="h5"
                                    sx={{
                                        mb: 4, opacity: 0.9, maxWidth: '850px',
                                        fontSize: { xs: '0.9rem', md: '1.3rem' },
                                        display: { xs: 'none', sm: 'block' }
                                    }}
                                >
                                    {slide.subtitle}
                                </Typography>

                                <Stack direction="row" spacing={2}>
                                    <Button
                                        variant="contained"
                                        size={isMobile ? "small" : "large"}
                                        onClick={() => navigate("/events")}
                                        sx={{
                                            bgcolor: '#00bfa5',
                                            '&:hover': { bgcolor: '#008e7a' },
                                            fontWeight: 'bold',
                                            px: { md: 4 }
                                        }}
                                    >
                                        Khám phá sự kiện
                                    </Button>

                                    <Button
                                        variant="outlined"
                                        size={isMobile ? "small" : "large"}
                                        sx={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.65)',
                                            '&:hover': {
                                                backgroundColor: 'rgba(255, 255, 255, 1)',
                                            },
                                        }}
                                        onClick={() => {
                                            const element = document.getElementById('why-choose-us');
                                            if (element) {
                                                element.scrollIntoView({ behavior: 'smooth' });
                                            }
                                        }}
                                    >
                                        Tìm hiểu thêm
                                    </Button>
                                </Stack>
                            </Container>
                        </Box>

                    </Box>
                ))}
            </Slider>
        </Box>
    );
}