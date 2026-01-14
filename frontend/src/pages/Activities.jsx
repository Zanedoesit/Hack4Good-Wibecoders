import { useState, useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const API_URL = 'http://localhost:5000'

export default function Activities({ token }) {
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
            <button onClick={() => navigate(`/signup/${activity.id}`)}>
              Register
            </button>
          </div>
        ))
      )}
    </div>
  )
}