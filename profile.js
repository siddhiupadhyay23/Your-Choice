document.addEventListener('DOMContentLoaded', async () => {
    const profileContainer = document.getElementById('profile-container');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Check if user is logged in and fetch profile data
    try {
        const response = await fetch('/api/profile');
        
        if (!response.ok) {
            // If not authenticated, redirect to login page
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to fetch profile');
        }
        
        const userData = await response.json();
        
        // Display user data
        if (profileContainer) {
            profileContainer.innerHTML = `
                <div class="profile-header">
                    <h2>Welcome, ${userData.fullName}</h2>
                    <p>${userData.email}</p>
                </div>
                <div class="profile-details">
                    <div class="profile-section">
                        <h3>Account Information</h3>
                        <p><strong>Member since:</strong> ${new Date(userData.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        }
        
    } catch (error) {
        console.error('Error fetching profile:', error);
    }
    
    // Handle logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                const response = await fetch('/api/logout');
                if (response.ok) {
                    window.location.href = '/login.html';
                }
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});
