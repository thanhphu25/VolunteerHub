import React from 'react'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
    const { user, logout } = useAuth()
    return (
        <div className="container">
            <h2>Dashboard</h2>
            {user ? (
                <div>
                    <p>Welcome, {user.fullName || user.email}</p>
                    <p>Role: {user.role || (user.role && user.role.name)}</p>
                    <button onClick={logout}>Logout</button>
                </div>
            ) : (
                <p>Loading user...</p>
            )}
        </div>
    )
}
