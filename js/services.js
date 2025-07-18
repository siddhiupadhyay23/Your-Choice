// Function to fetch services from the API
async function fetchServices(category = '') {
    try {
        const url = category ? `/api/services?category=${category}` : '/api/services';
        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('Failed to fetch services');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching services:', error);
        return [];
    }
}

// Function to display services in the UI
function displayServices(services, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (services.length === 0) {
        container.innerHTML = '<p>No services found</p>';
        return;
    }
    
    services.forEach(service => {
        const serviceElement = document.createElement('div');
        serviceElement.classList.add('service-card');
        
        // Generate star rating HTML
        const stars = generateStarRating(service.rating);
        
        serviceElement.innerHTML = `
            <h3 class="service-title">${service.name}</h3>
            <p class="service-provider">Provider: ${service.provider}</p>
            <p class="service-description">${service.description}</p>
            <div class="service-rating">${stars}</div>
            <p class="service-price">₹${service.price}</p>
            <button class="book-btn" data-id="${service._id}">Book Service</button>
        `;
        
        container.appendChild(serviceElement);
    });
    
    // Add event listeners to the book buttons
    document.querySelectorAll('.book-btn').forEach(button => {
        button.addEventListener('click', bookService);
    });
}

// Function to generate star rating HTML
function generateStarRating(rating) {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
    
    let starsHtml = '';
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
        starsHtml += '<span class="star full">★</span>';
    }
    
    // Add half star if needed
    if (halfStar) {
        starsHtml += '<span class="star half">★</span>';
    }
    
    // Add empty stars
    for (let i = 0; i < emptyStars; i++) {
        starsHtml += '<span class="star empty">☆</span>';
    }
    
    return starsHtml;
}

// Function to book a service
async function bookService(event) {
    // Check if user is authenticated
    try {
        const authResponse = await fetch('/api/auth/status');
        const authData = await authResponse.json();
        
        if (!authData.isAuthenticated) {
            alert('Please log in to book a service');
            window.location.href = '/login.html';
            return;
        }
        
        const serviceId = event.target.dataset.id;
        
        // Redirect to booking page with service ID
        window.location.href = `/booking.html?serviceId=${serviceId}`;
    } catch (error) {
        console.error('Error checking authentication:', error);
        alert('An error occurred. Please try again.');
    }
}

// Initialize when the page loads
document.addEventListener('DOMContentLoaded', () => {
    // If we're on a service listing page, fetch and display services
    const serviceList = document.getElementById('service-list');
    if (serviceList) {
        // Get the category from the URL if available
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        
        fetchServices(category).then(services => {
            displayServices(services, 'service-list');
        });
    }
});