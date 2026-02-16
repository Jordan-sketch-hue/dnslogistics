/**
 * Sethwan Integration Routes
 * 
 * Handles Sethwan warehouse platform integration:
 * - Connection validation and testing
 * - Warehouse synchronization
 * - Settings management
 * - Integration status
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const sethwan = require('../middleware/sethwan');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/sethwan/test-connection
 * Test Sethwan API connection with provided credentials
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "apiKey": "your-sethwan-api-key",
 *   "accountId": "your-sethwan-account-id"
 * }
 * 
 * Response:
 * {
 *   "success": true/false,
 *   "valid": true/false,
 *   "account": { account details },
 *   "features": [ list of available features ],
 *   "message": "Connection test result"
 * }
 */
router.post('/test-connection', verifyToken, async (req, res) => {
    try {
        const { apiKey, accountId } = req.body;

        if (!apiKey || !accountId) {
            return res.status(400).json({
                success: false,
                message: 'API Key and Account ID are required'
            });
        }

        // Create temporary Sethwan instance with provided creds
        const testSethwan = {
            baseURL: process.env.SETHWAN_API_URL || 'https://api.sethwan.com',
            apiKey,
            accountId
        };

        // Simulate validation (in production, this calls actual Sethwan API)
        const testResult = {
            success: true,
            valid: apiKey.length > 20 && accountId.length > 5, // Basic validation
            message: apiKey.length > 20 && accountId.length > 5 ? 
                'Connection successful' : 'Invalid credentials format',
            account: {
                id: accountId,
                name: 'Account Name',
                status: 'active'
            },
            features: [
                'shipment_tracking',
                'package_management',
                'manifest_generation',
                'warehouse_management',
                'reporting'
            ]
        };

        if (testResult.valid) {
            console.log(`✓ Sethwan connection test passed for ${req.user.companyName}`);
        } else {
            console.log(`✗ Sethwan connection test failed for ${req.user.companyName}`);
        }

        res.json(testResult);

    } catch (error) {
        console.error('Connection test error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to test connection',
            error: error.message
        });
    }
});

/**
 * POST /api/sethwan/connect
 * Establish and save Sethwan connection for customer
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "apiKey": "sethwan-api-key",
 *   "accountId": "sethwan-account-id"
 * }
 */
router.post('/connect', verifyToken, async (req, res) => {
    try {
        const { apiKey, accountId } = req.body;

        if (!apiKey || !accountId) {
            return res.status(400).json({
                success: false,
                message: 'API Key and Account ID are required'
            });
        }

        // First test the connection
        const testResult = await sethwan.validateConnection();

        if (!testResult.valid) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Sethwan credentials',
                details: testResult.error
            });
        }

        // Update user with Sethwan integration details
        const user = db.getUserById(req.user.id);
        const updated = db.updateUser(req.user.id, {
            sethwan: {
                customerId: accountId,
                accountId: accountId,
                apiKey: apiKey,
                defaultWarehouse: null,
                integrated: true
            }
        });

        // Sync customer warehouse if integration successful
        await sethwan.syncCustomerWarehouse(updated);

        console.log(`✓ Sethwan integration established for ${req.user.companyName}`);

        res.json({
            success: true,
            message: 'Sethwan connection established',
            integrated: true,
            account: testResult.account,
            features: testResult.features
        });

    } catch (error) {
        console.error('Connection error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to establish Sethwan connection',
            error: error.message
        });
    }
});

/**
 * GET /api/sethwan/status
 * Get current Sethwan integration status
 * Requires: Authentication
 * 
 * Response:
 * {
 *   "integrated": true/false,
 *   "customerId": "customer-id",
 *   "defaultWarehouse": "warehouse-id",
 *   "account": { account details }
 * }
 */
router.get('/status', verifyToken, (req, res) => {
    try {
        const user = db.getUserById(req.user.id);

        res.json({
            success: true,
            integration: {
                integrated: user.sethwan.integrated,
                customerId: user.sethwan.customerId,
                accountId: user.sethwan.accountId,
                defaultWarehouse: user.sethwan.defaultWarehouse,
                message: user.sethwan.integrated ? 
                    'Sethwan integration active' : 'Sethwan not integrated'
            }
        });

    } catch (error) {
        console.error('Status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve integration status'
        });
    }
});

/**
 * GET /api/sethwan/warehouses
 * Get available warehouses from Sethwan
 * Requires: Authentication + Active Integration
 */
router.get('/warehouses', verifyToken, async (req, res) => {
    try {
        const user = db.getUserById(req.user.id);

        if (!user.sethwan.integrated) {
            return res.status(400).json({
                success: false,
                message: 'Sethwan integration not active'
            });
        }

        const warehouseResult = await sethwan.getWarehouses();

        if (!warehouseResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch warehouses',
                error: warehouseResult.error
            });
        }

        res.json({
            success: true,
            warehouses: warehouseResult.warehouses || []
        });

    } catch (error) {
        console.error('Warehouses error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve warehouses',
            error: error.message
        });
    }
});

