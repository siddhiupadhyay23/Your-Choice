// Function to fetch products from the API
async function fetchProducts(category = '') {
    try {
        const url = category ? `/api/products?category=${category}` : '/api/products';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch products');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching products:', error);
        return [];
    }
}

// Function to display products in the UI
function displayProducts(products, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (products.length === 0) {
        container.innerHTML = '<p>No products found</p>';
        return;
    }
    
    products.forEach(product => {
        const productElement = document.createElement('div');
        productElement.classList.add('product');
        productElement.dataset.id = product._id;
        productElement.dataset.name = product.name;
        productElement.dataset.price = product.price;
        
        productElement.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">₹${product.price}</p>
            <button class="add-btn" data-id="${product._id}">Add to Cart</button>
        `;
        
        container.appendChild(productElement);
    });
    
    // Add event listeners to the add buttons
    document.querySelectorAll('.add-btn').forEach(button => {
        button.addEventListener('click', addToCart);
    });
}

// Function to add a product to the cart
function addToCart(event) {
    const productId = event.target.dataset.id;
    const product = document.querySelector(`.product[data-id="${productId}"]`);
    
    if (!product) return;
    
    const name = product.dataset.name;
    const price = parseInt(product.dataset.price, 10);
    
    // Get the cart from localStorage or initialize an empty array
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Add the product to the cart
    cart.push({
        id: productId,
        name,
        price,
        quantity: 1
    });
    
    // Save the cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart UI
    updateCartUI();
    
    // Show a notification
    alert(`${name} added to cart!`);
}

// Function to update the cart UI
function updateCartUI() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    cartItems.innerHTML = '';
    let total = 0;
    
    cart.forEach((item, index) => {
        const cartItem = document.createElement('li');
        cartItem.innerHTML = `
            ${item.name} - ₹${item.price} x ${item.quantity} 
            <button class="remove-btn" data-index="${index}">Remove</button>
        `;
        
        cartItems.appendChild(cartItem);
        
        total += item.price * item.quantity;
    });
    
    // Update the cart total
    const cartTotal = document.getElementById('cart-total');
    if (cartTotal) {
        cartTotal.textContent = total;
    }
    
    // Add remove functionality
    document.querySelectorAll('.remove-btn').forEach(button => {
        button.addEventListener('click', removeFromCart);
    });
}

// Function to remove an item from the cart
function removeFromCart(event) {
    const index = event.target.dataset.index;
    
    // Get the cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Remove the item from the cart
    cart.splice(index, 1);
    
    // Save the updated cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart UI
    updateCartUI();
}

// Initialize the cart UI when the page loads
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    
    // If we're on a product listing page, fetch and display products
    const productList = document.getElementById('product-list');
    if (productList) {
        // Get the category from the URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        fetchProducts(category).then(products => {
            displayProducts(products, 'product-list');
        });
    }
    
    // If there's a search bar, set up the search functionality
    const searchBar = document.getElementById('search-bar');
    if (searchBar) {
        searchBar.addEventListener('input', async () => {
            const query = searchBar.value.toLowerCase();
            const products = await fetchProducts();
            
            const filteredProducts = products.filter(product => 
                product.name.toLowerCase().includes(query) || 
                product.description.toLowerCase().includes(query)
            );
            
            displayProducts(filteredProducts, 'product-list');
        });
    }
});