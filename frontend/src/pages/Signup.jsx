import { useState, useEffect } from 'react'
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function Signup({ token }) {
  const { id } = useParams()
  const [activity, setActivity] = useState(null)
  const [individuals, setIndividuals] = useState([])
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const actRes = await axios.get(`${API_URL}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const act = actRes.data.find(a => a.id === parseInt(id))
        setActivity(act)

        // Mock individuals - in real app, fetch from backend
        setIndividuals([
          { id: 1, name: 'John (Your Care Recipient)' },
          { id: 2, name: 'Jane (Your Care Recipient)' },
          { id: 3, name: 'Bob (Your Care Recipient)' }
        ])
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
    fetch()
  }, [id, token])

  const handleToggle = (ind_id) => {
    setSelected(prev =>
      prev.includes(ind_id) ? prev.filter(x => x !== ind_id) : [...prev, ind_id]
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) {
      alert('Select at least one person')
      return
    }
    setSubmitting(true)
    try {
      await axios.post(
        `${API_URL}/signups/bulk`,
        { activity_id: parseInt(id), individual_ids: selected },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      alert('Successfully registered!')
      navigate('/activities')
    } catch (err) {
      alert(err.response?.data?.error || 'Signup failed')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container"><p>Loading...</p></div>
  if (!activity) return <div className="container"><p>Activity not found</p></div>

  return (
    <div className="container">
      <div className="card">
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>
        <p><strong>Date:</strong> {activity.date} at {activity.time}</p>
        <p><strong>Location:</strong> {activity.location}</p>
      </div>

      <div className="card">
        <h3>Select people to register:</h3>
        {individuals.map(ind => (
          <label key={ind.id} style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
            <input
              type="checkbox"
              checked={selected.includes(ind.id)}
              onChange={() => handleToggle(ind.id)}
              style={{ width: 'auto', marginRight: '8px' }}
            />
            {ind.name}
          </label>
        ))}
        <button onClick={handleSubmit} disabled={submitting} style={{ marginTop: '16px' }}>
          {submitting ? 'Registering...' : 'Register Selected'}
        </button>
      </div>
    </div>
  )
}