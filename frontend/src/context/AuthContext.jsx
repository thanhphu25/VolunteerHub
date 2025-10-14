import React, {createContext, useContext, useEffect, useState} from 'react'
import userApi from '../api/userApi'

const AuthContext = createContext(null)

export function AuthProvider({children}) {
  const [token, setToken] = useState(() => localStorage.getItem('vh_token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(Boolean(token))

  useEffect(() => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return
    }
    setLoading(true)
    userApi.me()
    .then(res => setUser(res.data))
    .catch(() => {
      // if token invalid, clean up
      localStorage.removeItem('vh_token')
      setToken(null)
      setUser(null)
    })
    .finally(() => setLoading(false))
  }, [token])

  const login = (tokenValue) => {
    localStorage.setItem('vh_token', tokenValue)
    setToken(tokenValue)
  }
  const logout = () => {
    localStorage.removeItem('vh_token')
    setToken(null)
    setUser(null)
  }

  return (
      <AuthContext.Provider value={{token, user, loading, login, logout}}>
        {children}
      </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
