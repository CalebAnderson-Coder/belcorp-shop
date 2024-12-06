from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import timedelta, datetime
from .core.config import get_settings, Settings
from .core.security import create_access_token, get_current_user
from .services.belcorp_service import BelcorpService
from .services.whatsapp_service import WhatsAppService
from .models.models import (
    Product,
    CartItem,
    Cart,
    OrderCreate,
    Order,
    LoginRequest,
    LoginResponse
)
from typing import List
import logging
import uuid

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="Belcorp Shop API")
settings = get_settings()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Initialize services
belcorp_service = None
whatsapp_service = None

@app.on_event("startup")
async def startup_event():
    global belcorp_service, whatsapp_service
    if settings.BELCORP_USERNAME and settings.BELCORP_PASSWORD:
        belcorp_service = BelcorpService(
            username=settings.BELCORP_USERNAME,
            password=settings.BELCORP_PASSWORD
        )
    else:
        logger.warning("Belcorp credentials not configured!")
    
    whatsapp_service = WhatsAppService()

@app.get("/")
async def root():
    return {"message": "Welcome to Belcorp Shop API"}

@app.post("/api/token")
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    if not belcorp_service:
        raise HTTPException(status_code=500, detail="Belcorp service not configured")
    
    success = belcorp_service.login()
    if not success:
        raise HTTPException(
            status_code=401,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": form_data.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/api/products", response_model=List[Product])
async def get_products(
    category: str = None,
    page: int = 1,
    current_user: str = Depends(get_current_user)
):
    if not belcorp_service:
        raise HTTPException(status_code=500, detail="Belcorp service not configured")
    
    products = belcorp_service.get_catalog(category=category, page=page)
    return products

@app.get("/api/products/{product_id}", response_model=Product)
async def get_product(
    product_id: str,
    current_user: str = Depends(get_current_user)
):
    if not belcorp_service:
        raise HTTPException(status_code=500, detail="Belcorp service not configured")
    
    product = belcorp_service.get_product_details(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

@app.get("/api/categories")
async def get_categories(current_user: str = Depends(get_current_user)):
    if not belcorp_service:
        raise HTTPException(status_code=500, detail="Belcorp service not configured")
    
    categories = belcorp_service.get_categories()
    return categories

@app.post("/api/orders", response_model=Order)
async def create_order(
    order_create: OrderCreate,
    current_user: str = Depends(get_current_user)
):
    try:
        # Validar productos y calcular total
        total = 0
        for item in order_create.items:
            product = belcorp_service.get_product_details(item.product_id)
            if not product:
                raise HTTPException(
                    status_code=404,
                    detail=f"Product {item.product_id} not found"
                )
            total += item.price * item.quantity

        # Crear orden
        order = Order(
            id=str(uuid.uuid4()),
            created_at=datetime.utcnow(),
            total=total,
            **order_create.dict()
        )

        # Enviar notificación por WhatsApp
        if whatsapp_service:
            success = whatsapp_service.send_order_notification(order)
            if not success:
                logger.warning("Failed to send WhatsApp notification")

        return order

    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail="Error creating order")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
