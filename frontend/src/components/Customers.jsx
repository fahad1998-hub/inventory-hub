import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '' })

  async function load() {
    setLoading(true)
    try {
      setCustomers(await api.customers.list())
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function change(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setSubmitting(true)
    setMessage(null)
    try {
      await api.customers.create({
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
      })
      setMessage({ type: 'success', text: 'Customer created.' })
      setForm({ name: '', email: '', phone: '' })
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setSubmitting(false)
    }
  }

  async function remove(id) {
    if (!confirm('Delete this customer?')) return
    try {
      await api.customers.remove(id)
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  return (
    <>
      <div className="card">
        <h2>Add customer</h2>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => change('name', e.target.value)} required />
            </div>
            <div>
              <label>Email (unique)</label>
              <input type="email" value={form.email} onChange={(e) => change('email', e.target.value)} required />
            </div>
            <div>
              <label>Phone</label>
              <input value={form.phone} onChange={(e) => change('phone', e.target.value)} />
            </div>
          </div>
          <button className="primary" type="submit" disabled={submitting}>
            {submitting && <span className="btn-spinner" />}
            {submitting ? 'Creating…' : 'Create customer'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Customers ({customers.length})</h2>
        {loading ? (
          <div className="loader"><span className="spinner" /> Loading customers…</div>
        ) : (
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th><th></th></tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone || '—'}</td>
                  <td><button className="danger" onClick={() => remove(c.id)}>Delete</button></td>
                </tr>
              ))}
              {customers.length === 0 && (
                <tr><td colSpan="4">No customers yet.</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </>
  )
}
