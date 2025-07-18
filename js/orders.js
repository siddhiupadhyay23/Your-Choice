// Function to fetch user's orders
async function fetchOrders() {
    try {
        const response = await fetch('/api/orders');
        
        if (!response.ok) {
            throw new Error('Failed to fetch orders');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching orders:', error);
        return [];
    }
}

// Function to fetch a specific order
async function fetchOrder(orderId) {
    try {
        const response = await fetch(`/api/orders/${orderId}`);
        
        if (!response.ok) {
            throw new Error('Failed to fetch order');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching order:', error);
        throw error;
    }
}

// Function to create a new order
async function createOrder(orderData) {
    try {
        const response = await fetch('/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(orderData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create order');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating order:', error);
        throw error;
    }
}

// Function to display orders in the UI
function displayOrders(orders, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (orders.length === 0) {
        container.innerHTML = '<p>No orders found</p>';
        return;
    }
    
    orders.forEach(order => {
        const orderElement = document.createElement('div');
        orderElement.classList.add('order-card');
        
        // Format the date
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        
        // Get the status class
        const statusClass = getStatusClass(order.status);
        
        orderElement.innerHTML = `
            <div class="order-header">
                <h3>Order #${order._id.substring(0, 8)}</h3>
                <span class="order-date">${orderDate}</span>
            </div>
            <div class="order-details">
                <p class="order-status ${statusClass}">${capitalizeFirstLetter(order.status)}</p>
                <p class="order-total">Total: ₹${order.totalAmount}</p>
            </div>
            <button class="track-order-btn" data-id="${order._id}">Track Order</button>
        `;
        
        container.appendChild(orderElement);
    });
    
    // Add event listeners to the track buttons
    document.querySelectorAll('.track-order-btn').forEach(button => {
        button.addEventListener('click', () => {
            const orderId = button.dataset.id;
            window.location.href = `/track-order.html?orderId=${orderId}`;
        });
    });
}

// Function to display order tracking details
async function displayOrderTracking(orderId, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    try {
        const order = await fetchOrder(orderId);
        
        // Format the date
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        
        // Create the tracking steps based on status
        const trackingSteps = createTrackingSteps(order.status);
        
        container.innerHTML = `
            <div class="order-tracking-header">
                <h2>Order #${order._id.substring(0, 8)}</h2>
                <p>Placed on: ${orderDate}</p>
            </div>
            <div class="order-tracking-status">
                <h3>Current Status: ${capitalizeFirstLetter(order.status)}</h3>
                <div class="tracking-progress">
                    ${trackingSteps}
                </div>
            </div>
            <div class="order-details">
                <h3>Order Details</h3>
                <p>Delivery Address: ${order.deliveryAddress}</p>
                <p>Payment Method: ${order.paymentMethod}</p>
                <p>Total Amount: ₹${order.totalAmount}</p>
            </div>
        `;
    } catch (error) {
        container.innerHTML = `<p>Error loading order tracking: ${error.message}</p>`;
    }
}

// Function to create tracking steps HTML based on order status
function createTrackingSteps(status) {
    const steps = [
        { name: 'Order Placed', status: 'completed' },
        { name: 'Processing', status: status === 'pending' ? 'current' : (status === 'cancelled' ? 'cancelled' : 'completed') },
        { name: 'Shipped', status: status === 'processing' ? 'current' : (status === 'cancelled' || status === 'pending' ? 'pending' : 'completed') },
        { name: 'Delivered', status: status === 'shipped' ? 'current' : (status === 'delivered' ? 'completed' : 'pending') }
    ];
    
    if (status === 'cancelled') {
        steps.push({ name: 'Cancelled', status: 'cancelled' });
    }
    
    return steps.map(step => `
        <div class="tracking-step ${step.status}">
            <div class="step-indicator"></div>
            <div class="step-name">${step.name}</div>
        </div>
    `).join('<div class="tracking-line"></div>');
}

// Function to get the CSS class for an order status
function getStatusClass(status) {
    switch (status) {
        case 'pending':
            return 'status-pending';
        case 'processing':
            return 'status-processing';
        case 'shipped':
            return 'status-shipped';
        case 'delivered':
            return 'status-delivered';
        case 'cancelled':
            return 'status-cancelled';
        default:
            return '';
    }
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Function to create an order from the cart
async function createOrderFromCart(deliveryAddress, paymentMethod) {
    try {
        // Get the cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            throw new Error('Your cart is empty');
        }
        
        // Calculate total amount
        const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
        
        // Format the items for the order
        const items = cart.map(item => ({
            product: item.id,
            quantity: item.quantity
        }));
        
        // Create the order
        const orderData = {
            items,
            totalAmount,
            deliveryAddress,
            paymentMethod
        };
        
        const newOrder = await createOrder(orderData);
        
        // Clear the cart after successful order
        localStorage.removeItem('cart');
        
        return newOrder;
    } catch (error) {
        console.error('Error creating order from cart:', error);
        throw error;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // If we're on the orders page, fetch and display orders
    const ordersList = document.getElementById('orders-list');
    if (ordersList) {
        fetchOrders().then(orders => {
            displayOrders(orders, 'orders-list');
        });
    }
    
    // If we're on the order tracking page, display the tracking info
    const orderTracking = document.getElementById('order-tracking');
    if (orderTracking) {
        const urlParams = new URLSearchParams(window.location.search);
        const orderId = urlParams.get('orderId');
        
        if (orderId) {
            displayOrderTracking(orderId, 'order-tracking');
        } else {
            orderTracking.innerHTML = '<p>No order ID provided</p>';
        }
    }
    
    // If there's a checkout form, set up the form submission
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const deliveryAddress = document.getElementById('delivery-address').value;
            const paymentMethod = document.getElementById('payment-method').value;
            
            try {
                const order = await createOrderFromCart(deliveryAddress, paymentMethod);
                alert('Order placed successfully!');
                window.location.href = `/track-order.html?orderId=${order._id}`;
            } catch (error) {
                alert(`Failed to place order: ${error.message}`);
            }
        });
    }
});