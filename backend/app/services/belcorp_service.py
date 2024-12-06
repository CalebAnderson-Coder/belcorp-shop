import requests
import json
import logging
from typing import Optional, Dict, List
from datetime import datetime
from bs4 import BeautifulSoup
import re

logger = logging.getLogger(__name__)

class BelcorpService:
    def __init__(self, username: str, password: str):
        self.base_url = "https://www.somosbelcorp.com"
        self.session = requests.Session()
        self.username = username
        self.password = password
        self._setup_session()

    def _setup_session(self):
        """Configurar la sesión con headers básicos"""
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9,es-US;q=0.8,es;q=0.7',
            'Content-Type': 'application/x-www-form-urlencoded'
        })

    def _check_auth(self) -> bool:
        """Verificar si la sesión está autenticada"""
        try:
            response = self.session.get(f"{self.base_url}/Inicio")
            return '.ASPXAUTH' in self.session.cookies and response.status_code == 200
        except Exception as e:
            logger.error(f"Error checking authentication: {str(e)}")
            return False

    def login(self) -> bool:
        """Login to Belcorp website"""
        try:
            # Get initial page to obtain session cookie
            initial_response = self.session.get(f"{self.base_url}/Login")
            if initial_response.status_code != 200:
                logger.error(f"Failed to get login page: {initial_response.status_code}")
                return False

            # Extract CSRF token if needed
            soup = BeautifulSoup(initial_response.text, 'html.parser')
            csrf_token = soup.find('input', {'name': '__RequestVerificationToken'})
            csrf_value = csrf_token['value'] if csrf_token else ''

            # Prepare login data
            login_data = {
                'returnUrl': '',
                'UsuarioExterno.Proveedor': '',
                'UsuarioExterno.IdAplicacion': '',
                'UsuarioExterno.Login': '',
                'UsuarioExterno.Nombres': '',
                'UsuarioExterno.Apellidos': '',
                'UsuarioExterno.FechaNacimiento': '',
                'UsuarioExterno.Correo': '',
                'UsuarioExterno.Genero': '',
                'UsuarioExterno.Ubicacion': '',
                'UsuarioExterno.LinkPerfil': '',
                'UsuarioExterno.FotoPerfil': '',
                'UsuarioExterno.Redireccionar': 'true',
                'hdeCodigoISO': 'CO',
                'PaisID': '4',
                'Salt': '2SXccYWpFDxepFgE+1kkQA==',
                'ClaveSecreta': 'nYHNy0VEf28pU1Pn62ifyg==',
                'Key': '8IBfm92u6Bq5Aevxcpykukuc7JPaZVyutWWmUqeZNsE=',
                'Iv': 'xLTp8isMN5WKWjLcqvmLrQ==',
                'CodigoISO': 'CO',
                'CodigoUsuario': self.username,
                '__RequestVerificationToken': csrf_value
            }

            # Perform login
            login_response = self.session.post(
                f"{self.base_url}/Login/Login",
                data=login_data,
                allow_redirects=True
            )

            # Check if login was successful
            return self._check_auth()

        except Exception as e:
            logger.error(f"Login failed: {str(e)}")
            return False

    def get_catalog(self, category: Optional[str] = None, page: int = 1) -> List[Dict]:
        """Obtener catálogo de productos"""
        try:
            if not self._check_auth():
                if not self.login():
                    logger.error("Failed to authenticate")
                    return []

            # Construir URL del catálogo
            catalog_url = f"{self.base_url}/Catalogo"
            if category:
                catalog_url += f"/Categoria/{category}"
            catalog_url += f"?pagina={page}"

            # Obtener página del catálogo
            response = self.session.get(catalog_url)
            if response.status_code != 200:
                logger.error(f"Failed to get catalog: {response.status_code}")
                return []

            # Parsear HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            products = []

            # Encontrar todos los productos en la página
            product_elements = soup.find_all('div', class_='producto')
            for element in product_elements:
                try:
                    # Extraer información del producto
                    product_id = element.get('data-id', '')
                    name = element.find('h3', class_='nombre').text.strip()
                    price_element = element.find('span', class_='precio')
                    price = self._extract_price(price_element.text) if price_element else 0
                    image = element.find('img')
                    image_url = image.get('src', '') if image else None
                    
                    products.append({
                        'id': product_id,
                        'name': name,
                        'price': price,
                        'image_url': image_url,
                        'category': category or 'general',
                        'stock': 100  # Default stock value
                    })
                except Exception as e:
                    logger.error(f"Error parsing product: {str(e)}")
                    continue

            return products

        except Exception as e:
            logger.error(f"Error getting catalog: {str(e)}")
            return []

    def get_product_details(self, product_id: str) -> Optional[Dict]:
        """Obtener detalles de un producto específico"""
        try:
            if not self._check_auth():
                if not self.login():
                    logger.error("Failed to authenticate")
                    return None

            # Obtener página de detalles del producto
            response = self.session.get(f"{self.base_url}/Producto/{product_id}")
            if response.status_code != 200:
                logger.error(f"Failed to get product details: {response.status_code}")
                return None

            # Parsear HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Extraer información detallada del producto
            name = soup.find('h1', class_='nombre-producto').text.strip()
            description = soup.find('div', class_='descripcion-producto')
            description_text = description.text.strip() if description else None
            price_element = soup.find('span', class_='precio-producto')
            price = self._extract_price(price_element.text) if price_element else 0
            image = soup.find('img', class_='imagen-producto')
            image_url = image.get('src', '') if image else None
            sku = soup.find('span', class_='sku-producto')
            sku_text = sku.text.strip() if sku else None

            return {
                'id': product_id,
                'name': name,
                'description': description_text,
                'price': price,
                'image_url': image_url,
                'category': 'general',  # Se puede mejorar extrayendo la categoría real
                'stock': 100,  # Default stock value
                'sku': sku_text
            }

        except Exception as e:
            logger.error(f"Error getting product details: {str(e)}")
            return None

    def get_categories(self) -> List[str]:
        """Obtener lista de categorías disponibles"""
        try:
            if not self._check_auth():
                if not self.login():
                    logger.error("Failed to authenticate")
                    return []

            # Obtener página principal del catálogo
            response = self.session.get(f"{self.base_url}/Catalogo")
            if response.status_code != 200:
                logger.error(f"Failed to get categories: {response.status_code}")
                return []

            # Parsear HTML
            soup = BeautifulSoup(response.text, 'html.parser')
            categories = []

            # Encontrar el menú de categorías
            category_menu = soup.find('ul', class_='menu-categorias')
            if category_menu:
                category_items = category_menu.find_all('li')
                for item in category_items:
                    link = item.find('a')
                    if link:
                        category_name = link.text.strip()
                        categories.append(category_name)

            return categories

        except Exception as e:
            logger.error(f"Error getting categories: {str(e)}")
            return []

    def _extract_price(self, price_text: str) -> float:
        """Extraer precio numérico de un texto"""
        try:
            # Eliminar símbolos de moneda y espacios
            clean_price = re.sub(r'[^\d.,]', '', price_text)
            # Convertir a formato numérico
            return float(clean_price.replace(',', '.'))
        except Exception:
            return 0.0
