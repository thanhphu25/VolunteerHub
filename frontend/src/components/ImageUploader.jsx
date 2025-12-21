import React, { useState, useEffect } from 'react';
import {
    Box, TextField, Button, CircularProgress,
    InputAdornment, Typography, Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';
import axiosClient from '../api/axiosClient';

const BACKEND_URL = 'http://localhost:8080';

/**
 * ImageUploader Component
 * * Logic hiển thị URL:
 * - Nếu người dùng nhập tay (http...): Hiển thị URL trong ô input.
 * - Nếu người dùng upload file hoặc load ảnh từ backend: Ẩn URL trong ô input (để trống) nhưng vẫn hiện ảnh preview.
 */
export default function ImageUploader({ label, value, onChange, placeholder }) {
    const [uploading, setUploading] = useState(false);

    const [isUploaded, setIsUploaded] = useState(() => {
        return value && !value.startsWith('http');
    });

    useEffect(() => {
        if (value && !value.startsWith('http')) {
            setIsUploaded(true);
        }
    }, [value]);

    const handleFileSelect = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            alert('Vui lòng chọn file ảnh!');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await axiosClient.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (res.data && res.data.url) {
                onChange(res.data.url);
                setIsUploaded(true);
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi upload ảnh: ' + (err.response?.data?.error || 'Lỗi server'));
        } finally {
            setUploading(false);
            e.target.value = null; // Reset input file để chọn lại được file cũ nếu muốn
        }
    };

    const getPreviewUrl = (url) => {
        if (!url) return "";
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    return (
        <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" gutterBottom fontWeight="bold">
                {label}
            </Typography>

            <Stack direction="row" spacing={1} alignItems="flex-start">
                {/* Ô nhập URL */}
                <TextField
                    fullWidth
                    size="small"
                    placeholder={placeholder || "https://..."}
                    value={isUploaded ? '' : (value || '')}
                    onChange={(e) => {
                        setIsUploaded(false);
                        onChange(e.target.value);
                    }}
                    disabled={uploading}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <ImageIcon color="action" />
                            </InputAdornment>
                        ),
                    }}
                />

                {/* Nút Upload */}
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
                            startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <CloudUploadIcon />}
                            disabled={uploading}
                            sx={{ whiteSpace: 'nowrap', height: '40px' }}
                        >
                            {uploading ? 'Đang tải...' : 'Tải lên'}
                        </Button>
                    </label>
                </Box>
            </Stack>

            {/* Phần hiển thị Preview (Luôn hiện nếu có value) */}
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
                    <Typography variant="caption" sx={{ position: 'absolute', top: 5, left: 10, color: '#999' }}>
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