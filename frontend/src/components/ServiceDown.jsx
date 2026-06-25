// Shown when the backend can't be reached. The `retrying` flag lets the
// parent disable the button and show feedback while a re-check is in flight.
export default function ServiceDown({ onRetry, retrying }) {
  return (
    <div className="service-down">
      <div className="service-down-card">
        <div className="service-down-icon">📦</div>
        <h1 className="service-down-brand">Inventory &amp; Order Management</h1>
        <div className="service-down-status">⚠️ Server unavailable</div>
        <h2>We can’t reach the inventory server</h2>
        <p>
          The backend service is stopped or might not be reachable right now,
          so products, customers and orders can’t be loaded. This is usually
          temporary — the server may be restarting.
        </p>
        <p className="service-down-contact">
          If this keeps happening, please reach out to <strong>Fahad</strong> for help.
        </p>
        <button className="primary" onClick={onRetry} disabled={retrying}>
          {retrying && <span className="btn-spinner" />}
          {retrying ? 'Retrying…' : 'Retry connection'}
        </button>
      </div>
    </div>
  )
}
