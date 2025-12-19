import React from 'react';
import Slider from "react-slick";
import { Box, Typography, Button, Container, Stack, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
// Import CSS bắt buộc của thư viện slider
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Dữ liệu mẫu cho các slide (Bạn có thể thay link ảnh khác nếu muốn)
const slides = [
    {
        id: 1,
        image: 'https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop',
        title: 'Kết nối trái tim – Lan tỏa yêu thương',
        subtitle: 'Tham gia cộng đồng tình nguyện lớn nhất Việt Nam ngay hôm nay.'
    },
    {
        id: 2,
        image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?q=80&w=2074&auto=format&fit=crop',
        title: 'Hành động nhỏ, Ý nghĩa lớn',
        subtitle: 'Chung tay bảo vệ môi trường và xây dựng không gian xanh sạch đẹp.'
    },
    {
        id: 3,
        image: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?q=80&w=2070&auto=format&fit=crop',
        title: 'Sẻ chia là hạnh phúc',
        subtitle: 'Hỗ trợ trẻ em nghèo và những hoàn cảnh khó khăn trên khắp cả nước.'
    }
];

export default function HeroSlider() {
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Cấu hình Slider
    const settings = {
        dots: true,             // Hiện chấm tròn dưới đáy
        infinite: true,         // Chạy vòng lặp
        speed: 1500,            // Tốc độ chuyển cảnh (ms)
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,         // Tự động chạy
        autoplaySpeed: 5000,    // Thời gian dừng ở mỗi ảnh (5s)
        fade: true,             // Hiệu ứng mờ dần (sang trọng hơn trượt ngang)
        arrows: !isMobile,      // Ẩn mũi tên trên điện thoại cho đỡ vướng
        pauseOnHover: false,    // Không dừng khi di chuột vào
    };

    return (
        // Box bao ngoài để tránh thanh cuộn ngang
        <Box sx={{ width: '100%', overflow: 'hidden', bgcolor: 'black' }}>
            <Slider {...settings}>
                {slides.map((slide) => (
                    <Box key={slide.id} sx={{ position: 'relative', outline: 'none' }}>
                        
                        {/* 1. ẢNH NỀN */}
                        <Box
                            sx={{
                                height: { xs: '500px', md: '750px' }, // Mobile cao 500px, PC cao 750px
                                backgroundImage: `url(${slide.image})`,
                                backgroundSize: 'cover',
                                backgroundPosition: 'center',
                            }}
                        />

                        {/* 2. LỚP PHỦ TỐI (Overlay) - Giúp chữ trắng luôn đọc được */}
                        <Box
                            sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.7))',
                            }}
                        />

                        {/* 3. NỘI DUNG CHỮ & NÚT */}
                        <Container
                            maxWidth="lg"
                            sx={{
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                                display: 'flex', 
                                flexDirection: 'column', 
                                justifyContent: 'center', 
                                alignItems: 'center',
                                textAlign: 'center', 
                                zIndex: 2, 
                                px: 2,
                                color: 'white'
                            }}
                        >
                            <Typography 
                                variant="h2" 
                                component="h1" 
                                fontWeight="800"
                                gutterBottom
                                sx={{ 
                                    fontSize: { xs: '2rem', md: '4rem' },
                                    textShadow: '2px 2px 10px rgba(0,0,0,0.5)',
                                    animation: 'fadeInUp 1s ease-out' // Hiệu ứng chữ hiện lên
                                }}
                            >
                                {slide.title}
                            </Typography>

                            <Typography 
                                variant="h5" 
                                paragraph
                                sx={{ 
                                    maxWidth: '800px', 
                                    mb: 4, 
                                    opacity: 0.9,
                                    fontSize: { xs: '1rem', md: '1.5rem' },
                                    textShadow: '1px 1px 5px rgba(0,0,0,0.5)',
                                }}
                            >
                                {slide.subtitle}
                            </Typography>

                            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                <Button 
                                    variant="contained" 
                                    size="large"
                                    onClick={() => navigate("/events")}
                                    sx={{ 
                                        px: 4, py: 1.5, 
                                        fontSize: '1.1rem', 
                                        fontWeight: 'bold', 
                                        borderRadius: 2,
                                        bgcolor: 'primary.main', 
                                        boxShadow: 3,
                                        '&:hover': { bgcolor: 'primary.dark', transform: 'translateY(-2px)' },
                                        transition: 'all 0.3s'
                                    }}
                                >
                                    Khám phá sự kiện
                                </Button>
                                <Button 
                                    variant="outlined" 
                                    size="large"
                                    onClick={() => navigate("/about")} // Ví dụ link đến trang giới thiệu
                                    sx={{ 
                                        px: 4, py: 1.5, 
                                        fontSize: '1.1rem', 
                                        fontWeight: 'bold', 
                                        borderRadius: 2,
                                        color: 'white', 
                                        borderColor: 'white', 
                                        borderWidth: 2,
                                        '&:hover': { 
                                            borderColor: 'white', 
                                            bgcolor: 'rgba(255,255,255,0.1)',
                                            borderWidth: 2
                                        }
                                    }}
                                >
                                    Tìm hiểu thêm
                                </Button>
                            </Stack>
                        </Container>
                    </Box>
                ))}
            </Slider>
        </Box>
    );
}