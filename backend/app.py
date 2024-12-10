from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.security import OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import httpx
import os
from dotenv import load_dotenv
import json
import requests
from bs4 import BeautifulSoup

# Cargar variables de entorno
load_dotenv()

app = FastAPI()

# Configurar CORS
origins = [
    "http://localhost:5000",
    "http://127.0.0.1:5000",
    "http://localhost:3000",
    "https://belcorp-shop-web-ed259.web.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class BelcorpService:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def login(self):
        # Implementar si es necesario
        pass

    def get_products(self, category=None, page=1):
        # URLs base para cada marca
        brand_urls = {
            'esika': 'https://www.esika.com/pe/',
            'lbel': 'https://www.lbel.com/pe/',
            'cyzone': 'https://www.cyzone.com/pe/'
        }
        
        all_products = []
        for brand, url in brand_urls.items():
            try:
                response = self.session.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    products = soup.find_all('div', class_='product')
                    
                    for product in products:
                        name = product.find('h2', class_='product-name')
                        price = product.find('span', class_='price')
                        if name and price:
                            all_products.append({
                                'name': name.text.strip(),
                                'price': price.text.strip(),
                                'brand': brand
                            })
            except Exception as e:
                print(f"Error fetching products for {brand}: {str(e)}")
                
        return all_products

    def get_categories(self):
        # URLs base para cada marca
        brand_urls = {
            'esika': 'https://www.esika.com/pe/',
            'lbel': 'https://www.lbel.com/pe/',
            'cyzone': 'https://www.cyzone.com/pe/'
        }
        
        all_categories = []
        for brand, url in brand_urls.items():
            try:
                response = self.session.get(url)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.text, 'html.parser')
                    categories = soup.find_all('li', class_='category')
                    
                    for category in categories:
                        name = category.find('a')
                        if name:
                            all_categories.append({
                                'name': name.text.strip(),
                                'brand': brand
                            })
            except Exception as e:
                print(f"Error fetching categories for {brand}: {str(e)}")
                
        return all_categories

belcorp_service = BelcorpService()

# Rutas de la API
@app.get("/")
async def root():
    return {"message": "Bienvenido a la API de Belcorp Shop"}

@app.get("/api/products")
async def get_products(request: Request):
    try:
        # Obtener parámetros de consulta
        params = dict(request.query_params)
        category = params.get('category')
        page = int(params.get('page', 1))
        
        # Obtener productos
        products = belcorp_service.get_products(category, page)
        
        return {
            "status": "success",
            "data": {
                "products": products,
                "pagination": {
                    "current_page": page,
                    "total_pages": 1,  # Esto debería calcularse basado en el total de productos
                    "total_items": len(products)
                }
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/categories")
async def get_categories(request: Request):
    try:
        # Obtener categorías
        categories = belcorp_service.get_categories()
        
        return {
            "status": "success",
            "data": {
                "categories": categories
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/token")
async def get_token():
    return {"token": "sample_token"}

@app.post("/login")
async def login():
    return {"message": "Login successful"}

@app.get("/belcorp/products")
async def get_belcorp_products(category: str = None, page: int = 1):
    products = belcorp_service.get_products(category, page)
    return {"products": products}

@app.get("/belcorp/categories")
async def get_belcorp_categories():
    categories = belcorp_service.get_categories()
    return {"categories": categories}

# Middleware para logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Request path: {request.url.path}")
    response = await call_next(request)
    return response
