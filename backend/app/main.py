import os
import time

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.exc import OperationalError

from .database import Base, engine
from . import models  # noqa: F401  (registers tables on Base)
from .routers import products, customers, orders

app = FastAPI(title="Inventory & Order Management API", version="1.0.0")

# Allow the React frontend (origins from env) to call this API.
allowed = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://localhost:5173")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.strip() for o in allowed.split(",")],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    # The DB container may need a few seconds before it accepts connections.
    for attempt in range(10):
        try:
            Base.metadata.create_all(bind=engine)
            print("Database is ready, tables created.")
            return
        except OperationalError:
            print(f"Database not ready yet (attempt {attempt + 1}/10), retrying...")
            time.sleep(2)
    raise RuntimeError("Could not connect to the database after several attempts.")


@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "message": "Inventory & Order Management API is running"}


app.include_router(products.router)
app.include_router(customers.router)
app.include_router(orders.router)
