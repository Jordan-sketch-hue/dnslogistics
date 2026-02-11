/**
 * Dashboard Management System
 * Connected to backend API to fetch and manage customer data
 * Shows shipments, inventory, status updates, and profile
 */

// API configuration
const API_URL = 'http://localhost:5000/api';

/**
 * Initialize dashboard on page load
 */
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeDashboard();
});

/**
 * Check if user is authenticated
 * Redirect to login if not
 */
function checkAuth() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'auth.html';
        return;
    }
}

/**
 * Get authorization header with JWT token
 */
function getAuthHeader() {
    const token = auth.getAccessToken();
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
}

/**
 * Initialize dashboard with user data
 * Load shipments, inventory, and metrics
 */
async function initializeDashboard() {
    const user = auth.getProfile();
    
    // Update user info in header
    document.getElementById('userName').textContent = user.companyName || user.firstName + ' ' + user.lastName;
    
    // Load dashboard data from backend
    await loadDashboardStats();
    await loadRecentShipments();
    await loadInventory();
    
    // Setup navigation
    setupNavigation();
}

/**
 * Setup navigation between dashboard sections
 */
function setupNavigation() {
    // Top nav items
    const navItems = document.querySelectorAll('[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.getAttribute('data-section');
            switchSection(section);
        });
    });
}

/**
 * Switch between dashboard sections
 */
function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.style.display = 'none');

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.style.display = 'block';
    }

    // Update nav active state
    const navItems = document.querySelectorAll('[data-section]');
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) activeNav.classList.add('active');
}

/**
 * Load dashboard statistics from backend API
 * Shows total shipments, delivered, in-transit, and revenue
 */
async function loadDashboardStats() {
    try {
        const user = auth.getProfile();
        const response = await fetch(`${API_URL}/customers/${user.id}/info`, {
            headers: getAuthHeader()
        });

        const data = await response.json();

        if (data.success) {
            // Update dashboard metrics
            document.getElementById('totalShipments').textContent = data.summary.totalShipments || '0';
            document.getElementById('deliveredShipments').textContent = data.summary.deliveredShipments || '0';
            document.getElementById('inTransitShipments').textContent = data.summary.activeShipments || '0';
            document.getElementById('totalSpent').textContent = '$' + (data.summary.totalRevenue || '0.00').toFixed(2);
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        document.getElementById('totalShipments').textContent = '0';
        document.getElementById('deliveredShipments').textContent = '0';
        document.getElementById('inTransitShipments').textContent = '0';
        document.getElementById('totalSpent').textContent = '$0.00';
    }
}

/**
 * Load recent shipments from backend API
 * Displays last 5 shipments with status
 */
async function loadRecentShipments() {
    try {
        const user = auth.getProfile();
        const response = await fetch(`${API_URL}/shipments?limit=5`, {
            headers: getAuthHeader()
        });

        const data = await response.json();
        const recentList = document.getElementById('recentList');

        if (data.success && data.shipments.length > 0) {
            recentList.innerHTML = data.shipments.map(shipment => `
                <div style="padding: 15px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 10px;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${shipment.trackingNumber}</strong>
                            <p style="font-size: 12px; color: #666; margin: 5px 0;">
                                ${shipment.origin.city} → ${shipment.destination.city}
                            </p>
                        </div>
                        <div style="text-align: right;">
                            <span style="background: ${getStatusColor(shipment.status)}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 12px;">
                                ${shipment.status.replace('-', ' ').toUpperCase()}
                            </span>
                            <p style="font-size: 11px; color: #999; margin-top: 5px;">
                                $${shipment.rate || '0.00'}
                            </p>
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            recentList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No shipments yet. Create your first one!</p>';
        }
    } catch (error) {
        console.error('Error loading shipments:', error);
        document.getElementById('recentList').innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Error loading shipments</p>';
    }
}

/**
 * Load inventory items from backend API
 */
async function loadInventory() {
    try {
        const response = await fetch(`${API_URL}/inventory`, {
            headers: getAuthHeader()
        });

        const data = await response.json();

        if (data.success && data.items.length > 0) {
            const summary = document.querySelector('[data-section="inventory"]');
            if (summary) {
                summary.innerHTML += `
                    <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin-top: 15px;">
                        <h4>📦 Inventory Summary</h4>
                        <p>Total Items: <strong>${data.summary.totalItems}</strong></p>
                        <p>Total Quantity: <strong>${data.summary.totalQuantity}</strong></p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading inventory:', error);
    }
}

/**
 * Get color for shipment status badge
 */
function getStatusColor(status) {
    const colors = {
        'pending': '#999',
        'pickup': '#FF9800',
        'in-transit': '#2196F3',
        'out-for-delivery': '#673AB7',
        'delivered': '#4CAF50',
        'cancelled': '#F44336'
    };
    return colors[status] || '#999';
}

/**
 * Create new shipment
 */
async function submitShipment(event) {
    if (event) event.preventDefault();

    const shipmentData = {
        origin: {
            address: document.getElementById('origin-address')?.value || '',
            city: document.getElementById('origin-city')?.value || '',
            state: document.getElementById('origin-state')?.value || '',
            zipCode: document.getElementById('origin-zip')?.value || '',
            country: document.getElementById('origin-country')?.value || '',
            contactName: document.getElementById('origin-contact')?.value || ''
        },
        destination: {
            address: document.getElementById('dest-address')?.value || '',
            city: document.getElementById('dest-city')?.value || '',
            state: document.getElementById('dest-state')?.value || '',
            zipCode: document.getElementById('dest-zip')?.value || '',
            country: document.getElementById('dest-country')?.value || '',
            contactName: document.getElementById('dest-contact')?.value || ''
        },
        package: {
            weight: parseFloat(document.getElementById('weight')?.value || 0),
            description: document.getElementById('description')?.value || ''
        },
        service: document.getElementById('service')?.value || 'standard'
    };

    try {
        const response = await fetch(`${API_URL}/shipments`, {
            method: 'POST',
            headers: getAuthHeader(),
            body: JSON.stringify(shipmentData)
        });

        const data = await response.json();

        if (data.success) {
            showSuccess(`Shipment created! Tracking #: ${data.shipment.trackingNumber}`);
            // Reload shipments
            await loadRecentShipments();
            // Reset form if exists
            if (event && event.target) event.target.reset();
        } else {
            showError(data.message || 'Failed to create shipment');
        }
    } catch (error) {
        console.error('Error creating shipment:', error);
        showError('Error creating shipment');
    }
}

/**
 * Update customer profile
 */
async function updateProfile(event) {
    if (event) event.preventDefault();

    const updateData = {
        firstName: document.getElementById('profileFirstName')?.value || '',
        lastName: document.getElementById('profileLastName')?.value || '',
        phone: document.getElementById('profilePhone')?.value || '',
        profile: {
            address: document.getElementById('profileAddress')?.value || '',
            city: document.getElementById('profileCity')?.value || '',
            state: document.getElementById('profileState')?.value || '',
            zipCode: document.getElementById('profileZip')?.value || '',
            country: document.getElementById('profileCountry')?.value || ''
        }
    };

    const result = await auth.updateProfile(updateData);

    if (result.success) {
        showSuccess('Profile updated successfully!');
    } else {
        showError(result.message || 'Failed to update profile');
    }
}

/**
 * Logout user
 */
function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'auth.html';
    }
}

/**
 * Show success message to user
 */
function showSuccess(message) {
    console.log('Success:', message);
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => notification.remove(), 3000);
}

