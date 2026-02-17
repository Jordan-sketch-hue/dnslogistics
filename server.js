/**
 * D.N Express Logistics Backend Server
 * Express.js Server Configuration
 * 
 * This is the main backend server for the courier and warehouse platform.
 * It handles:
 * - Customer authentication (login/register)
 * - Customer profile management
 * - Shipment tracking and management
 * - Inventory and warehouse management
 * - Manifest generation and tracking
 * - Status updates and notifications
 * - Sethwan warehouse integration
 * - Admin operations and analytics
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Import route modules
const authRoutes = require('./api/routes/auth');
const customerRoutes = require('./api/routes/customers');
const shipmentRoutes = require('./api/routes/shipments');
const inventoryRoutes = require('./api/routes/inventory');
const statusRoutes = require('./api/routes/status');
const adminRoutes = require('./api/routes/admin');
const manifestRoutes = require('./api/routes/manifests');
const reportsRoutes = require('./api/routes/reports');
const sethwanRoutes = require('./api/routes/sethwan');

// Initialize Express app
const app = express();

// Middleware Configuration
// ============================================

// CORS - Allow requests from frontend
app.use(cors({
    origin: function(origin, callback) {
        // Allow requests with no origin (like mobile apps, Postman, or file://)
        if (!origin) return callback(null, true);
        
        // List of allowed origins
        const allowedOrigins = [
            'http://localhost:5000',
            'http://localhost:3000',
            'http://127.0.0.1:5000',
            'http://127.0.0.1:3000',
            process.env.FRONTEND_URL
        ];
        
        if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security headers middleware
app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
});

// Request logging middleware
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.path}`);
    next();
});

// API Routes
// ============================================

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'D.N Express Logistics Backend is running',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Authentication routes
// POST   /api/auth/register  - Register new company/customer
// POST   /api/auth/login     - Login existing customer
// POST   /api/auth/refresh   - Refresh JWT token
app.use('/api/auth', authRoutes);

// Customer routes
// GET    /api/customers/:id     - Get customer profile
// PUT    /api/customers/:id     - Update customer profile
// GET    /api/customers/:id/info - Get detailed customer info
// DELETE /api/customers/:id     - Deactivate account
app.use('/api/customers', customerRoutes);

// Shipment routes
// GET    /api/shipments         - List shipments
// POST   /api/shipments         - Create shipment
// GET    /api/shipments/:id     - Get shipment details
// PUT    /api/shipments/:id     - Update shipment
// GET    /api/shipments/track/:trackingNumber - Track by number
app.use('/api/shipments', shipmentRoutes);

// Inventory routes
// GET    /api/inventory         - List inventory
// POST   /api/inventory         - Add inventory
// GET    /api/inventory/:id     - Get inventory item
// PUT    /api/inventory/:id     - Update inventory
// DELETE /api/inventory/:id     - Remove inventory item
app.use('/api/inventory', inventoryRoutes);

// Status tracking routes
// GET    /api/status/:shipmentId - Get shipment status
// POST   /api/status/:shipmentId - Update shipment status
// GET    /api/status/list/:customerId - List all statuses for customer
app.use('/api/status', statusRoutes);

// Admin routes
// GET    /api/admin/dashboard   - Admin dashboard metrics
// GET    /api/admin/users       - List all users
// GET    /api/admin/reports     - Generate reports
app.use('/api/admin', adminRoutes);

// Manifest routes
// POST   /api/manifests         - Create manifest
// GET    /api/manifests         - List manifests
// GET    /api/manifests/:id     - Get manifest details
// GET    /api/manifests/:id/pdf - Download PDF
// PATCH  /api/manifests/:id/status - Update status
app.use('/api/manifests', manifestRoutes);

// Reports routes
// GET    /api/reports/revenue   - Revenue analytics
// GET    /api/reports/delivery-performance - Delivery metrics
// GET    /api/reports/inventory-health - Inventory status
// GET    /api/reports/carrier-costs - Cost analysis
// POST   /api/reports/custom    - Custom report
app.use('/api/reports', reportsRoutes);

// Sethwan Integration routes
// POST   /api/sethwan/test-connection - Test API connection
// POST   /api/sethwan/connect   - Establish integration
// GET    /api/sethwan/status    - Get integration status
// GET    /api/sethwan/warehouses - List warehouses
// POST   /api/sethwan/sync-shipment - Sync shipment
// GET    /api/sethwan/health-check - Health check
app.use('/api/sethwan', sethwanRoutes);

// Serve static files from multiple directories
const staticDirs = ['public', 'src', 'assets'];
staticDirs.forEach(dir => {
    const fullPath = path.join(__dirname, dir);
    app.use(express.static(fullPath));
    console.log(`📁 Serving static files from: ${fullPath}`);
});

// Explicit routes for static files
app.use('/src', express.static(path.join(__dirname, 'src')));
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// HTML page routes
// Homepage - main website
app.get('/', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'index.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

app.get('/index.html', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'index.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

// Login/Auth page
app.get('/auth', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'auth.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

app.get('/auth.html', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'auth.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

// Dashboard page
app.get('/dashboard', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'dashboard.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

app.get('/dashboard.html', (req, res) => {
    const fs = require('fs');
    const path = require('path');
    const filePath = path.join(__dirname, 'dashboard.html');
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        res.setHeader('Content-Type', 'text/html');
        res.send(content);
    } catch (error) {
        res.status(500).send('Error loading page');
    }
});

app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'D.N Express Logistics API is running',
        status: 'online',
        endpoints: {
            auth: '/api/auth',
            customers: '/api/customers',
            shipments: '/api/shipments',
            inventory: '/api/inventory',
            status: '/api/status',
            admin: '/api/admin',
            manifests: '/api/manifests',
            reports: '/api/reports',
            sethwan: '/api/sethwan'
        },
        timestamp: new Date().toISOString()
    });
});

// 404 Handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err.message);
    
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

// Start server
// ============================================
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';

// Only listen if not in serverless environment (Vercel)
if (process.env.VERCEL) {
    // Vercel serverless - just export the app
    console.log('Running in Vercel serverless environment');
} else {
    // Local or traditional server environment
    const server = app.listen(PORT, HOST, () => {
        console.log(`
    ╔════════════════════════════════════════════════════╗
    ║   D.N Express Logistics - Backend Server          ║
    ║   Fast Forward Now White Label Platform           ║
    ╠════════════════════════════════════════════════════╣
    ║   Server:     ${HOST}                          
    ║   Port:       ${PORT}                              
    ║   Status:     Online                              
    ║   Environment: ${process.env.NODE_ENV || 'development'}            
    ║   Docs:       http://${HOST}:${PORT}/api/docs     
    ╚════════════════════════════════════════════════════╝
    `);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
        console.log('SIGTERM received, shutting down gracefully...');
        server.close(() => {
            console.log('Server closed');
            process.exit(0);
        });
    });
}

module.exports = app;
