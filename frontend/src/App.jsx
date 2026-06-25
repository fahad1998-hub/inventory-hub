import { useEffect, useState } from 'react'
import Products from './components/Products.jsx'
import Customers from './components/Customers.jsx'
import Orders from './components/Orders.jsx'
import ServiceDown from './components/ServiceDown.jsx'
import { api } from './api.js'

export default function App() {
  const [tab, setTab] = useState('products')
  // 'checking' on first load, then 'up' or 'down'.
  const [status, setStatus] = useState('checking')
  const [retrying, setRetrying] = useState(false)

  async function check({ manual = false } = {}) {
    if (manual) setRetrying(true)
    const ok = await api.health()
    setStatus(ok ? 'up' : 'down')
    if (manual) setRetrying(false)
  }

  // Check once on first load.
  useEffect(() => { check() }, [])

  // Only poll while the server is down — this lets the app recover on its own
  // once the backend comes back. When it's up, we stop pinging entirely.
  useEffect(() => {
    if (status !== 'down') return
    const id = setInterval(check, 15000)
    return () => clearInterval(id)
  }, [status])

  if (status === 'checking') {
    return (
      <main>
        <div className="loader"><span className="spinner" /> Connecting… please wait, it can take up to 50 seconds..</div>
      </main>
    )
  }

  if (status === 'down') {
    return <ServiceDown onRetry={() => check({ manual: true })} retrying={retrying} />
  }

  return (
    <>
      <header>
        <h1>Inventory &amp; Order Management</h1>
      </header>

      <nav>
        <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>
          Products
        </button>
        <button className={tab === 'customers' ? 'active' : ''} onClick={() => setTab('customers')}>
          Customers
        </button>
        <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>
          Orders
        </button>
      </nav>

      <main>
        {tab === 'products' && <Products />}
        {tab === 'customers' && <Customers />}
        {tab === 'orders' && <Orders />}
      </main>
    </>
  )
}
