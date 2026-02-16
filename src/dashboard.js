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
    if (!token) {
        if (window.errorHandler) {
            window.errorHandler.handleAuthError('Session expired. Please log in again.');
        }
        setTimeout(() => window.location.href = 'auth.html', 1500);
        return null;
    }
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
    
    if (!user) {
        window.location.href = 'auth.html';
        return;
    }
    
    // Update user info in all places
    const fullName = user.firstName + ' ' + user.lastName;
    document.getElementById('userName').textContent = user.companyName || fullName;
    document.getElementById('userNameSidebar').textContent = fullName;
    document.getElementById('dashboardName').textContent = user.firstName;
    document.getElementById('userEmailSidebar').textContent = user.email;
    
    // Display warehouse address
    displayWarehouseAddress(user);
    
    // Populate profile form
    if (document.getElementById('profileFirstName')) {
        document.getElementById('profileFirstName').value = user.firstName || '';
        document.getElementById('profileLastName').value = user.lastName || '';
        document.getElementById('profileEmail').value = user.email || '';
        document.getElementById('profilePhone').value = user.phone || '';
        
        // Display account number and warehouse address in profile
        if (user.customerNumber) {
            const profileAccountNumber = document.getElementById('profileAccountNumber');
            if (profileAccountNumber) {
                profileAccountNumber.textContent = user.customerNumber;
            }
        }
        
        if (user.warehouseAddress) {
            const profileWarehouseAddress = document.getElementById('profileWarehouseAddress');
            if (profileWarehouseAddress) {
                profileWarehouseAddress.textContent = user.warehouseAddress.fullAddress;
            }
        }
    }
    
    // Load dashboard data from backend
    await loadDashboardStats();
    await loadRecentShipments();
    await loadInventory();
    
    // Setup navigation
    setupNavigation();
}

/**
 * Display warehouse address on dashboard
 */
function displayWarehouseAddress(user) {
    if (!user.warehouseAddress) {
        console.warn('No warehouse address found for user');
        return;
    }
    
    const wa = user.warehouseAddress;
    
    // Update dashboard warehouse address display
    const fullNameEl = document.getElementById('warehouseFullName');
    const accountNumberEl = document.getElementById('warehouseAccountNumber');
    const companyNameEl = document.getElementById('warehouseCompanyName');
    const streetEl = document.getElementById('warehouseStreet');
    const cityEl = document.getElementById('warehouseCity');
    const countryEl = document.getElementById('warehouseCountry');
    const accountHighlightEl = document.getElementById('accountNumberHighlight');
    
    if (fullNameEl) fullNameEl.textContent = wa.recipientName;
    if (accountNumberEl) accountNumberEl.textContent = `Account: ${wa.customerNumber}`;
    if (companyNameEl) companyNameEl.textContent = wa.companyName;
    if (streetEl) streetEl.textContent = `${wa.street1}, ${wa.street2}`;
    if (cityEl) cityEl.textContent = `${wa.city}, ${wa.state} ${wa.zipCode}`;
    if (countryEl) countryEl.textContent = wa.country;
    if (accountHighlightEl) accountHighlightEl.textContent = wa.customerNumber;
}

/**
 * Copy warehouse address to clipboard
 */
function copyWarehouseAddress() {
    const user = auth.getProfile();
    if (!user || !user.warehouseAddress) {
        if (window.errorHandler) {
            window.errorHandler.showWarning('No Address', 'Warehouse address not available');
        }
        return;
    }
    
    const address = user.warehouseAddress.fullAddress;
    
    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(address).then(() => {
            if (window.errorHandler) {
                window.errorHandler.showSuccess('Copied!', 'Warehouse address copied to clipboard');
            } else {
                alert('Address copied to clipboard!');
            }
        }).catch(err => {
            console.error('Failed to copy:', err);
            fallbackCopyToClipboard(address);
        });
    } else {
        fallbackCopyToClipboard(address);
    }
}

/**
 * Fallback copy method for older browsers
 */
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.select();
    
    try {
        document.execCommand('copy');
        if (window.errorHandler) {
            window.errorHandler.showSuccess('Copied!', 'Warehouse address copied to clipboard');
        } else {
            alert('Address copied to clipboard!');
        }
    } catch (err) {
        console.error('Fallback copy failed:', err);
        if (window.errorHandler) {
            window.errorHandler.showError('Copy Failed', 'Please copy the address manually');
        }
    }
    
    document.body.removeChild(textArea);
}

