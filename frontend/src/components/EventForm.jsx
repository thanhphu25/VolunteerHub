import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
  Alert
} from "@mui/material";

export default function EventForm({ open, onClose, onSubmit, initialData, isEdit }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: "",
    location: "",
    address: "",
    startDate: "",
    endDate: "",
    maxVolunteers: "",
    imageUrl: "",
    requirements: "",
    benefits: "",
    contactInfo: ""
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      // Format dates for datetime-local input
      const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      };

      setFormData({
        name: initialData.name || "",
        description: initialData.description || "",
        category: initialData.category || "",
        location: initialData.location || "",
        address: initialData.address || "",
        startDate: formatDateTime(initialData.startDate),
        endDate: formatDateTime(initialData.endDate),
        maxVolunteers: initialData.maxVolunteers || "",
        imageUrl: initialData.imageUrl || "",
        requirements: initialData.requirements || "",
        benefits: initialData.benefits || "",
        contactInfo: initialData.contactInfo || ""
      });
    } else {
      // Reset form for new event
      setFormData({
        name: "",
        description: "",
        category: "",
        location: "",
        address: "",
        startDate: "",
        endDate: "",
        maxVolunteers: "",
        imageUrl: "",
        requirements: "",
        benefits: "",
        contactInfo: ""
      });
    }
    setErrors({});
  }, [initialData, open]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên sự kiện là bắt buộc";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Mô tả là bắt buộc";
    }
    if (!formData.category.trim()) {
      newErrors.category = "Danh mục là bắt buộc";
    }
    if (!formData.location.trim()) {
      newErrors.location = "Địa điểm là bắt buộc";
    }
    if (!formData.startDate) {
      newErrors.startDate = "Ngày bắt đầu là bắt buộc";
    }
    if (!formData.endDate) {
      newErrors.endDate = "Ngày kết thúc là bắt buộc";
    }
    if (formData.startDate && formData.endDate && new Date(formData.startDate) >= new Date(formData.endDate)) {
      newErrors.endDate = "Ngày kết thúc phải sau ngày bắt đầu";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Convert datetime-local format to ISO string for API
      const submitData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null,
        maxVolunteers: formData.maxVolunteers ? parseInt(formData.maxVolunteers) : null
      };
      onSubmit(submitData);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sự kiện"
                name="name"
                value={formData.name}
                onChange={handleChange}
                error={!!errors.name}
                helperText={errors.name}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                name="description"
                value={formData.description}
                onChange={handleChange}
                error={!!errors.description}
                helperText={errors.description}
                required
                multiline
                rows={4}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Danh mục"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={!!errors.category}
                helperText={errors.category}
                required
                placeholder="VD: Môi trường, Giáo dục, Y tế"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa điểm"
                name="location"
                value={formData.location}
                onChange={handleChange}
                error={!!errors.location}
                helperText={errors.location}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ chi tiết"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                name="startDate"
                type="datetime-local"
                value={formData.startDate}
                onChange={handleChange}
                error={!!errors.startDate}
                helperText={errors.startDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                name="endDate"
                type="datetime-local"
                value={formData.endDate}
                onChange={handleChange}
                error={!!errors.endDate}
                helperText={errors.endDate}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số lượng tình nguyện viên tối đa"
                name="maxVolunteers"
                type="number"
                value={formData.maxVolunteers}
                onChange={handleChange}
                inputProps={{ min: 1 }}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL hình ảnh"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://..."
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Yêu cầu"
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="VD: Có khả năng làm việc nhóm, khỏe mạnh"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Lợi ích"
                name="benefits"
                value={formData.benefits}
                onChange={handleChange}
                multiline
                rows={3}
                placeholder="VD: Chứng nhận tình nguyện, cơm trưa miễn phí"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thông tin liên hệ"
                name="contactInfo"
                value={formData.contactInfo}
                onChange={handleChange}
                placeholder="VD: Email hoặc số điện thoại"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Hủy</Button>
          <Button type="submit" variant="contained" color="primary">
            {isEdit ? "Cập nhật" : "Tạo sự kiện"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

