// Function to fetch user's baskets
async function fetchBaskets() {
    try {
        const response = await fetch('/api/baskets');
        
        if (!response.ok) {
            throw new Error('Failed to fetch baskets');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching baskets:', error);
        return [];
    }
}

// Function to create a new basket
async function createBasket(basketData) {
    try {
        const response = await fetch('/api/baskets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(basketData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to create basket');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error creating basket:', error);
        throw error;
    }
}

// Function to update a basket
async function updateBasket(basketId, basketData) {
    try {
        const response = await fetch(`/api/baskets/${basketId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(basketData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update basket');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error updating basket:', error);
        throw error;
    }
}

// Function to display baskets in the UI
function displayBaskets(baskets, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (baskets.length === 0) {
        container.innerHTML = '<p>No saved baskets found. Create your first customized basket!</p>';
        return;
    }
    
    baskets.forEach(basket => {
        const basketElement = document.createElement('div');
        basketElement.classList.add('basket-card');
        
        // Calculate total price
        let totalPrice = 0;
        const itemsList = basket.items.map(item => {
            const itemPrice = item.product.price * item.quantity;
            totalPrice += itemPrice;
            return `<li>${item.product.name} x ${item.quantity} - ₹${itemPrice}</li>`;
        }).join('');
        
        basketElement.innerHTML = `
            <h3>${basket.name}</h3>
            <p>Frequency: ${basket.frequency}</p>
            <p>Status: ${basket.active ? 'Active' : 'Inactive'}</p>
            <div class="basket-items">
                <h4>Items:</h4>
                <ul>${itemsList}</ul>
            </div>
            <p class="basket-total">Total: ₹${totalPrice}</p>
            <div class="basket-actions">
                <button class="edit-basket-btn" data-id="${basket._id}">Edit</button>
                <button class="toggle-basket-btn" data-id="${basket._id}" data-active="${basket.active}">
                    ${basket.active ? 'Deactivate' : 'Activate'}
                </button>
                <button class="order-now-btn" data-id="${basket._id}">Order Now</button>
            </div>
        `;
        
        container.appendChild(basketElement);
    });
    
    // Add event listeners to the buttons
    document.querySelectorAll('.edit-basket-btn').forEach(button => {
        button.addEventListener('click', () => {
            const basketId = button.dataset.id;
            window.location.href = `/customize.html?basketId=${basketId}`;
        });
    });
    
    document.querySelectorAll('.toggle-basket-btn').forEach(button => {
        button.addEventListener('click', async () => {
            const basketId = button.dataset.id;
            const currentlyActive = button.dataset.active === 'true';
            
            try {
                await updateBasket(basketId, { active: !currentlyActive });
                // Refresh the baskets display
                const updatedBaskets = await fetchBaskets();
                displayBaskets(updatedBaskets, containerId);
            } catch (error) {
                alert(`Failed to update basket: ${error.message}`);
            }
        });
    });
    
    document.querySelectorAll('.order-now-btn').forEach(button => {
        button.addEventListener('click', () => {
            const basketId = button.dataset.id;
            window.location.href = `/payment.html?basketId=${basketId}`;
        });
    });
}

// Function to save the current cart as a basket
async function saveCartAsBasket(name, frequency) {
    try {
        // Get the cart from localStorage
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        if (cart.length === 0) {
            throw new Error('Your cart is empty');
        }
        
        // Format the items for the basket
        const items = cart.map(item => ({
            product: item.id,
            quantity: item.quantity
        }));
        
        // Create the basket
        const basketData = {
            name,
            items,
            frequency
        };
        
        const newBasket = await createBasket(basketData);
        return newBasket;
    } catch (error) {
        console.error('Error saving cart as basket:', error);
        throw error;
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // If we're on the baskets page, fetch and display baskets
    const basketsList = document.getElementById('baskets-list');
    if (basketsList) {
        fetchBaskets().then(baskets => {
            displayBaskets(baskets, 'baskets-list');
        });
    }
    
    // If there's a save basket form, set up the form submission
    const saveBasketForm = document.getElementById('save-basket-form');
    if (saveBasketForm) {
        saveBasketForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const name = document.getElementById('basket-name').value;
            const frequency = document.getElementById('basket-frequency').value;
            
            try {
                await saveCartAsBasket(name, frequency);
                alert('Basket saved successfully!');
                window.location.href = '/profile.html';
            } catch (error) {
                alert(`Failed to save basket: ${error.message}`);
            }
        });
    }
});