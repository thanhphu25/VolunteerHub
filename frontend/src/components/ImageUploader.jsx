/**
 * ImageUploader Component
 * Provides image upload functionality with preview capability.
 * Supports direct URL input or file upload from user's device.
 * Displays image preview and validates file type before upload.
 *
 * @component
 * @param {Object} props - Component props
 * @param {string} props.label - Label text for the image uploader
 * @param {string} [props.value] - Current image URL value
 * @param {Function} props.onChange - Callback function when image URL changes
 * @param {string} [props.placeholder] - Placeholder text for URL input field
 * @returns {JSX.Element} Image upload interface with preview
 */
import React, { useState } from 'react';
import {
    Box, TextField, Button, CircularProgress,
    IconButton, InputAdornment, Typography, Stack
} from '@mui/material';
import { CloudUpload as CloudUploadIcon, Image as ImageIcon } from '@mui/icons-material';
import axiosClient from '../api/axiosClient';

const BACKEND_URL = 'http://localhost:8080';

export default function ImageUploader({ label, value, onChange, placeholder }) {
    const [uploading, setUploading] = useState(false);

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
            }
        } catch (err) {
            console.error(err);
            alert('Lỗi upload ảnh: ' + (err.response?.data?.error || 'Lỗi server'));
        } finally {
            setUploading(false);
            e.target.value = null;
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
                { }
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

                { }
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

            { }
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