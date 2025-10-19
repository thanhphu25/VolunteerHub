import React from "react";
import {BrowserRouter as Router, Route, Routes} from "react-router-dom";
import NavBar from "./components/NavBar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Events from "./pages/Events";
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";
import OrganizerEvents from "./pages/admin/OrganizerEvents";
import AdminEventManagement from "./pages/admin/AdminEventManagement";

export default function App() {
  return (
      <Router>
        <NavBar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/register" element={<Register/>}/>
          <Route path="/events" element={<Events/>}/>
          
          {/* 👇 Chặn truy cập nếu chưa login */}
          <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <Dashboard/>
                </PrivateRoute>
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
