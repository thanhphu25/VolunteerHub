import React from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import { Box } from "@mui/material";

// Layout Components
import NavBar from "./components/NavBar";
import Footer from "./components/Footer.jsx";

// Public Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Events from "./pages/Events";
import EventDetail from "./pages/EventDetail.jsx";

// Protected Pages
import MyRegistrations from "./pages/MyRegistrations.jsx";
import Profile from "./pages/Profile";
import Notifications from "./pages/Notifications";

// Security Wrappers
import PrivateRoute from "./components/PrivateRoute";
import RoleBasedRoute from "./components/RoleBasedRoute";

// Admin & Organizer Specific Pages
import OrganizerEvents from "./pages/admin/OrganizerEvents";
import AdminEventManagement from "./pages/admin/AdminEventManagement";
import EventRegistrations from "./pages/admin/EventRegistrations.jsx";
import AdminUserManagement from "./pages/admin/AdminUserManagement.jsx";

/**
 * Root Application Component
 * Manages global routing, layout structure, and access control.
 */
export default function App() {
  const location = useLocation();

  // Define paths where the footer should not be displayed (e.g., auth pages)
  const hideFooterPaths = ["/login", "/register"];
  const shouldHideFooter = hideFooterPaths.includes(location.pathname);

  return (
    // Main container using Flexbox to ensure the footer stays at the bottom
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      
      {/* Global Navigation Bar */}
      <NavBar />

      {/* Main Content Area: flexGrow allows it to take up remaining space */}
      <Box component="main" sx={{ flexGrow: 1 }}>
        <Routes>
          {/* --- Public Routes --- */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<EventDetail />} />

          {/* --- Authenticated Routes (Any Role) --- */}
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

          {/* --- Volunteer Specific Routes --- */}
          <Route
            path="/my-registrations"
            element={
              <RoleBasedRoute allowedRoles={['volunteer']}>
                <MyRegistrations />
              </RoleBasedRoute>
            }
          />

          {/* --- Organizer Specific Routes --- */}
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

          {/* --- Admin Specific Routes --- */}
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

          {/* --- Fallback 404 Route --- */}
          <Route path="*" element={<h2>404 - Không tìm thấy trang</h2>} />
        </Routes>
      </Box>

      {/* Conditional Rendering of Footer */}
      {!shouldHideFooter && <Footer />}

    </Box>
  );
}