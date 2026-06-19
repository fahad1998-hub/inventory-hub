from datetime import datetime
from typing import List
from pydantic import BaseModel, EmailStr, Field, ConfigDict


class ProductCreate(BaseModel):
    sku: str = Field(min_length=1)
    name: str = Field(min_length=1)
    description: str = ""
    price: float = Field(ge=0)
    stock: int = Field(ge=0)


class ProductUpdate(BaseModel):
    name: str = Field(min_length=1)
    description: str = ""
    price: float = Field(ge=0)
    stock: int = Field(ge=0)


class ProductOut(BaseModel):
    id: int
    sku: str
    name: str
    description: str
    price: float
    stock: int
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class CustomerCreate(BaseModel):
    name: str = Field(min_length=1)
    email: EmailStr
    phone: str = ""


class CustomerOut(BaseModel):
    id: int
    name: str
    email: EmailStr
    phone: str
    created_at: datetime
    model_config = ConfigDict(from_attributes=True)


class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int = Field(gt=0)


class OrderCreate(BaseModel):
    customer_id: int
    items: List[OrderItemCreate] = Field(min_length=1)


class OrderItemOut(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    model_config = ConfigDict(from_attributes=True)


class OrderOut(BaseModel):
    id: int
    customer_id: int
    total: float
    status: str
    created_at: datetime
    items: List[OrderItemOut]
    model_config = ConfigDict(from_attributes=True)
