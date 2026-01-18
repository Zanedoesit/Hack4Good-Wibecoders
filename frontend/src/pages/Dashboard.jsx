import { useState, useEffect } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

export default function Dashboard({ token }) {
  const [signups, setSignups] = useState([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  useEffect(() => {
    let isMounted = true
    const fetch = async () => {
      try {
        const res = await axios.get(`${API_URL}/dashboard/signups`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        if (isMounted) {
          setSignups(res.data)
          setLoading(false)
          setLastUpdated(new Date())
        }
      } catch (err) {
        console.error(err)
        if (isMounted) setLoading(false)
      }
    }
    fetch()
    const intervalId = setInterval(fetch, 15000)
    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [token])

  if (loading) return <div className="container"><p>Loading...</p></div>

  return (
    <div className="container">
      <h2>Staff Dashboard - All Signups</h2>
      {lastUpdated && (
        <p style={{ color: '#666', marginBottom: '12px' }}>
          Last updated: {lastUpdated.toLocaleTimeString()}
        </p>
      )}
      {signups.length === 0 ? (
        <p>No signups yet</p>
      ) : (
        signups.map(activity => (
          <div key={activity.activity_id} className="card">
            <h3>{activity.title}</h3>
            <p><strong>Date:</strong> {activity.date} at {activity.time}</p>
            <p><strong>Total Signups:</strong> {activity.signup_count} / {activity.capacity}</p>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
              {activity.capacity - activity.signup_count > 0 ? (
                <span className="badge badge-open">Open</span>
              ) : (
                <span className="badge badge-full">Full</span>
              )}
              <span className="badge badge-muted">
                {activity.capacity - activity.signup_count} spots left
              </span>
            </div>
            <div className="progress" style={{ marginBottom: '12px' }}>
              <div
                className="progress-bar"
                style={{
                  width: `${Math.min(100, Math.round((activity.signup_count / Math.max(activity.capacity, 1)) * 100))}%`
                }}
              />
            </div>
            <h4>Registered:</h4>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Individual</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Caregiver</th>
                  <th style={{ textAlign: 'left', padding: '8px' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {activity.individuals && activity.individuals.map((ind, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                    <td style={{ padding: '8px' }}>{ind.individual_name}</td>
                    <td style={{ padding: '8px' }}>{ind.caregiver_name}</td>
                    <td style={{ padding: '8px' }}>{ind.caregiver_email}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
