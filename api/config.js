/**
 * D.N Express Logistics API Configuration
 * Fast Forward Now Integration
 */

const API_CONFIG = {
    // Primary API endpoint for Fast Forward Now
    baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.fastforwardnow.co/v1',
    
    // Local API endpoint for development
    localURL: 'http://localhost:3000/api',
    
    // Authentication
    auth: {
        type: 'Bearer',
        tokenKey: 'ffn_auth_token',
        refreshEndpoint: '/auth/refresh'
    },

    // API Endpoints
    endpoints: {
        // Shipments
        shipments: {
            list: '/shipments',
            create: '/shipments',
            get: (id) => `/shipments/${id}`,
            update: (id) => `/shipments/${id}`,
            track: (trackingNumber) => `/shipments/track/${trackingNumber}`,
            status: (id) => `/shipments/${id}/status`
        },

        // Rates & Quotes
        rates: {
            calculate: '/rates/calculate',
            quote: '/rates/quote',
            list: '/rates'
        },

        // Services
        services: {
            list: '/services',
            get: (id) => `/services/${id}`,
            airFreight: '/services/air-freight',
            seaFreight: '/services/sea-freight',
            localDelivery: '/services/local-delivery'
        },

        // Users (future)
        users: {
            register: '/users/register',
            login: '/users/login',
            profile: '/users/profile',
            account: '/users/account'
        },

        // Dashboard (admin)
        dashboard: {
            metrics: '/dashboard/metrics',
            shipments: '/dashboard/shipments',
            reports: '/dashboard/reports'
        }
    },

    // Request headers
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'D.N Express Logistics / 1.0.0'
    },

    // Retry configuration
    retry: {
        attempts: 3,
        delay: 1000,
        backoff: 1.5
    },

    // Timeout (ms)
    timeout: 10000,

    // Cache configuration
    cache: {
        enabled: true,
        ttl: 3600, // 1 hour
        endpoints: [
            'services/list',
            'rates/list'
        ]
    }
};

// Initialize API client
class APIClient {
    constructor(config) {
        this.config = config;
        this.token = this.getStoredToken();
    }

    getStoredToken() {
        return localStorage.getItem(this.config.auth.tokenKey);
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem(this.config.auth.tokenKey, token);
    }

    getHeaders() {
        const headers = { ...this.config.headers };
        if (this.token) {
            headers['Authorization'] = `${this.config.auth.type} ${this.token}`;
        }
        return headers;
    }

    async request(method, endpoint, data = null) {
        const url = `${this.config.baseURL}${endpoint}`;
        const options = {
            method,
            headers: this.getHeaders(),
            timeout: this.config.timeout
        };

        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            options.body = JSON.stringify(data);
        }

        try {
            const response = await fetch(url, options);
            
            if (!response.ok) {
                throw new Error(`API Error: ${response.status} ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API Request Error:', error);
            throw error;
        }
    }

    // Shipment Methods
    async getShipment(trackingNumber) {
        return this.request('GET', this.config.endpoints.shipments.track(trackingNumber));
    }

    async createShipment(shipmentData) {
        return this.request('POST', this.config.endpoints.shipments.create, shipmentData);
    }

    async updateShipment(shipmentId, data) {
        return this.request('PUT', this.config.endpoints.shipments.update(shipmentId), data);
    }

    // Rate Methods
    async calculateRates(origin, destination, weight) {
        return this.request('POST', this.config.endpoints.rates.calculate, {
            origin,
            destination,
            weight
        });
    }

    // Service Methods
    async getServices() {
        return this.request('GET', this.config.endpoints.services.list);
    }

    // Dashboard Methods
    async getDashboardMetrics() {
        return this.request('GET', this.config.endpoints.dashboard.metrics);
    }
}

// Export configuration and client
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_CONFIG, APIClient };
}
