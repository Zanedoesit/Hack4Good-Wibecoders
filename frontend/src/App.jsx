import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom'
import { useState } from 'react'
import Login from './pages/Login'
import Activities from './pages/Activities'
import Signup from './pages/Signup'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import './App.css'

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [userType, setUserType] = useState(localStorage.getItem('userType'))

  const handleLogin = (t, ut) => {
    localStorage.setItem('token', t)
    localStorage.setItem('userType', ut)
    setToken(t)
    setUserType(ut)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    setToken(null)
    setUserType(null)
  }

  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="nav-container">
          <h1>MINDS Activity Signup</h1>
          {token ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <div className="nav-links">
              <Link to="/login">Login</Link>
              <Link to="/register">Create Account</Link>
            </div>
          )}
        </div>
      </nav>
      <Routes>
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/activities"
          element={token && userType === 'caregiver' ? <Activities token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup/:id"
          element={token && userType === 'caregiver' ? <Signup token={token} /> : <Navigate to="/login" />}
        />
        <Route
          path="/dashboard"
          element={token && userType === 'staff' ? <Dashboard token={token} /> : <Navigate to="/login" />}
        />
        <Route path="/" element={token ? <Navigate to={userType === 'caregiver' ? '/activities' : '/dashboard'} /> : <Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
