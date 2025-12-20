// App.jsx
import React from "react";
import { Route, Routes } from "react-router-dom";
import { Box } from "@mui/material"; // Import thêm Box để căn chỉnh layout
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail.jsx";
import MyRegistrations from "./pages/MyRegistrations.jsx";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import OrganizerEvents from "./pages/admin/OrganizerEvents";
import AdminEventManagement from "./pages/admin/AdminEventManagement";
import EventRegistrations from "./pages/admin/EventRegistrations.jsx";
import AdminUserManagement from "./pages/admin/AdminUserManagement.jsx";
import Footer from "./components/Footer.jsx"; // Đã có import này từ code của bạn

export default function App() {
  return (
    /* 1. Sử dụng Box với flex column để quản lý toàn bộ chiều cao trang web */
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      <NavBar />

      {/* 2. Box 'main' sẽ chiếm phần diện tích còn lại (flexGrow: 1) và đẩy Footer xuống cuối */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />
          
          {/* Chặn truy cập nếu chưa login */}
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <PrivateRoute>
                <Notifications />
              </PrivateRoute>
            }
          />

          {/* Route cho My Registrations - chỉ dành cho volunteers */}
          <Route
            path="/my-registrations"
            element={
              <RoleBasedRoute allowedRoles={['volunteer']}>
                <MyRegistrations />
              </RoleBasedRoute>
            }
          />

          {/* Routes cho Organizer */}
          <Route
            path="/organizer/events"
            element={
              <RoleBasedRoute allowedRoles={['organizer']}>
                <OrganizerEvents />
              </RoleBasedRoute>
            }
          />
          <Route
            path="/organizer/events/:eventId/registrations"
            element={
              <RoleBasedRoute allowedRoles={["organizer"]}>
                <EventRegistrations />
              </RoleBasedRoute>
            }
          />

          {/* Routes cho Admin */}
          <Route
            path="/admin/events"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminEventManagement />
              </RoleBasedRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <RoleBasedRoute allowedRoles={['admin']}>
                <AdminUserManagement />
              </RoleBasedRoute>
            }
          />

          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
        </Routes>
      </Box>

      {/* 3. Footer nằm ngoài phần nội dung chính, luôn ở dưới cùng */}
      <Footer />

    </Box>
  );
}