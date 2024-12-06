from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime
from decimal import Decimal

class Product(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    price: Decimal
    image_url: Optional[str] = None
    category: str
    stock: int = 0
    sku: Optional[str] = None

class CartItem(BaseModel):
    product_id: str
    quantity: int = Field(gt=0)
    price: Decimal

class Cart(BaseModel):
    items: List[CartItem] = []
    total: Decimal = Decimal(0)

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    items: List[CartItem]
    notes: Optional[str] = None

class Order(OrderCreate):
    id: str
    created_at: datetime
    total: Decimal
    status: str = "pending"

class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
