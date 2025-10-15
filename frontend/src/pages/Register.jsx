import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import authApi from "../api/authApi";

// Schema yup (giữ nguyên)
const schema = yup.object({
    fullName: yup.string().required("Vui lòng nhập tên của bạn"),
    email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
    phone: yup.string().matches(/^[0-9]{9,11}$/, "Số điện thoại không hợp lệ").required("Vui lòng nhập số điện thoại"),
    password: yup.string().min(6, "Mật khẩu tối thiểu 6 ký tự").required("Mật khẩu là bắt buộc"),
    confirmPassword: yup.string().oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp").required("Vui lòng nhập lại mật khẩu"),
    role: yup.string().oneOf(["volunteer", "organizer", "admin"]),
});

function Register() {
    const { register, handleSubmit, formState: { errors } } = useForm({
        resolver: yupResolver(schema),
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [fieldErrors, setFieldErrors] = useState({}); // validation errors from backend

    const onSubmit = async (data) => {
        setFieldErrors({});
        setMessage("");
        setLoading(true);

        try {
            // Chuẩn bị payload theo field backend mong đợi
            const payload = {
                fullName: data.fullName,
                email: data.email,
                phone: data.phone,
                password: data.password,
                role: data.role || "volunteer",
            };

            console.log("➡️ Sending payload:", payload);

            // Gọi API qua authApi (axiosClient đã cấu hình baseURL)
            const res = await authApi.register(payload);

            // Nếu thành công: res.data có thể chứa thông tin user / message
            console.log("✅ Server response:", res.data);
            setMessage(res.data?.message || "🎉 Đăng ký thành công!");
        } catch (err) {
            console.error("❌ Lỗi đăng ký:", err);

            // Nếu backend trả response (validation, duplicate email, ...)
            if (err.response) {
                console.error("Status:", err.response.status);
                console.error("Response data:", err.response.data);

                const data = err.response.data;

                // Nếu backend trả object errors theo rule { errors: { email: [...], password: [...] } }
                if (data?.errors && typeof data.errors === "object") {
                    setFieldErrors(data.errors);
                    // Build user-friendly message
                    const firstErrField = Object.keys(data.errors)[0];
                    const firstErrMsg = Array.isArray(data.errors[firstErrField])
                        ? data.errors[firstErrField][0]
                        : data.errors[firstErrField];
                    setMessage(firstErrMsg || "Đăng ký thất bại do lỗi dữ liệu");
                } else if (data?.message) {
                    setMessage(data.message);
                } else {
                    setMessage("Đăng ký thất bại. Vui lòng thử lại!");
                }
            } else {
                // Không có response: network / CORS
                console.error("No response from server. Possible network/CORS issue.");
                setMessage("Không kết nối được tới server. Kiểm tra server/CORS.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
                    VolunteerHub - Đăng ký
                </h2>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block font-medium mb-1">Họ và tên</label>
                        <input {...register("fullName")} type="text"
                               className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                               placeholder="Nhập họ tên của bạn"/>
                        <p className="text-red-500 text-sm">{errors.fullName?.message || fieldErrors.fullName?.join?.(", ") || fieldErrors.name?.join?.(", ")}</p>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Email</label>
                        <input {...register("email")} type="email"
                               className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                               placeholder="Nhập email"/>
                        <p className="text-red-500 text-sm">{errors.email?.message || fieldErrors.email?.join?.(", ")}</p>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Số điện thoại</label>
                        <input {...register("phone")} type="text"
                               className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                               placeholder="Nhập số điện thoại"/>
                        <p className="text-red-500 text-sm">{errors.phone?.message || fieldErrors.phone?.join?.(", ")}</p>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Mật khẩu</label>
                        <input {...register("password")} type="password"
                               className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                               placeholder="Nhập mật khẩu"/>
                        <p className="text-red-500 text-sm">{errors.password?.message || fieldErrors.password?.join?.(", ")}</p>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Xác nhận mật khẩu</label>
                        <input {...register("confirmPassword")} type="password"
                               className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                               placeholder="Nhập lại mật khẩu"/>
                        <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>
                    </div>

                    <div>
                        <label className="block font-medium mb-1">Vai trò</label>
                        <select {...register("role")} className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200" defaultValue="volunteer">
                            <option value="volunteer">Tình nguyện viên</option>
                            <option value="organizer">Người tổ chức</option>
                            <option value="admin">Quản trị viên</option>
                        </select>
                    </div>

                    <button type="submit" disabled={loading} className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition">
                        {loading ? "Đang xử lý..." : "Đăng ký"}
                    </button>
                </form>

                {message && (
                    <p className={`mt-4 text-center font-semibold ${message.includes("thành công") ? "text-green-600" : "text-red-500"}`}>
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}

export default Register;
