import React, { useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

// 1. Định nghĩa Schema kiểm tra dữ liệu với Yup
const eventSchema = yup.object().shape({
  name: yup.string().required("Tên sự kiện là bắt buộc"),
  description: yup.string().required("Mô tả là bắt buộc"),
  category: yup.string().required("Danh mục là bắt buộc"),
  location: yup.string().required("Địa điểm là bắt buộc"),
  address: yup.string(),
  startDate: yup.date()
    .typeError("Vui lòng chọn ngày giờ hợp lệ")
    .required("Ngày bắt đầu là bắt buộc"),
  endDate: yup.date()
    .typeError("Vui lòng chọn ngày giờ hợp lệ")
    .required("Ngày kết thúc là bắt buộc")
    .min(yup.ref('startDate'), "Ngày kết thúc phải sau ngày bắt đầu"),
  maxVolunteers: yup.number()
    .transform((value) => (isNaN(value) ? undefined : value))
    .nullable()
    .moreThan(0, "Số lượng phải lớn hơn 0"),
  imageUrl: yup.string().url("Vui lòng nhập URL hình ảnh hợp lệ"),
  requirements: yup.string(),
  benefits: yup.string(),
  contactInfo: yup.string()
});

export default function EventForm({ open, onClose, onSubmit, initialData, isEdit }) {
  
  // 2. Khởi tạo React Hook Form với Yup Resolver
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(eventSchema),
    defaultValues: {
        maxVolunteers: ""
    }
  });

  // 3. Xử lý đổ dữ liệu cũ khi Chỉnh sửa (Edit)
  useEffect(() => {
    if (initialData && open) {
      const formatDateTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toISOString().slice(0, 16); // Chuyển về format: YYYY-MM-DDTHH:mm
      };

      reset({
        ...initialData,
        startDate: formatDateTime(initialData.startDate),
        endDate: formatDateTime(initialData.endDate),
        maxVolunteers: initialData.maxVolunteers || ""
      });
    } else if (open) {
      reset({
        name: "", description: "", category: "", location: "", address: "",
        startDate: "", endDate: "", maxVolunteers: "", imageUrl: "",
        requirements: "", benefits: "", contactInfo: ""
      });
    }
  }, [initialData, open, reset]);

  // 4. Hàm xử lý khi nhấn Submit
  const onFormSubmit = (data) => {
    // Chuẩn hóa dữ liệu trước khi gửi cho API
    const submitData = {
      ...data,
      startDate: new Date(data.startDate).toISOString(),
      endDate: new Date(data.endDate).toISOString(),
      maxVolunteers: data.maxVolunteers ? parseInt(data.maxVolunteers) : null
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>
        {isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
      </DialogTitle>
      
      <form onSubmit={handleSubmit(onFormSubmit)}>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Tên sự kiện"
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Mô tả"
                multiline
                rows={4}
                {...register("description")}
                error={!!errors.description}
                helperText={errors.description?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Danh mục"
                placeholder="VD: Môi trường, Giáo dục"
                {...register("category")}
                error={!!errors.category}
                helperText={errors.category?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Địa điểm (Tỉnh/Thành phố)"
                {...register("location")}
                error={!!errors.location}
                helperText={errors.location?.message}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Địa chỉ chi tiết"
                {...register("address")}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày bắt đầu"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...register("startDate")}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Ngày kết thúc"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                {...register("endDate")}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
                required
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Số lượng TNV tối đa"
                type="number"
                {...register("maxVolunteers")}
                error={!!errors.maxVolunteers}
                helperText={errors.maxVolunteers?.message}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="URL hình ảnh"
                placeholder="https://..."
                {...register("imageUrl")}
                error={!!errors.imageUrl}
                helperText={errors.imageUrl?.message}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Yêu cầu"
                multiline
                rows={3}
                {...register("requirements")}
                placeholder="Các kỹ năng hoặc điều kiện cần có"
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Lợi ích"
                multiline
                rows={3}
                {...register("benefits")}
                placeholder="Những gì TNV sẽ nhận được"
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Thông tin liên hệ"
                {...register("contactInfo")}
                placeholder="Email hoặc Số điện thoại người phụ trách"
              />
            </Grid>
          </Grid>
        </DialogContent>

        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={onClose} color="inherit">Hủy</Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary" 
            disabled={isSubmitting}
            sx={{ px: 4, borderRadius: 2 }}
          >
            {isEdit ? "Cập nhật" : "Tạo sự kiện"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}