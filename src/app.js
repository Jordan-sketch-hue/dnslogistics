// D.N Express Logistics - Main Application JavaScript
// Courier & Warehouse Platform
// Handles tracking, API integration, and dynamic content

// Configuration
const config = {
    apiEndpoint: 'https://api.dnexpress.com/v1',
    localApiEndpoint: '/api',
    company: 'D.N Express Logistics',
    version: '1.0.0',
    slogan: 'Delivering the World Faster'
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    console.log(`${config.company} v${config.version} initialized`);
    setupEventListeners();
    initializeDashboard();
});

// Setup Event Listeners
function setupEventListeners() {
    const cta = document.querySelector('.hero .cta-button');
    if (cta) {
        cta.addEventListener('click', function() {
            document.getElementById('contact').scrollIntoView({ behavior: 'smooth' });
        });
    }
}

// Toggle Hamburger Menu
function toggleMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
}

// Track Shipment Function
function trackShipment(event) {
    if (event) {
        event.preventDefault();
    }
    
    const trackingInput = document.getElementById('trackingNumber');
    const trackingNumber = trackingInput ? trackingInput.value.trim() : '';
    
    if (!trackingNumber) {
        alert('Please enter a tracking number');
        return;
    }

    // Show demo tracking result immediately
    displayDemoTrackingResult(trackingNumber);
}

// Calculate Rates Function
function calculateRates() {
    const weightInput = document.getElementById('weight');
    const weight = weightInput ? parseFloat(weightInput.value) : 0;
    
    if (!weight || weight < 1) {
        alert('Please enter a valid weight (minimum 1 lbs)');
        return;
    }

    // Demo rate calculation
    const baseRate = 25; // $25 base
    const perLbRate = 0.50; // $0.50 per lb
    const totalRate = baseRate + (weight * perLbRate);
    
    // Display the rate
    const rateDisplay = document.getElementById('rateDisplay') || createRateDisplay();
    rateDisplay.innerHTML = `
        <div style="padding: 20px; background: linear-gradient(135deg, #0E244C 0%, #1A4F9B 100%); 
                    color: white; border-radius: 8px; text-align: center; margin-top: 20px;">
            <h3>Estimated Rate</h3>
            <p style="font-size: 36px; color: #D4262A; margin: 10px 0;">$${totalRate.toFixed(2)}</p>
            <p>Weight: ${weight} lbs</p>
            <p style="font-size: 12px; margin-top: 10px; color: #ccc;">
                Base: $${baseRate.toFixed(2)} + Weight: $${(weight * perLbRate).toFixed(2)}<br/>
                <em>Connect to Fast Forward Now API for real-time rates</em>
            </p>
        </div>
    `;
}

// Create Rate Display Element
function createRateDisplay() {
    const form = document.getElementById('ratesForm');
    const display = document.createElement('div');
    display.id = 'rateDisplay';
    if (form && form.parentNode) {
        form.parentNode.appendChild(display);
    }
    return display;
}

// Track Shipment Function - Async Version
async function trackShipmentAsync() {
    const trackingNumber = document.getElementById('trackingNumber').value.trim();
    
    if (!trackingNumber) {
        alert('Please enter a tracking number');
        return;
    }

    try {
        // First try local API endpoint
        const response = await fetch(`${config.localApiEndpoint}/shipments/${trackingNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAuthToken()
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayTrackingResult(data);
        } else {
            // Fallback to demo data
            displayDemoTrackingResult(trackingNumber);
        }
    } catch (error) {
        console.error('Tracking error:', error);
        displayDemoTrackingResult(trackingNumber);
    }
}

// Display Tracking Result
function displayTrackingResult(data) {
    const result = document.getElementById('trackingResult');
    const statusText = document.getElementById('statusText');
    const statusDetails = document.getElementById('statusDetails');

    statusText.innerHTML = `<strong>Status:</strong> ${data.status || 'In Transit'}`;
    
    const details = `
        <p><strong>Tracking Number:</strong> ${data.trackingNumber}</p>
        <p><strong>Origin:</strong> ${data.origin || 'USA'}</p>
        <p><strong>Destination:</strong> ${data.destination || 'Jamaica'}</p>
        <p><strong>Estimated Delivery:</strong> ${data.estimatedDelivery || 'TBD'}</p>
        <p><strong>Last Update:</strong> ${data.lastUpdate || new Date().toLocaleString()}</p>
    `;
    
    statusDetails.innerHTML = details;
    result.style.display = 'block';
}

// Display Demo Tracking Result (for testing)
function displayDemoTrackingResult(trackingNumber) {
    const result = document.getElementById('trackingResult');
    const statusText = document.getElementById('statusText');
    const statusDetails = document.getElementById('statusDetails');

    const statuses = ['Processing', 'In Transit', 'Customs Clearance', 'Out for Delivery'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    statusText.innerHTML = `<strong>Status:</strong> ${randomStatus}`;
    
    const details = `
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p><strong>Origin:</strong> United States</p>
        <p><strong>Destination:</strong> Jamaica</p>
        <p><strong>Estimated Delivery:</strong> ${getEstimatedDeliveryDate()}</p>
        <p><strong>Last Update:</strong> ${new Date().toLocaleString()}</p>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #ddd;">
            <p style="color: #666; font-size: 12px;"><em>This is a demo shipment. Connect to Fast Forward Now API for real tracking data.</em></p>
        </div>
    `;
    
    statusDetails.innerHTML = details;
    result.style.display = 'block';
}

// Get Estimated Delivery Date
function getEstimatedDeliveryDate() {
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);
    return date.toLocaleDateString();
}

// Get Auth Token (placeholder for future authentication)
function getAuthToken() {
    return localStorage.getItem('auth_token') || 'demo_token';
}

// Initialize Dashboard (if on dashboard page)
function initializeDashboard() {
    const dashboard = document.getElementById('dashboard-container');
    if (dashboard) {
        loadDashboardData();
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    try {
        const response = await fetch(`${config.localApiEndpoint}/dashboard/metrics`, {
            headers: {
                'Authorization': 'Bearer ' + getAuthToken()
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            renderDashboard(data);
        }
    } catch (error) {
        console.warn('Could not load dashboard data:', error);
    }
}

// Render Dashboard
function renderDashboard(data) {
    console.log('Dashboard data loaded:', data);
}

// API Integration Functions
const API = {
    /**
     * Get shipment status from Fast Forward Now API
     */
    async getShipmentStatus(trackingNumber) {
        try {
            const response = await fetch(`${config.apiEndpoint}/shipments/${trackingNumber}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    /**
     * Get rates from Fast Forward Now
     */
    async getRates(origin, destination, weight) {
        try {
            const response = await fetch(`${config.apiEndpoint}/rates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ origin, destination, weight })
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    },

    /**
     * Create new shipment
     */
    async createShipment(shipmentData) {
        try {
            const response = await fetch(`${config.apiEndpoint}/shipments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAuthToken()
                },
                body: JSON.stringify(shipmentData)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return null;
        }
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API, config, trackShipment };
}
