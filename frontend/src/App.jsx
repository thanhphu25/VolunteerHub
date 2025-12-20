// App.jsx
import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Box } from "@mui/material";
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
import Footer from "./components/Footer.jsx";

export default function App() {
  const location = useLocation();

  // 1. Xác định các trang không hiển thị Footer
  const hideFooterPaths = ["/login", "/register"];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* 2. Thanh NavBar luôn luôn hiển thị trên mọi trang */}
      <NavBar />

      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />

          {/* Các Route bảo mật và phân quyền */}
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
          <Route
            path="/my-registrations"
            element={
              <RoleBasedRoute allowedRoles={['volunteer']}>
                <MyRegistrations />
              </RoleBasedRoute>
            }
          />
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

      {/* 3. Footer chỉ hiển thị nếu không phải trang login/register */}
      {!shouldHideFooter && <Footer />}

    </Box>
  );
}