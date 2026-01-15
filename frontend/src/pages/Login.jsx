import { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [userType, setUserType] = useState('caregiver')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const res = await axios.post(`${API_URL}/auth/login`, { email, password })
      onLogin(res.data.token, res.data.user_type)
      navigate(res.data.user_type === 'caregiver' ? '/activities' : '/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
        <h2>Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <select value={userType} onChange={(e) => setUserType(e.target.value)}>
            <option value="caregiver">Caregiver</option>
            <option value="staff">Staff</option>
          </select>
          <button type="submit">Login</button>
        </form>
        <p style={{ marginTop: '16px', fontSize: '14px' }}>
          Demo credentials: email@test.com / password123
        </p>
        <p style={{ marginTop: '8px', fontSize: '14px' }}>
          Need an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
