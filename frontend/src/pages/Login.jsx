import React, { useState } from 'react'
import authApi from '../api/authApi'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Login() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const nav = useNavigate()
    const { login } = useAuth()

    const submit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await authApi.login({ email, password })
            // backend may return { accessToken: '...' } or { token: '...' }
            const token = res.data.accessToken || res.data.token || res.data
            if (!token) throw new Error('No token returned')
            login(token)
            nav('/dashboard')
        } catch (err) {
            alert(err.response?.data || err.message || 'Login failed')
        } finally { setLoading(false) }
    }

    return (
        <div className="container">
            <h2>Sign in</h2>
            <form onSubmit={submit} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="Email" />
                <input type="password" value={password} onChange={(e)=>setPassword(e.target.value)} placeholder="Password" />
                <button type="submit" disabled={loading}>{loading ? 'Signing...' : 'Sign in'}</button>
            </form>
        </div>
    )
}