/**
 * POST /api/sethwan/set-default-warehouse
 * Set default warehouse for customer
 * Requires: Authentication + Active Integration
 * 
 * Request Body:
 * {
 *   "warehouseId": "sethwan-warehouse-id"
 * }
 */
router.post('/set-default-warehouse', verifyToken, (req, res) => {
    try {
        const { warehouseId } = req.body;

        if (!warehouseId) {
            return res.status(400).json({
                success: false,
                message: 'Warehouse ID is required'
            });
        }

        const user = db.getUserById(req.user.id);

        if (!user.sethwan.integrated) {
            return res.status(400).json({
                success: false,
                message: 'Sethwan integration not active'
            });
        }

        // Update default warehouse
        const updated = db.updateUser(req.user.id, {
            sethwan: {
                ...user.sethwan,
                defaultWarehouse: warehouseId
            }
        });

        console.log(`✓ Default warehouse set for ${req.user.companyName}: ${warehouseId}`);

        res.json({
            success: true,
            message: 'Default warehouse updated',
            defaultWarehouse: warehouseId
        });

    } catch (error) {
        console.error('Set default warehouse error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to set default warehouse'
        });
    }
});

/**
 * POST /api/sethwan/disconnect
 * Disconnect from Sethwan integration
 * Requires: Authentication
 */
router.post('/disconnect', verifyToken, (req, res) => {
    try {
        const user = db.getUserById(req.user.id);

        // Clear Sethwan integration data
        const updated = db.updateUser(req.user.id, {
            sethwan: {
                customerId: null,
                accountId: null,
                apiKey: null,
                defaultWarehouse: null,
                integrated: false
            }
        });

        console.log(`✓ Sethwan integration disconnected for ${req.user.companyName}`);

        res.json({
            success: true,
            message: 'Sethwan integration disconnected'
        });

    } catch (error) {
        console.error('Disconnect error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to disconnect from Sethwan'
        });
    }
});

/**
 * POST /api/sethwan/sync-shipment
 * Sync a shipment with Sethwan
 * Requires: Authentication + Active Integration
 * 
 * Request Body:
 * {
 *   "shipmentId": "internal-shipment-id"
 * }
 */
router.post('/sync-shipment', verifyToken, async (req, res) => {
    try {
        const { shipmentId } = req.body;

        if (!shipmentId) {
            return res.status(400).json({
                success: false,
                message: 'Shipment ID is required'
            });
        }

        const user = db.getUserById(req.user.id);

        if (!user.sethwan.integrated) {
            return res.status(400).json({
                success: false,
                message: 'Sethwan integration not active'
            });
        }

        // Get shipment
        const shipment = db.getShipmentById(shipmentId);

        if (!shipment || shipment.companyId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Send to Sethwan
        const syncResult = await sethwan.sendShipmentToSethwan(shipment);

        if (!syncResult.success) {
            return res.status(500).json({
                success: false,
                message: 'Failed to sync shipment with Sethwan',
                error: syncResult.error
            });
        }

        console.log(`✓ Shipment synced to Sethwan: ${shipment.trackingNumber}`);

        res.json({
            success: true,
            message: 'Shipment synced with Sethwan',
            sethwanId: syncResult.sethwanId,
            sethwanTrackingNumber: syncResult.sethwanTrackingNumber
        });

    } catch (error) {
        console.error('Sync shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to sync shipment',
            error: error.message
        });
    }
});

/**
 * GET /api/sethwan/health-check
 * Comprehensive health check of Sethwan integration
 * Requires: Authentication (recommended admin)
 */
router.get('/health-check', verifyToken, async (req, res) => {
    try {
        const healthChecks = {
            timestamp: new Date(),
            overallStatus: 'healthy',
            checks: {}
        };

        // 1. Check API connection
        const connectionTest = await sethwan.validateConnection();
        healthChecks.checks.apiConnection = {
            status: connectionTest.valid ? 'healthy' : 'unhealthy',
            message: connectionTest.message || connectionTest.error,
            timestamp: new Date()
        };

        // 2. Check user integration
        const user = db.getUserById(req.user.id);
        healthChecks.checks.userIntegration = {
            status: user.sethwan.integrated ? 'active' : 'inactive',
            integrated: user.sethwan.integrated,
            timestamp: new Date()
        };

        // 3. Check warehouse access
        if (user.sethwan.integrated) {
            const warehouseResult = await sethwan.getWarehouses();
            healthChecks.checks.warehouseAccess = {
                status: warehouseResult.success ? 'healthy' : 'unhealthy',
                warehouseCount: warehouseResult.warehouses?.length || 0,
                timestamp: new Date()
            };
        }

        // 4. Overall status
        const allHealthy = Object.values(healthChecks.checks)
            .every(check => check.status === 'healthy' || check.status === 'active');
        
        healthChecks.overallStatus = allHealthy ? 'healthy' : 'degraded';

        res.json({
            success: true,
            health: healthChecks
        });

    } catch (error) {
        console.error('Health check error:', error);
        res.status(500).json({
            success: false,
            message: 'Health check failed',
            error: error.message
        });
    }
});

module.exports = router;
