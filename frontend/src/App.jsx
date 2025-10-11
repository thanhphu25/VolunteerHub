import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'

export default function App() {
    return (
        <div>
            <header style={{ padding: 12, borderBottom: '1px solid #eee' }}>
                <Link to="/">VolunteerHub</Link>
            </header>

            <main style={{ padding: 12 }}>
                <Routes>
                    <Route path="/" element={<Login />} />
                    <Route path="/login" element={<Login />} />
                    <Route
                        path="/dashboard"
                        element={<PrivateRoute><Dashboard /></PrivateRoute>}
                    />
                </Routes>
            </main>
        </div>
    )
}
