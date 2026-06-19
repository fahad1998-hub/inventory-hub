from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get("", response_model=list[schemas.OrderOut])
def list_orders(db: Session = Depends(get_db)):
    return db.query(models.Order).order_by(models.Order.id.desc()).all()


@router.get("/{order_id}", response_model=schemas.OrderOut)
def get_order(order_id: int, db: Session = Depends(get_db)):
    order = db.get(models.Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("", response_model=schemas.OrderOut, status_code=201)
def create_order(payload: schemas.OrderCreate, db: Session = Depends(get_db)):
    customer = db.get(models.Customer, payload.customer_id)
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")

    # Combine duplicate lines for the same product so the stock check is accurate.
    wanted: dict[int, int] = {}
    for item in payload.items:
        wanted[item.product_id] = wanted.get(item.product_id, 0) + item.quantity

    order = models.Order(customer_id=customer.id, total=0.0, status="placed")
    total = 0.0

    for product_id, quantity in wanted.items():
        product = db.get(models.Product, product_id)
        if not product:
            raise HTTPException(status_code=404, detail=f"Product {product_id} not found")

        if product.stock < quantity:
            raise HTTPException(
                status_code=409,
                detail=(
                    f"Insufficient stock for '{product.name}': "
                    f"requested {quantity}, only {product.stock} available"
                ),
            )

        product.stock -= quantity
        order.items.append(
            models.OrderItem(product_id=product.id, quantity=quantity, unit_price=product.price)
        )
        total += product.price * quantity

    order.total = round(total, 2)

    # Single commit: the order, its items, and the reduced stock are saved
    # together. Any error above raises before this, so nothing is changed.
    db.add(order)
    db.commit()
    db.refresh(order)
    return order
