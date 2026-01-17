import { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function CreateActivity({ token }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [location, setLocation] = useState('')
  const [capacity, setCapacity] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await axios.post(
        `${API_URL}/activities`,
        {
          title,
          description,
          date,
          time,
          location,
          capacity: capacity ? parseInt(capacity, 10) : null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      navigate('/activities')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create activity')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <div className="card" style={{ maxWidth: '560px' }}>
        <h2>Create Activity</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="3"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            required
          />
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          <input
            type="number"
            placeholder="Capacity"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            min="0"
            required
          />
          <button type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Activity'}
          </button>
        </form>
      </div>
    </div>
  )
}