/**
 * Show error message to user
 */
function showError(message) {
    console.error('Error:', message);
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #F44336;
        color: white;
        padding: 15px 20px;
        border-radius: 4px;
        z-index: 9999;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => notification.remove(), 5000);
}
}

function handleQuoteSubmit(event) {
    event.preventDefault();
    
    const weight = event.target.querySelector('input[type="number"]').value;
    const service = event.target.querySelector('select:nth-of-type(2)').value;

    // Calculate quote
    const baseRate = 25;
    const weightCharge = weight * 0.50;
    const total = baseRate + weightCharge;

    // Display result
    document.getElementById('baseRate').textContent = '$' + baseRate.toFixed(2);
    document.getElementById('weightCharge').textContent = '$' + weightCharge.toFixed(2);
    document.getElementById('totalQuote').textContent = '$' + total.toFixed(2);
    document.getElementById('quoteResult').style.display = 'block';

    // Scroll to result
    document.getElementById('quoteResult').scrollIntoView({ behavior: 'smooth' });
}

function proceedToShipment() {
    switchSection('shipments');
}

function handleTrackingSubmit(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('trackingInput').value;

    // Demo tracking data
    const statuses = ['Processing', 'In Transit', 'Customs Clearance', 'Out for Delivery'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);

    document.getElementById('trackingStatus').textContent = randomStatus;
    document.getElementById('trackingNum').textContent = trackingNumber;
    document.getElementById('trackingOrigin').textContent = 'United States';
    document.getElementById('trackingDest').textContent = 'Jamaica';
    document.getElementById('trackingETA').textContent = date.toLocaleDateString();
    
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = 'status-badge ' + randomStatus.toLowerCase().replace(' ', '-');
    statusBadge.textContent = randomStatus;

    document.getElementById('trackingResult').style.display = 'block';
    document.getElementById('trackingResult').scrollIntoView({ behavior: 'smooth' });
}

function handleProfileUpdate(event) {
    event.preventDefault();

    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const phone = document.getElementById('profilePhone').value;

    const result = auth.updateProfile({
        firstName,
        lastName,
        phone
    });

    if (result.success) {
        alert('Profile updated successfully!');
        // Update display
        document.getElementById('userNameSidebar').textContent = firstName + ' ' + lastName;
        document.getElementById('dashboardName').textContent = firstName;
    }
}

function handleSupportSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'index.html';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { switchSection };
}
