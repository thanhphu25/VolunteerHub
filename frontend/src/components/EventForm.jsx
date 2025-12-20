import React, { useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Grid,
    Typography
} from "@mui/material";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import ImageUploader from "./ImageUploader";

// --- SỬA Ở ĐÂY: Bỏ .url() để chấp nhận đường dẫn /uploads/ ---
const eventSchema = yup.object().shape({
    name: yup.string().required("Tên sự kiện là bắt buộc"),
    description: yup.string().required("Mô tả là bắt buộc"),
    category: yup.string().required("Danh mục là bắt buộc"),
    location: yup.string().required("Địa điểm là bắt buộc"),
    address: yup.string(),
    startDate: yup.date().typeError("Ngày không hợp lệ").required("Ngày bắt đầu là bắt buộc"),
    endDate: yup.date().typeError("Ngày không hợp lệ").required("Ngày kết thúc là bắt buộc")
        .min(yup.ref('startDate'), "Ngày kết thúc phải sau ngày bắt đầu"),
    maxVolunteers: yup.number().transform((v) => (isNaN(v) ? undefined : v)).nullable().moreThan(0, "Phải lớn hơn 0"),

    // QUAN TRỌNG: Chỉ để string().nullable(), KHÔNG dùng .url()
    imageUrl: yup.string().nullable(),

    requirements: yup.string(),
    benefits: yup.string(),
    contactInfo: yup.string()
});

export default function EventForm({ open, onClose, onSubmit, initialData, isEdit }) {
    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: { errors, isSubmitting }
    } = useForm({
        resolver: yupResolver(eventSchema),
        defaultValues: { maxVolunteers: "", imageUrl: "" }
    });

    useEffect(() => {
        if (initialData && open) {
            const formatDateTime = (d) => d ? new Date(d).toISOString().slice(0, 16) : "";
            reset({
                ...initialData,
                startDate: formatDateTime(initialData.startDate),
                endDate: formatDateTime(initialData.endDate),
                maxVolunteers: initialData.maxVolunteers || "",
                imageUrl: initialData.imageUrl || ""
            });
        } else if (open) {
            reset({
                name: "", description: "", category: "", location: "", address: "",
                startDate: "", endDate: "", maxVolunteers: "", imageUrl: "",
                requirements: "", benefits: "", contactInfo: ""
            });
        }
    }, [initialData, open, reset]);

    const onFormSubmit = (data) => {
        onSubmit({
            ...data,
            startDate: new Date(data.startDate).toISOString(),
            endDate: new Date(data.endDate).toISOString(),
            maxVolunteers: data.maxVolunteers ? parseInt(data.maxVolunteers) : null
        });
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle sx={{ fontWeight: 'bold' }}>
                {isEdit ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
            </DialogTitle>

            <form onSubmit={handleSubmit(onFormSubmit)}>
                <DialogContent dividers>
                    <Grid container spacing={3}>
                        <Grid item xs={12}><TextField fullWidth label="Tên sự kiện" {...register("name")} error={!!errors.name} helperText={errors.name?.message} required /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Mô tả" multiline rows={4} {...register("description")} error={!!errors.description} helperText={errors.description?.message} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Danh mục" {...register("category")} error={!!errors.category} helperText={errors.category?.message} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Địa điểm" {...register("location")} error={!!errors.location} helperText={errors.location?.message} required /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Địa chỉ chi tiết" {...register("address")} /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Ngày bắt đầu" type="datetime-local" InputLabelProps={{ shrink: true }} {...register("startDate")} error={!!errors.startDate} helperText={errors.startDate?.message} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Ngày kết thúc" type="datetime-local" InputLabelProps={{ shrink: true }} {...register("endDate")} error={!!errors.endDate} helperText={errors.endDate?.message} required /></Grid>
                        <Grid item xs={12} sm={6}><TextField fullWidth label="Số lượng TNV tối đa" type="number" {...register("maxVolunteers")} error={!!errors.maxVolunteers} helperText={errors.maxVolunteers?.message} /></Grid>

                        {/* UPLOAD ẢNH */}
                        <Grid item xs={12}>
                            <Controller
                                name="imageUrl"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <ImageUploader
                                        label="Ảnh bìa sự kiện"
                                        value={value}
                                        onChange={onChange}
                                        placeholder="Tải ảnh lên hoặc dán link..."
                                    />
                                )}
                            />
                            {errors.imageUrl && <Typography variant="caption" color="error">{errors.imageUrl.message}</Typography>}
                        </Grid>

                        <Grid item xs={12} md={6}><TextField fullWidth label="Yêu cầu" multiline rows={3} {...register("requirements")} /></Grid>
                        <Grid item xs={12} md={6}><TextField fullWidth label="Lợi ích" multiline rows={3} {...register("benefits")} /></Grid>
                        <Grid item xs={12}><TextField fullWidth label="Thông tin liên hệ" {...register("contactInfo")} /></Grid>
                    </Grid>
                </DialogContent>
                <DialogActions sx={{ p: 2.5 }}>
                    <Button onClick={onClose} color="inherit">Hủy</Button>
                    <Button type="submit" variant="contained" disabled={isSubmitting}>{isEdit ? "Cập nhật" : "Tạo sự kiện"}</Button>
                </DialogActions>
            </form>
        </Dialog>
    );
}