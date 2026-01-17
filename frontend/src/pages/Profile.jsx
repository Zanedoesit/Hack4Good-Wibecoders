import { useEffect, useState } from 'react'
import axios from 'axios'

const API_URL = 'http://localhost:5000'

export default function Profile({ token }) {
  const [individuals, setIndividuals] = useState([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [conditions, setConditions] = useState('')
  const [error, setError] = useState('')
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editAge, setEditAge] = useState('')
  const [editConditions, setEditConditions] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState(null)

  useEffect(() => {
    const fetchIndividuals = async () => {
      try {
        const res = await axios.get(`${API_URL}/individuals`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setIndividuals(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchIndividuals()
  }, [token])

  const handleAddIndividual = async (e) => {
    e.preventDefault()
    setError('')
    if (!name.trim()) return
    setAdding(true)
    try {
      const res = await axios.post(
        `${API_URL}/individuals`,
        { name: name.trim(), age: age ? parseInt(age, 10) : null, special_needs: conditions.trim() || null },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIndividuals(prev => [...prev, res.data])
      setName('')
      setAge('')
      setConditions('')
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add individual')
    } finally {
      setAdding(false)
    }
  }

  const startEdit = (ind) => {
    setEditingId(ind.id)
    setEditName(ind.name || '')
    setEditAge(ind.age !== null && ind.age !== undefined ? String(ind.age) : '')
    setEditConditions(ind.special_needs || '')
    setError('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
    setEditAge('')
    setEditConditions('')
  }

  const handleSaveEdit = async (e) => {
    e.preventDefault()
    if (!editName.trim()) return
    setSaving(true)
    try {
      const res = await axios.put(
        `${API_URL}/individuals/${editingId}`,
        {
          name: editName.trim(),
          age: editAge ? parseInt(editAge, 10) : null,
          special_needs: editConditions.trim() || null
        },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIndividuals(prev => prev.map(ind => (ind.id === editingId ? res.data : ind)))
      cancelEdit()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update individual')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this care recipient?')) return
    setDeletingId(id)
    setError('')
    try {
      await axios.delete(`${API_URL}/individuals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIndividuals(prev => prev.filter(ind => ind.id !== id))
      if (editingId === id) cancelEdit()
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete individual')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="container">
      <div className="card">
        <h2>Caregiver Profile</h2>
        <p style={{ marginTop: '8px' }}>Add up to five people under your care.</p>

        {loading ? (
          <p>Loading profiles...</p>
        ) : individuals.length === 0 ? (
          <p>No care recipients yet.</p>
        ) : (
          <div style={{ marginTop: '12px' }}>
            {individuals.map(ind => (
              <div key={ind.id} style={{ padding: '12px 0', borderBottom: '1px solid #eee' }}>
                {editingId === ind.id ? (
                  <form onSubmit={handleSaveEdit} style={{ display: 'grid', gap: '8px' }}>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                    <input
                      type="number"
                      value={editAge}
                      onChange={(e) => setEditAge(e.target.value)}
                      min="0"
                      placeholder="Age (optional)"
                    />
                    <textarea
                      value={editConditions}
                      onChange={(e) => setEditConditions(e.target.value)}
                      rows="3"
                      placeholder="Known conditions (optional)"
                    />
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save'}
                      </button>
                      <button type="button" onClick={cancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', alignItems: 'center' }}>
                      <div>
                        <strong>{ind.name}</strong>
                        {ind.age !== null && ind.age !== undefined && (
                          <span style={{ marginLeft: '8px', color: '#666' }}>Age {ind.age}</span>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="button" onClick={() => startEdit(ind)}>
                          Edit
                        </button>
                        <button type="button" onClick={() => handleDelete(ind.id)} disabled={deletingId === ind.id}>
                          {deletingId === ind.id ? 'Removing...' : 'Remove'}
                        </button>
                      </div>
                    </div>
                    {ind.special_needs && (
                      <div style={{ marginTop: '4px', color: '#555' }}>
                        <span className="badge badge-muted">Conditions</span> {ind.special_needs}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddIndividual} style={{ marginTop: '16px' }}>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <input
            type="number"
            placeholder="Age (optional)"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            min="0"
          />
          <textarea
            placeholder="Known conditions (optional)"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
            rows="3"
          />
          <button type="submit" disabled={adding || individuals.length >= 5}>
            {individuals.length >= 5 ? 'Limit reached' : adding ? 'Adding...' : 'Add care recipient'}
          </button>
        </form>
      </div>
    </div>
  )
}
