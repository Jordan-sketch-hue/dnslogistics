/**
 * Admin Routes
 * 
 * Administrative operations:
 * - Dashboard metrics
 * - User management
 * - System reporting
 * - Analytics
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken, authorize } = require('../middleware/auth');

/**
 * GET /api/admin/dashboard
 * Get system-wide dashboard metrics
 * Requires: Admin role
 * 
 * Returns:
 * {
 *   "totalUsers": number,
 *   "activeShipments": number,
 *   "deliveredShipments": number,
 *   "totalRevenue": number,
 *   "inventoryItems": number,
 *   "systemStatus": "healthy|warning|critical"
 * }
 */
router.get('/dashboard', verifyToken, authorize('admin'), (req, res) => {
    try {
        const allUsers = db.getAllUsers();
        const allShipments = db.getAllShipments();
        const allInventory = db.inventory;

        const activeShipments = allShipments.filter(s => 
            s.status !== 'delivered' && s.status !== 'cancelled'
        );
        const deliveredShipments = allShipments.filter(s => s.status === 'delivered');
        const totalRevenue = allShipments.reduce((sum, s) => sum + (s.rate || 0), 0);

        res.json({
            success: true,
            dashboard: {
                totalUsers: allUsers.length,
                activeUsers: allUsers.filter(u => u.status === 'active').length,
                totalShipments: allShipments.length,
                activeShipments: activeShipments.length,
                deliveredShipments: deliveredShipments.length,
                totalRevenue: totalRevenue.toFixed(2),
                averageShipmentValue: allShipments.length > 0 ? 
                    (totalRevenue / allShipments.length).toFixed(2) : 0,
                inventoryItems: allInventory.length,
                totalInventoryQuantity: allInventory.reduce((sum, i) => sum + i.quantity, 0),
                systemStatus: 'healthy',
                lastUpdated: new Date()
            }
        });

    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve dashboard metrics',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users
 * List all users with filtering
 * Requires: Admin role
 * 
 * Query Parameters:
 * - status: active|inactive (optional)
 * - role: customer|admin (optional)
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/users', verifyToken, authorize('admin'), (req, res) => {
    try {
        let users = db.getAllUsers();
        const { status, role, limit = 50, offset = 0 } = req.query;

        // Filter by status
        if (status) {
            users = users.filter(u => u.status === status);
        }

        // Filter by role
        if (role) {
            users = users.filter(u => u.role === role);
        }

        // Sort by most recent
        users.sort((a, b) => b.createdAt - a.createdAt);

        // Pagination
        const paginationStart = parseInt(offset);
        const paginationLimit = parseInt(limit);
        const paginated = users.slice(paginationStart, paginationStart + paginationLimit);

        res.json({
            success: true,
            users: paginated,
            pagination: {
                total: users.length,
                limit: paginationLimit,
                offset: paginationStart,
                returned: paginated.length
            }
        });

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve users',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/reports
 * Generate comprehensive system reports
 * Requires: Admin role
 * 
 * Query Parameters:
 * - type: shipments|revenue|users|inventory (optional)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 */
router.get('/reports', verifyToken, authorize('admin'), (req, res) => {
    try {
        const { type = 'all', startDate, endDate } = req.query;

        const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: 30 days ago
        const end = endDate ? new Date(endDate) : new Date();

        const report = {
            dateRange: { startDate: start, endDate: end },
            generatedAt: new Date()
        };

        const allShipments = db.getAllShipments().filter(s =>
            s.createdAt >= start && s.createdAt <= end
        );

        if (type === 'all' || type === 'shipments') {
            report.shipments = {
                total: allShipments.length,
                byStatus: allShipments.reduce((acc, s) => {
                    acc[s.status] = (acc[s.status] || 0) + 1;
                    return acc;
                }, {}),
                byService: allShipments.reduce((acc, s) => {
                    acc[s.service] = (acc[s.service] || 0) + 1;
                    return acc;
                }, {}),
                delivered: allShipments.filter(s => s.status === 'delivered').length,
                cancelled: allShipments.filter(s => s.status === 'cancelled').length
            };
        }

        if (type === 'all' || type === 'revenue') {
            report.revenue = {
                total: allShipments.reduce((sum, s) => sum + (s.rate || 0), 0).toFixed(2),
                average: allShipments.length > 0 ? 
                    (allShipments.reduce((sum, s) => sum + (s.rate || 0), 0) / allShipments.length).toFixed(2) : 0,
                byService: allShipments.reduce((acc, s) => {
                    if (!acc[s.service]) acc[s.service] = 0;
                    acc[s.service] += s.rate || 0;
                    return acc;
                }, {})
            };
        }

        if (type === 'all' || type === 'users') {
            const allUsers = db.getAllUsers();
            report.users = {
                total: allUsers.length,
                active: allUsers.filter(u => u.status === 'active').length,
                inactive: allUsers.filter(u => u.status !== 'active').length,
                newUsers: allUsers.filter(u => 
                    u.createdAt >= start && u.createdAt <= end
                ).length
            };
        }

        if (type === 'all' || type === 'inventory') {
            const inventoryItems = db.inventory;
            report.inventory = {
                totalItems: inventoryItems.length,
                totalQuantity: inventoryItems.reduce((sum, i) => sum + i.quantity, 0),
                byStatus: inventoryItems.reduce((acc, i) => {
                    acc[i.status] = (acc[i.status] || 0) + 1;
                    return acc;
                }, {}),
                lowStock: inventoryItems.filter(i => i.quantity < 10).length
            };
        }

        res.json({
            success: true,
            report
        });

    } catch (error) {
        console.error('Generate report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate report',
            error: error.message
        });
    }
});

/**
 * GET /api/admin/users/:id
 * Get detailed user information
 * Requires: Admin role
 */
router.get('/users/:id', verifyToken, authorize('admin'), (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        // Get user's shipments and inventory
        const shipments = db.getShipmentsByCustomerId(req.params.id);
        const inventory = db.getInventoryByCompany(req.params.id);
        const metrics = db.getDashboardMetrics(req.params.id);

        res.json({
            success: true,
            user: {
                ...user,
                password: undefined // Remove password from response
            },
            activity: {
                shipments: {
                    total: shipments.length,
                    active: shipments.filter(s => s.status !== 'delivered' && s.status !== 'cancelled').length,
                    delivered: shipments.filter(s => s.status === 'delivered').length
                },
                inventory: {
                    items: inventory.length,
                    totalQuantity: inventory.reduce((sum, i) => sum + i.quantity, 0)
                },
                metrics
            }
        });

    } catch (error) {
        console.error('Get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve user details',
            error: error.message
        });
    }
});

/**
 * PUT /api/admin/users/:id/status
 * Change user account status
 * Requires: Admin role
 * 
 * Request Body:
 * {
 *   "status": "active|inactive"
 * }
 */
router.put('/users/:id/status', verifyToken, authorize('admin'), (req, res) => {
    try {
        const { status } = req.body;

        if (!status || !['active', 'inactive'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const updated = db.updateUser(req.params.id, { status });

        console.log(`✓ User status changed: ${user.companyName} → ${status}`);

        res.json({
            success: true,
            message: 'User status updated successfully',
            user: updated
        });

    } catch (error) {
        console.error('Update user status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update user status',
            error: error.message
        });
    }
});

module.exports = router;
