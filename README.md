# Inventory & Order Management System

A simplified full-stack app for managing **products, customers, and orders**
with automatic inventory tracking.

- **Backend:** Python + [FastAPI](https://fastapi.tiangolo.com/)
- **Frontend:** React (built with Vite, served by nginx)
- **Database:** PostgreSQL
- **Everything runs with one command** via Docker Compose.

---

## What it does (business rules)

| Rule | How it's enforced |
|------|-------------------|
| Product **SKU** must be unique | Database `unique` constraint + a friendly pre-check |
| Customer **email** must be unique | Database `unique` constraint + a friendly pre-check |
| Orders **validate inventory** | Order is rejected if any product lacks enough stock |
| **Stock auto-reduces** when an order is placed | Stock is decremented as part of the same operation |
| Orders are **all-or-nothing** | If anything fails, the whole order is discarded (no partial stock changes) |

---

## How the pieces fit together

```
Browser ──▶ React frontend (port 3000) ──▶ FastAPI backend (port 8000) ──▶ PostgreSQL (port 5432)
            the UI you click               the rules & logic               where data lives
```

Docker Compose runs all three as connected containers on a private network.

---

## Project layout

```
assesments/
├── docker-compose.yml      # defines & connects all 3 services
├── .env.example            # template for configuration (copy to .env)
├── .env                    # local config values (git-ignored)
│
├── backend/                # FastAPI application
│   ├── Dockerfile
│   ├── requirements.txt    # Python libraries
│   └── app/
│       ├── main.py         # app entry point (startup, CORS, routers)
│       ├── database.py     # PostgreSQL connection setup
│       ├── models.py       # database tables (Product, Customer, Order, OrderItem)
│       ├── schemas.py      # request/response validation
│       └── routers/
│           ├── products.py
│           ├── customers.py
│           └── orders.py   # <- the inventory/stock business logic lives here
│
└── frontend/               # React application
    ├── Dockerfile          # builds React, serves with nginx
    ├── nginx.conf          # serves the app + proxies /api to the backend
    └── src/
        ├── App.jsx         # tab navigation
        ├── api.js          # all calls to the backend
        └── components/     # Products / Customers / Orders screens
```

---

## Running it locally

You only need **Docker** installed. Then:

```bash
# 1. Copy the config template and (optionally) edit the password
cp .env.example .env

# 2. Build and start all three services
docker-compose up --build

#    (use `docker compose up --build` if you have the newer Docker CLI)
```

Then open:

| URL | What it is |
|-----|------------|
| http://localhost:3000 | **The app** (React UI) |
| http://localhost:8000/docs | **Interactive API docs** — try every endpoint in the browser |
| http://localhost:8000 | API health check |

To stop it:

```bash
docker-compose down          # stop containers (keeps your data)
docker-compose down -v       # stop AND wipe the database (fresh start)
```

---

## Configuration (no hardcoded credentials)

All settings come from environment variables, defined in `.env`:

| Variable | Purpose |
|----------|---------|
| `POSTGRES_USER` | Database username |
| `POSTGRES_PASSWORD` | Database password |
| `POSTGRES_DB` | Database name |
| `CORS_ORIGINS` | Which frontend URLs may call the backend |

The real `.env` file is git-ignored so secrets are never committed.
`docker-compose.yml` reads these values via `${...}` — no passwords are
written in the code.

---

## API reference

| Method | Path | Description |
|--------|------|-------------|
| GET | `/products` | List products |
| POST | `/products` | Create a product (unique SKU) |
| PUT | `/products/{id}` | Update a product |
| DELETE | `/products/{id}` | Delete a product |
| GET | `/customers` | List customers |
| POST | `/customers` | Create a customer (unique email) |
| DELETE | `/customers/{id}` | Delete a customer |
| GET | `/orders` | List orders |
| POST | `/orders` | Place an order (validates & reduces stock) |

The easiest way to explore these is the auto-generated docs at
**http://localhost:8000/docs**.

---

## Quick test from the command line

```bash
# create a product
curl -X POST http://localhost:8000/products -H "Content-Type: application/json" \
  -d '{"sku":"SKU-001","name":"Wireless Mouse","price":19.99,"stock":10}'

# create a customer
curl -X POST http://localhost:8000/customers -H "Content-Type: application/json" \
  -d '{"name":"Alice","email":"alice@example.com"}'

# place an order (reduces stock from 10 to 8)
curl -X POST http://localhost:8000/orders -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":2}]}'

# this one is rejected — not enough stock
curl -X POST http://localhost:8000/orders -H "Content-Type: application/json" \
  -d '{"customer_id":1,"items":[{"product_id":1,"quantity":999}]}'
```
