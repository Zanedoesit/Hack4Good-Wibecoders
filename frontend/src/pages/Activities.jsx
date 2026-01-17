import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function Activities({ token, userType }) {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const res = await axios.get(`${API_URL}/activities`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setActivities(res.data)
        setLoading(false)
      } catch (err) {
        console.error(err)
        setLoading(false)
      }
    }
    fetchActivities()
  }, [token])

  if (loading) return <div className="container"><p>Loading activities...</p></div>

  return (
    <div className="container">
      <h2>Upcoming Activities</h2>
      {activities.length === 0 ? (
        <p>No activities available</p>
      ) : (
        activities.map(activity => (
          <div key={activity.id} className="card">
            <h3>{activity.title}</h3>
            <p>{activity.description}</p>
            <p><strong>Date:</strong> {activity.date} at {activity.time}</p>
            <p><strong>Location:</strong> {activity.location}</p>
            <p><strong>Spots Available:</strong> {activity.spots_left} / {activity.capacity}</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              {activity.spots_left > 0 ? (
                <span className="badge badge-open">Open</span>
              ) : (
                <span className="badge badge-full">Full</span>
              )}
              {activity.caregiver_signup_count > 0 && (
                <span className="badge badge-muted">Already registered</span>
              )}
            </div>
            <div className="progress">
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(100, Math.round((activity.signup_count / Math.max(activity.capacity, 1)) * 100))}%`
                }}
              />
            </div>
            {userType === 'caregiver' && (
              <button
                onClick={() => navigate(`/signup/${activity.id}`)}
                disabled={activity.spots_left <= 0}
                style={{ marginTop: '12px' }}
              >
                {activity.spots_left <= 0 ? 'Full' : 'Register'}
              </button>
            )}
          </div>
        ))
      )}
    </div>
  )
}