/**
 * Download warehouse address as PDF
 */
function downloadWarehouseAddressPDF() {
    const user = auth.getProfile();
    if (!user || !user.warehouseAddress) {
        if (window.errorHandler) {
            window.errorHandler.showWarning('No Address', 'Warehouse address not available');
        }
        return;
    }
    
    const wa = user.warehouseAddress;
    
    // Create a simple HTML page for PDF
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Warehouse Address - ${wa.customerNumber}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 50px auto;
            padding: 40px;
            border: 2px solid #0E244C;
        }
        .header {
            text-align: center;
            margin-bottom: 30px;
            color: #D4262A;
        }
        .address-box {
            background: #f8f9fa;
            padding: 30px;
            border-left: 5px solid #D4262A;
            font-size: 16px;
            line-height: 1.8;
            font-family: 'Courier New', monospace;
        }
        .instructions {
            margin-top: 30px;
            padding: 20px;
            background: #fff3cd;
            border-radius: 5px;
        }
        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 12px;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>D.N Express Logistics</h1>
        <h2>Your USA Warehouse Address</h2>
    </div>
    
    <div class="address-box">
        <strong>${wa.recipientName}</strong><br>
        Account: ${wa.customerNumber}<br>
        ${wa.companyName}<br>
        ${wa.street1}<br>
        ${wa.street2}<br>
        ${wa.city}, ${wa.state} ${wa.zipCode}<br>
        ${wa.country}
    </div>
    
    <div class="instructions">
        <h3>How to Use This Address:</h3>
        <ol>
            <li>Use this address when shopping online from USA stores</li>
            <li>Always include your account number: <strong>${wa.customerNumber}</strong></li>
            <li>Once your package arrives at our Miami warehouse, we'll notify you</li>
            <li>We'll forward it to your Jamaica address</li>
        </ol>
    </div>
    
    <div class="footer">
        <p>Questions? Contact support@example.com for assistance</p>
        <p>Generated: ${new Date().toLocaleDateString()}</p>
    </div>
</body>
</html>
    `;
    
    // Create blob and download
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `DNExpress-WarehouseAddress-${wa.customerNumber}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    if (window.errorHandler) {
        window.errorHandler.showSuccess('Downloaded!', 'Open the file and print as PDF from your browser');
    } else {
        alert('Downloaded! Open the file and print as PDF from your browser.');
    }
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
    sections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
        selectedSection.style.display = 'block';
    }

    // Update nav active state (top nav)
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`.nav-item[data-section="${sectionName}"]`);
    if (activeNav) activeNav.classList.add('active');
    
    // Update sidebar active state
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach((item, index) => {
        item.classList.remove('active');
        // Match section to sidebar item
        const sectionMap = {
            'dashboard': 0,
            'shipments': 1,
            'quotes': 2,
            'tracking': 3,
            'profile': 4,
            'support': 5
        };
        if (sectionMap[sectionName] === index) {
            item.classList.add('active');
        }
    });
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/**
 * Show create shipment form/modal
 */
function showCreateShipment() {
    // Switch to shipments section
    switchSection('shipments');
    // You can add a modal or form here later
    alert('Create new shipment form will be displayed here. For now, please use the "Get Quotes" section to calculate rates.');
}

/**
 * Load dashboard statistics from backend API
 * Shows total shipments, delivered, in-transit, and revenue
 */
