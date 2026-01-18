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
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newAge, setNewAge] = useState('')
  const [newNeeds, setNewNeeds] = useState('')
  const [reviewMode, setReviewMode] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      try {
        const actRes = await axios.get(`${API_URL}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const act = actRes.data.find(a => a.id === parseInt(id))
        setActivity(act)

        const indRes = await axios.get(`${API_URL}/individuals`, {
          headers: { Authorization: `Bearer ${token}` },
          params: { activity_id: parseInt(id, 10) }
        })
        setIndividuals(indRes.data)
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

  const handleCreateIndividual = async (e) => {
    e.preventDefault()
    if (!newName.trim()) return
    setCreating(true)
    try {
      await axios.post(
        `${API_URL}/individuals`,
        { name: newName.trim(), age: newAge ? parseInt(newAge, 10) : null, special_needs: newNeeds.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setNewName('')
      setNewAge('')
      setNewNeeds('')
      const refreshed = await axios.get(`${API_URL}/individuals`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { activity_id: parseInt(id, 10) }
      })
      setIndividuals(refreshed.data)
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add individual')
    } finally {
      setCreating(false)
    }
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

  const selectedIndividuals = individuals.filter(ind => selected.includes(ind.id))

  return (
    <div className="container">
      <div className="card">
        <h2>{activity.title}</h2>
        <p>{activity.description}</p>
        <p><strong>Date:</strong> {activity.date} at {activity.time}</p>
        <p><strong>Location:</strong> {activity.location}</p>
        <p><strong>Status:</strong> {activity.spots_left > 0 ? 'Open' : 'Full'} ({activity.capacity - activity.spots_left}/{activity.capacity})</p>
      </div>

      <div className="card">
        <h3>{reviewMode ? 'Review selection' : 'Select people to register:'}</h3>
        {!reviewMode ? (
          <>
            {individuals.length === 0 ? (
              <p>No individuals yet. Add one below.</p>
            ) : (
              individuals.map(ind => (
                <label key={ind.id} style={{ display: 'flex', alignItems: 'center', margin: '12px 0' }}>
                  <input
                    type="checkbox"
                    checked={selected.includes(ind.id)}
                    onChange={() => handleToggle(ind.id)}
                    disabled={ind.already_registered}
                    style={{ width: 'auto', marginRight: '8px' }}
                  />
                  <span style={{ marginRight: '8px' }}>{ind.name}</span>
                  {ind.already_registered && <span className="badge badge-muted">Already registered</span>}
                </label>
              ))
            )}
            <button
              onClick={() => setReviewMode(true)}
              disabled={selected.length === 0 || activity.spots_left <= 0}
              style={{ marginTop: '16px' }}
            >
              {activity.spots_left <= 0 ? 'Full' : 'Review Selected'}
            </button>
          </>
        ) : (
          <>
            {selectedIndividuals.length === 0 ? (
              <p>No individuals selected.</p>
            ) : (
              selectedIndividuals.map(ind => (
                <div key={ind.id} style={{ padding: '8px 0', borderBottom: '1px solid #eee' }}>
                  <strong>{ind.name}</strong>
                  {ind.age !== null && ind.age !== undefined && (
                    <span style={{ marginLeft: '8px', color: '#666' }}>Age {ind.age}</span>
                  )}
                  {ind.special_needs && (
                    <div style={{ marginTop: '4px', color: '#555' }}>
                      <span className="badge badge-muted">Conditions</span> {ind.special_needs}
                    </div>
                  )}
                </div>
              ))
            )}
            <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
              <button type="button" onClick={() => setReviewMode(false)}>
                Back to selection
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting || activity.spots_left <= 0 || selectedIndividuals.length === 0}
              >
                {submitting ? 'Registering...' : activity.spots_left <= 0 ? 'Full' : 'Confirm Registration'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="card">
        <h3>Add a care recipient</h3>
        <form onSubmit={handleCreateIndividual}>
          <input
            type="text"
            placeholder="Full name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age (optional)"
            value={newAge}
            onChange={(e) => setNewAge(e.target.value)}
            min="0"
          />
          <textarea
            placeholder="Special needs (optional)"
            value={newNeeds}
            onChange={(e) => setNewNeeds(e.target.value)}
            rows="3"
          />
          <button type="submit" disabled={creating}>
            {creating ? 'Adding...' : 'Add individual'}
          </button>
        </form>
      </div>
    </div>
  )
}
