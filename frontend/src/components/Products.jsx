import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Products() {
  const [products, setProducts] = useState([])
  const [message, setMessage] = useState(null)
  const [form, setForm] = useState({ sku: '', name: '', description: '', price: '', stock: '' })

  async function load() {
    try {
      setProducts(await api.products.list())
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  useEffect(() => { load() }, [])

  function change(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    try {
      await api.products.create({
        sku: form.sku.trim(),
        name: form.name.trim(),
        description: form.description.trim(),
        price: parseFloat(form.price),
        stock: parseInt(form.stock, 10),
      })
      setMessage({ type: 'success', text: 'Product created.' })
      setForm({ sku: '', name: '', description: '', price: '', stock: '' })
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  async function remove(id) {
    if (!confirm('Delete this product?')) return
    try {
      await api.products.remove(id)
      load()
    } catch (e) {
      setMessage({ type: 'error', text: e.message })
    }
  }

  return (
    <>
      <div className="card">
        <h2>Add product</h2>
        {message && <div className={`message ${message.type}`}>{message.text}</div>}
        <form onSubmit={submit}>
          <div className="form-grid">
            <div>
              <label>SKU (unique)</label>
              <input value={form.sku} onChange={(e) => change('sku', e.target.value)} required />
            </div>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => change('name', e.target.value)} required />
            </div>
            <div>
              <label>Description</label>
              <input value={form.description} onChange={(e) => change('description', e.target.value)} />
            </div>
            <div>
              <label>Price (₹)</label>
              <input type="number" step="0.01" min="0" value={form.price}
                     onChange={(e) => change('price', e.target.value)} required />
            </div>
            <div>
              <label>Stock</label>
              <input type="number" min="0" value={form.stock}
                     onChange={(e) => change('stock', e.target.value)} required />
            </div>
          </div>
          <button className="primary" type="submit">Create product</button>
        </form>
      </div>

      <div className="card">
        <h2>Products ({products.length})</h2>
        <table>
          <thead>
            <tr>
              <th>SKU</th><th>Name</th><th>Price</th><th>Stock</th><th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.sku}</td>
                <td>{p.name}</td>
                <td>₹{p.price.toFixed(2)}</td>
                <td className={p.stock <= 5 ? 'low-stock' : ''}>{p.stock}</td>
                <td><button className="danger" onClick={() => remove(p.id)}>Delete</button></td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan="5">No products yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
