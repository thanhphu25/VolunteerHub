import React, { useState } from 'react';
import {
    Box, TextField, Button, CircularProgress,
    IconButton, InputAdornment, Typography, Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';
import axiosClient from '../api/axiosClient';

// Cấu hình URL Backend để hiển thị ảnh local
const BACKEND_URL = 'http://localhost:8080';

export default function ImageUploader({ label, value, onChange, placeholder }) {
    const [uploading, setUploading] = useState(false);

    // Xử lý khi chọn file từ máy
    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validate ảnh
        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            // Gọi API Backend vừa tạo
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.url) {
                // Upload xong -> Tự động điền URL vào ô input
                onChange(res.data.url);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi upload ảnh: ' + (err.response?.data?.error || 'Lỗi server'));
        } finally {
            setUploading(false);
            // Reset input file để chọn lại file cũ được nếu muốn
            e.target.value = null;
        }
    };

    // Hàm hiển thị ảnh preview
    const getPreviewUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('http')) return url; // Ảnh online
        return `${BACKEND_URL}${url}`;          // Ảnh local
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                {label}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="flex-start">
                {/* 1. Ô NHẬP URL (Co giãn) */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder={placeholder || "https://..."}
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    disabled={uploading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <ImageIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* 2. NÚT UPLOAD (Bên cạnh) */}
                <Box>
                    <input
                        accept="image/*"
                        style={{ display: 'none' }}
                        id={`upload-btn-${label}`}
                        type="file"
                        onChange={handleFileSelect}
                    />
                    <label htmlFor={`upload-btn-${label}`}>
                        <Button
                            variant="contained"
                            component="span"
                            startIcon={uploading ? <CircularProgress size={20} color="inherit"/> : <CloudUploadIcon />}
                            disabled={uploading}
                            sx={{ whiteSpace: 'nowrap', height: '40px' }} // Chiều cao bằng TextField size small
                        >
                            {uploading ? 'Đang tải...' : 'Tải lên'}
                        </Button>
                    </label>
                </Box>
            </Stack>

            {/* 3. VÙNG XEM TRƯỚC (Preview) */}
            {value && (
                <Box
                    sx={{
                        mt: 2,
                        p: 1,
                        border: '1px dashed #ccc',
                        borderRadius: 2,
                        bgcolor: '#fafafa',
                        textAlign: 'center',
                        position: 'relative'
                    }}
                >
                    <Typography variant="caption" sx={{position: 'absolute', top: 5, left: 10, color: '#999'}}>
                        Xem trước
                    </Typography>
                    <img
                        src={getPreviewUrl(value)}
                        alt="Preview"
                        style={{ maxHeight: 150, maxWidth: '100%', borderRadius: 4, objectFit: 'contain' }}
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://placehold.co/400?text=Lỗi+Ảnh" }}
                    />
                </Box>
            )}
        </Box>
    );
}