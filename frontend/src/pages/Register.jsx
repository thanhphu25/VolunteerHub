import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import * as yup from "yup";
import authApi from "../api/authApi";
import {useState} from "react";

const schema = yup.object({
  fullName: yup.string().required("Vui lòng nhập tên của bạn"),
  email: yup.string().email("Email không hợp lệ").required("Email là bắt buộc"),
  password: yup
  .string()
  .min(6, "Mật khẩu tối thiểu 6 ký tự")
  .required("Mật khẩu là bắt buộc"),
  confirmPassword: yup
  .string()
  .oneOf([yup.ref("password")], "Mật khẩu xác nhận không khớp")
  .required("Vui lòng nhập lại mật khẩu"),
});

function Register() {
  const {
    register,
    handleSubmit,
    formState: {errors},
  } = useForm({
    resolver: yupResolver(schema),
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setMessage("");
      const response = await authApi.register({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
      });

      setMessage("🎉 Đăng ký thành công!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Đăng ký thất bại. Vui lòng thử lại!");
    } finally {
      setLoading(false);
    }
  };

  return (
      <div
          className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-lg p-8 w-full max-w-md">
          <h2 className="text-2xl font-bold text-center mb-6 text-indigo-600">
            VolunteerHub - Đăng ký
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block font-medium mb-1">Họ và tên</label>
              <input
                  {...register("fullName")}
                  type="text"
                  className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                  placeholder="Nhập họ tên của bạn"
              />
              <p className="text-red-500 text-sm">{errors.fullName?.message}</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Email</label>
              <input
                  {...register("email")}
                  type="email"
                  className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                  placeholder="Nhập email"
              />
              <p className="text-red-500 text-sm">{errors.email?.message}</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Mật khẩu</label>
              <input
                  {...register("password")}
                  type="password"
                  className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                  placeholder="Nhập mật khẩu"
              />
              <p className="text-red-500 text-sm">{errors.password?.message}</p>
            </div>

            <div>
              <label className="block font-medium mb-1">Xác nhận mật
                khẩu</label>
              <input
                  {...register("confirmPassword")}
                  type="password"
                  className="w-full border border-gray-300 p-2 rounded focus:ring focus:ring-indigo-200"
                  placeholder="Nhập lại mật khẩu"
              />
              <p className="text-red-500 text-sm">
                {errors.confirmPassword?.message}
              </p>
            </div>

            <button
                type="submit"
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition"
            >
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </button>
          </form>

          {message && (
              <p
                  className={`mt-4 text-center font-semibold ${
                      message.includes("thành công")
                          ? "text-green-600"
                          : "text-red-500"
                  }`}
              >
                {message}
              </p>
          )}
        </div>
      </div>
  );
}

export default Register;
