// Datos de ejemplo (en una aplicación real, estos vendrían de una API)
const products = [
    {
        id: 1,
        name: "Perfume Floral",
        price: 49.99,
        image: "https://via.placeholder.com/200x200?text=Perfume+Floral"
    },
    {
        id: 2,
        name: "Crema Hidratante",
        price: 29.99,
        image: "https://via.placeholder.com/200x200?text=Crema+Hidratante"
    },
    {
        id: 3,
        name: "Máscara de Pestañas",
        price: 19.99,
        image: "https://via.placeholder.com/200x200?text=Mascara"
    }
];

// Estado del carrito
let cart = [];

// Elementos del DOM
const productsContainer = document.getElementById('products');
const cartButton = document.getElementById('cartButton');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');
const cartItems = document.getElementById('cartItems');
const cartTotal = document.getElementById('cartTotal');

// Mostrar productos
function displayProducts() {
    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <p class="product-price">$${product.price}</p>
                <button class="btn" onclick="addToCart(${product.id})">Agregar al Carrito</button>
            </div>
        </div>
    `).join('');
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    updateCartButton();
    updateCartModal();
}

// Actualizar botón del carrito
function updateCartButton() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartButton.textContent = `Carrito (${totalItems})`;
}

// Actualizar modal del carrito
function updateCartModal() {
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <h4>${item.name}</h4>
            <p>Cantidad: ${item.quantity}</p>
            <p>Precio: $${(item.price * item.quantity).toFixed(2)}</p>
            <button class="btn" onclick="removeFromCart(${item.id})">Eliminar</button>
        </div>
    `).join('');

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = total.toFixed(2);
}

// Eliminar del carrito
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartButton();
    updateCartModal();
}

// Event Listeners
cartButton.addEventListener('click', () => {
    cartModal.style.display = 'block';
});

closeCart.addEventListener('click', () => {
    cartModal.style.display = 'none';
});

window.addEventListener('click', (event) => {
    if (event.target === cartModal) {
        cartModal.style.display = 'none';
    }
});

// Inicializar la tienda
displayProducts();
