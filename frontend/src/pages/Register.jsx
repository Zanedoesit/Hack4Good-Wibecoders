import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [userType, setUserType] = useState('caregiver')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setSubmitting(true)
    try {
      await axios.post(`${API_URL}/auth/register`, {
        name,
        email,
        password,
        user_type: userType
      })
      setSuccess(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '420px', margin: '0 auto' }}>
        <h2>Create Account</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {success ? (
          <>
            <p>Account created. You can log in now.</p>
            <Link to="/login">Go to login</Link>
          </>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
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
            <input
              type="password"
              placeholder="Confirm password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            <select value={userType} onChange={(e) => setUserType(e.target.value)}>
              <option value="caregiver">Caregiver</option>
              <option value="staff">Staff</option>
            </select>
            <button type="submit" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}
        {!success && (
          <p style={{ marginTop: '16px', fontSize: '14px' }}>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        )}
      </div>
    </div>
  )
}
