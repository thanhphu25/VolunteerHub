import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail.jsx";
import MyRegistrations from "./pages/MyRegistrations.jsx";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import OrganizerEvents from "./pages/admin/OrganizerEvents";
import AdminEventManagement from "./pages/admin/AdminEventManagement";
import EventRegistrations from "./pages/admin/EventRegistrations.jsx";
import Profile from "./pages/Profile.jsx";
import Notifications from "./pages/Notifications.jsx";

export default function App() {
  return (
      <Router>
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
          {/* 2. Thêm route mới cho trang quản lý đăng ký */}
          <Route
              path="/organizer/events/:eventId/registrations"
              element={
                <RoleBasedRoute allowedRoles={["organizer"]}> {/* Cho phép cả admin */}
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

          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>}/>
        </Routes>
      </Router>
  );
}
