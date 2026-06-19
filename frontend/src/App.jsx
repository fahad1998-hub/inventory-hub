import { useState } from 'react'
import Products from './components/Products.jsx'
import Customers from './components/Customers.jsx'
import Orders from './components/Orders.jsx'

export default function App() {
  const [tab, setTab] = useState('products')

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
