// App.jsx
import React from "react";
import {Route, Routes} from "react-router-dom";
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

export default function App() {
  return (
      // 2. Xóa thẻ <Router> bao ngoài, dùng Fragment <>...</> nếu cần
      <>
        <NavBar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/events" element={<Events/>}/>
          <Route path="/events/:eventId" element={<EventDetail/>}/>
          {/* 👇 Chặn truy cập nếu chưa login */}
          <Route
              path="/profile"
              element={
                <PrivateRoute>
                  <Profile/>
                </PrivateRoute>
              }
          />

          <Route
              path="/notifications"
              element={
                <PrivateRoute>
                  <Notifications/>
                </PrivateRoute>
              }
          />

          {/* 👇 Route cho My Registrations - chỉ dành cho volunteers */}
          <Route
              path="/my-registrations"
              element={
                <RoleBasedRoute allowedRoles={['volunteer']}>
                  <MyRegistrations/>
                </RoleBasedRoute>
              }
          />
          {/* 👇 Routes cho Organizer */}
          <Route
              path="/organizer/events"
              element={
                <RoleBasedRoute allowedRoles={['organizer']}>
                  <OrganizerEvents/>
                </RoleBasedRoute>
              }
          />
          <Route
              path="/organizer/events/:eventId/registrations"
              element={
                <RoleBasedRoute allowedRoles={["organizer"]}>
                  <EventRegistrations/>
                </RoleBasedRoute>
              }
          />
          {/* 👇 Routes cho Admin */}
          <Route
              path="/admin/events"
              element={
                <RoleBasedRoute allowedRoles={['admin']}>
                  <AdminEventManagement/>
                </RoleBasedRoute>
              }
          />

          <Route
              path="/admin/users"
              element={
                <RoleBasedRoute
                    allowedRoles={['admin']}> {/* Chỉ cho phép Admin */}
                  <AdminUserManagement/>
                </RoleBasedRoute>
              }
          />

          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>}/>
        </Routes>
      </>
  );
}