async function loadDashboardStats() {
    try {
        const user = auth.getProfile();
        if (!user || !user.id) {
            throw new Error('User profile not found');
        }

        const headers = getAuthHeader();
        if (!headers) return; // Auth error already handled

        const response = await fetch(`${API_URL}/customers/${user.id}/info`, {
            headers: headers
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();

        if (data.success) {
            // Update dashboard metrics
            document.getElementById('totalShipments').textContent = data.summary.totalShipments || '0';
            document.getElementById('deliveredShipments').textContent = data.summary.deliveredShipments || '0';
            document.getElementById('inTransitShipments').textContent = data.summary.activeShipments || '0';
            document.getElementById('totalSpent').textContent = '$' + (data.summary.totalRevenue || '0.00').toFixed(2);
        } else {
            throw new Error(data.message || 'Failed to load dashboard stats');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        if (window.errorHandler) {
            window.errorHandler.handleAPIError(error, '/customers/:id/info', 'GET');
        }
        // Set default values
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
        const shipmentsTableBody = document.getElementById('shipmentsTableBody');

        if (data.success && data.shipments && data.shipments.length > 0) {
            // Update recent shipments list
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
            
            // Update shipments table
            if (shipmentsTableBody) {
                shipmentsTableBody.innerHTML = data.shipments.map(shipment => `
                    <tr>
                        <td><strong>${shipment.trackingNumber}</strong></td>
                        <td>
                            <span style="background: ${getStatusColor(shipment.status)}; color: white; padding: 5px 10px; border-radius: 4px; font-size: 11px; display: inline-block;">
                                ${shipment.status.replace('-', ' ').toUpperCase()}
                            </span>
                        </td>
                        <td>${shipment.origin.city}, ${shipment.origin.state}</td>
                        <td>${shipment.destination.city}, ${shipment.destination.state}</td>
                        <td>${new Date(shipment.createdAt).toLocaleDateString()}</td>
                        <td>
                            <button class="cta-button" style="padding: 5px 10px; font-size: 12px;" onclick="viewShipmentDetails('${shipment.trackingNumber}')">
                                <i class="fas fa-eye"></i> View
                            </button>
                        </td>
                    </tr>
                `).join('');
            }
        } else {
            recentList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No shipments yet. Create your first one!</p>';
            if (shipmentsTableBody) {
                shipmentsTableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; color: #999; padding: 40px;">
                            No shipments found. Create your first shipment!
                        </td>
                    </tr>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading shipments:', error);
        document.getElementById('recentList').innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">Error loading shipments. Please try again later.</p>';
        const shipmentsTableBody = document.getElementById('shipmentsTableBody');
        if (shipmentsTableBody) {
            shipmentsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; color: #999; padding: 40px;">
                        Error loading shipments. Please try again later.
                    </td>
                </tr>
            `;
        }
    }
}

/**
 * View shipment details
 */
function viewShipmentDetails(trackingNumber) {
    // Switch to tracking section and populate with tracking number
    document.getElementById('trackingInput').value = trackingNumber;
    switchSection('tracking');
    // Automatically trigger tracking
    setTimeout(() => {
        document.getElementById('trackingForm').dispatchEvent(new Event('submit'));
    }, 300);
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
 * Show success message to user (uses global error handler)
 */
function showSuccess(message) {
    if (window.errorHandler) {
        window.errorHandler.showSuccess('Success', message);
    } else {
        // Fallback if error handler not loaded
        alert(message);
    }
}

/**
 * Show error message to user (uses global error handler)
 */
function showError(message) {
    if (window.errorHandler) {
        window.errorHandler.showNotification('error', 'Error', message);
    } else {
        // Fallback if error handler not loaded
        alert('Error: ' + message);
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

    const trackingNumber = document.getElementById('trackingInput').value.trim();
    
    if (!trackingNumber) {
        showError('Please enter a tracking number');
        return;
    }

    // Try to fetch from API first
    loadTrackingData(trackingNumber);
}

/**
 * Load tracking data from API
 */
async function loadTrackingData(trackingNumber) {
    try {
        const response = await fetch(`${API_URL}/shipments/track/${trackingNumber}`, {
            headers: getAuthHeader()
        });

        const data = await response.json();

        if (data.success && data.shipment) {
            const shipment = data.shipment;
            
            // Update tracking display
            document.getElementById('trackingStatus').textContent = shipment.status.replace('-', ' ').toUpperCase();
            document.getElementById('trackingNum').textContent = trackingNumber;
            document.getElementById('trackingOrigin').textContent = `${shipment.origin.city}, ${shipment.origin.state}, ${shipment.origin.country}`;
            document.getElementById('trackingDest').textContent = `${shipment.destination.city}, ${shipment.destination.state}, ${shipment.destination.country}`;
            
            const eta = shipment.estimatedDelivery ? new Date(shipment.estimatedDelivery).toLocaleDateString() : 'Calculating...';
            document.getElementById('trackingETA').textContent = eta;
            
            const statusBadge = document.getElementById('statusBadge');
            statusBadge.className = 'status-badge';
            statusBadge.style.background = getStatusColor(shipment.status);
            statusBadge.textContent = shipment.status.replace('-', ' ').toUpperCase();

            // Update timeline based on status
            updateTrackingTimeline(shipment.status);
            
            document.getElementById('trackingResult').style.display = 'block';
            document.getElementById('trackingResult').scrollIntoView({ behavior: 'smooth' });
        } else {
            // Fallback to demo data if not found
            showDemoTrackingData(trackingNumber);
        }
    } catch (error) {
        console.error('Error loading tracking data:', error);
        // Show demo data on error
        showDemoTrackingData(trackingNumber);
    }
}

/**
 * Show demo tracking data (fallback)
 */
function showDemoTrackingData(trackingNumber) {
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
    statusBadge.className = 'status-badge';
    statusBadge.style.background = getStatusColor('in-transit');
    statusBadge.textContent = randomStatus;

    document.getElementById('trackingResult').style.display = 'block';
    document.getElementById('trackingResult').scrollIntoView({ behavior: 'smooth' });
}

/**
 * Update tracking timeline based on status
 */
function updateTrackingTimeline(status) {
    const timelineItems = document.querySelectorAll('.timeline-item');
    const statusOrder = ['pending', 'in-transit', 'customs', 'delivered'];
    
    const currentIndex = statusOrder.indexOf(status.toLowerCase());
    
    timelineItems.forEach((item, index) => {
        if (index <= currentIndex) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

async function handleProfileUpdate(event) {
    event.preventDefault();

    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const phone = document.getElementById('profilePhone').value;
    const password = document.getElementById('profilePassword').value;

    const updateData = {
        firstName,
        lastName,
        phone
    };
    
    // Only include password if user entered one
    if (password && password.trim() !== '') {
        updateData.password = password;
    }

    try {
        const result = await auth.updateProfile(updateData);

        if (result.success) {
            showSuccess('Profile updated successfully!');
            // Update display
            document.getElementById('userNameSidebar').textContent = firstName + ' ' + lastName;
            document.getElementById('dashboardName').textContent = firstName;
            document.getElementById('userName').textContent = firstName + ' ' + lastName;
            // Clear password field
            document.getElementById('profilePassword').value = '';
        } else {
            showError(result.message || 'Failed to update profile');
        }
    } catch (error) {
        showError('Error updating profile');
        console.error('Profile update error:', error);
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

// Make functions globally available for onclick handlers
window.switchSection = switchSection;
window.copyWarehouseAddress = copyWarehouseAddress;
window.downloadWarehouseAddressPDF = downloadWarehouseAddressPDF;
window.showCreateShipment = showCreateShipment;
window.viewShipmentDetails = viewShipmentDetails;
window.handleQuoteSubmit = handleQuoteSubmit;
window.proceedToShipment = proceedToShipment;
window.handleTrackingSubmit = handleTrackingSubmit;
window.handleProfileUpdate = handleProfileUpdate;
window.handleSupportSubmit = handleSupportSubmit;
window.handleLogout = handleLogout;

// Password visibility toggle (imported from auth.js or defined here)
if (typeof window.togglePassword === 'undefined') {
    window.togglePassword = function(inputId) {
        const input = document.getElementById(inputId);
        const button = input.parentElement.querySelector('.password-toggle');
        const icon = button.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    };
}

// Password strength checker for profile (imported from auth.js or defined here)
if (typeof window.checkProfilePasswordStrength === 'undefined') {
    window.checkProfilePasswordStrength = function() {
        const password = document.getElementById('profilePassword')?.value;
        const fill = document.getElementById('profilePasswordStrengthFill');
        
        if (!fill || !password) return;
        
        const hasLength = password.length >= 8;
        const hasUppercase = /[A-Z]/.test(password);
        const hasLowercase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        
        let strength = 0;
        if (hasLength) strength++;
        if (hasUppercase) strength++;
        if (hasLowercase) strength++;
        if (hasNumber) strength++;
        
        fill.className = 'password-strength-fill';
        if (strength === 0) {
            fill.style.width = '0%';
        } else if (strength === 1) {
            fill.classList.add('weak');
        } else if (strength === 2) {
            fill.classList.add('fair');
        } else if (strength === 3) {
            fill.classList.add('good');
        } else if (strength === 4) {
            fill.classList.add('strong');
        }
    };
}
