// Function to fetch products from the API
async function fetchProducts(category = '') {
    try {
        // First try to fetch from API
        const url = category ? `/api/products?category=${category}` : '/api/products';
        const response = await fetch(url);
        
        if (response.ok) {
            return await response.json();
        }
        
        // If API fails, return sample products
        console.warn('Using sample products as API request failed');
        return getSampleProducts(category);
    } catch (error) {
        console.error('Error fetching products:', error);
        // Return sample products as fallback
        return getSampleProducts(category);
    }
}

// Function to get sample products
function getSampleProducts(category = '') {
    const allProducts = [
        { _id: '1', name: 'Apple', price: 50, category: 'fruits', image: 'https://5.imimg.com/data5/AK/RA/MY-68428614/apple.jpg', description: 'Fresh red apples' },
        { _id: '2', name: 'Banana', price: 30, category: 'fruits', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTGHPr49bv2cMFJZ0z9WfjG3dqS8Wor6ghljw&s', description: 'Ripe yellow bananas' },
        { _id: '3', name: 'Carrot', price: 40, category: 'vegetables', image: 'https://orgfarm.store/cdn/shop/files/carrot-bunch.png?v=1721726918&width=1214', description: 'Fresh orange carrots' },
        { _id: '4', name: 'Tomato', price: 25, category: 'vegetables', image: 'https://m.economictimes.com/thumb/msid-95423731,width-1200,height-900,resizemode-4,imgsize-56196/tomatoes-canva.jpg', description: 'Ripe red tomatoes' },
        { _id: '5', name: 'Milk', price: 50, category: 'dairy', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdLYLrpcL-2TKZDY0eljDthboDPMytCCRgVg&s', description: 'Fresh cow milk' },
        { _id: '6', name: 'Rice', price: 60, category: 'grains', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQmux8yqAqpUbX6ZYbL_ElNcpLq1itEn7GuiQ&s', description: 'Premium basmati rice' },
        { _id: '7', name: 'Eggs', price: 70, category: 'dairy', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfiO7agvs5Xg3uKg-u0FIahDpYwib8Fj6giA&s', description: 'Farm fresh eggs' },
        { _id: '8', name: 'Paneer', price: 80, category: 'dairy', image: 'https://instamart-media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto/saqgxjo3qzaab8hdchqt', description: 'Fresh cottage cheese' }
    ];
    
    if (!category) {
        return allProducts;
    }
    
    return allProducts.filter(product => product.category === category);
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
    
    // Check if product already exists in cart
    const existingItemIndex = cart.findIndex(item => item.id === productId);
    
    if (existingItemIndex !== -1) {
        // If product exists, increase quantity
        cart[existingItemIndex].quantity += 1;
    } else {
        // If product doesn't exist, add it
        cart.push({
            id: productId,
            name,
            price,
            quantity: 1
        });
    }
    
    // Save the cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update the cart UI
    updateCartUI();
    
    // Show a notification
    const notification = document.createElement('div');
    notification.textContent = `${name} added to cart!`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background-color: #4CAF50; color: white; padding: 15px; border-radius: 5px; z-index: 1000; box-shadow: 0 2px 10px rgba(0,0,0,0.2);';
    document.body.appendChild(notification);
    
    // Remove notification after 2 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        setTimeout(() => notification.remove(), 500);
    }, 2000);
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