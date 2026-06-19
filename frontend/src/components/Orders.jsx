import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [customers, setCustomers] = useState([])
  const [message, setMessage] = useState(null)
  const [loading, setLoading] = useState(true)
  const [placing, setPlacing] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [lines, setLines] = useState([{ product_id: '', quantity: 1 }])

  async function load() {
    setLoading(true)
    try {
      const [o, p, c] = await Promise.all([
        api.orders.list(),
        api.products.list(),
        api.customers.list(),
      ])
      setOrders(o); setProducts(p); setCustomers(c)
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  function changeLine(index, field, value) {
    setLines((prev) => prev.map((line, i) =>
      i === index ? { ...line, [field]: value } : line))
  }

  function addLine() {
    setLines((prev) => [...prev, { product_id: '', quantity: 1 }])
  }

  function removeLine(index) {
    setLines((prev) => prev.filter((_, i) => i !== index))
  }

  const productById = (id) => products.find((p) => p.id === Number(id))

  const estimatedTotal = lines.reduce((sum, line) => {
    const p = productById(line.product_id)
    return p ? sum + p.price * Number(line.quantity || 0) : sum
  }, 0)

  async function submit(e) {
    e.preventDefault()
    setPlacing(true)
    setMessage(null)
    try {
      await api.orders.create({
        customer_id: Number(customerId),
        items: lines
          .filter((l) => l.product_id)
          .map((l) => ({ product_id: Number(l.product_id), quantity: Number(l.quantity) })),
      })
      setMessage({ type: 'success', text: 'Order placed and stock updated.' })
      setCustomerId('')
      setLines([{ product_id: '', quantity: 1 }])
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    } finally {
      setPlacing(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loader"><span className="spinner" /> Loading…</div>
      </div>
    )
  }

  return (
    <>
      <div className="card">
        <h2>Place an order</h2>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}

        {customers.length === 0 || products.length === 0 ? (
          <p>You need at least one customer and one product first.</p>
        ) : (
          <form onSubmit={submit}>
            <div style={{ marginBottom: 16, maxWidth: 320 }}>
              <label>Customer</label>
              <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} required>
                <option value="">— choose a customer —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
                ))}
              </select>
            </div>

            <label>Items</label>
            {lines.map((line, i) => {
              const p = productById(line.product_id)
              return (
                <div className="order-line" key={i}>
                  <div>
                    <select value={line.product_id}
                            onChange={(e) => changeLine(i, 'product_id', e.target.value)} required>
                      <option value="">— choose a product —</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (in stock: {p.stock})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div style={{ maxWidth: 110 }}>
                    <input type="number" min="1" value={line.quantity}
                           onChange={(e) => changeLine(i, 'quantity', e.target.value)} required />
                  </div>
                  <div style={{ maxWidth: 90 }}>
                    {p ? `₹${(p.price * Number(line.quantity || 0)).toFixed(2)}` : ''}
                  </div>
                  {lines.length > 1 && (
                    <button type="button" className="link" onClick={() => removeLine(i)}>remove</button>
                  )}
                </div>
              )
            })}

            <button type="button" className="link" onClick={addLine}>+ add another item</button>
            <p><strong>Estimated total: ₹{estimatedTotal.toFixed(2)}</strong></p>
            <button className="primary" type="submit" disabled={placing}>
              {placing && <span className="btn-spinner" />}
              {placing ? 'Placing order…' : 'Place order'}
            </button>
          </form>
        )}
      </div>

      <div className="card">
        <h2>Orders ({orders.length})</h2>
        <table>
          <thead>
            <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Total</th><th>Status</th></tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const customer = customers.find((c) => c.id === o.customer_id)
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{customer ? customer.name : `#${o.customer_id}`}</td>
                  <td>{o.items.reduce((n, it) => n + it.quantity, 0)}</td>
                  <td>₹{o.total.toFixed(2)}</td>
                  <td>{o.status}</td>
                </tr>
              )
            })}
            {orders.length === 0 && (
              <tr><td colSpan="5">No orders yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
