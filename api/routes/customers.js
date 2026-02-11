/**
 * Customer Routes
 * 
 * GET    /api/customers/:id      - Get customer profile
 * PUT    /api/customers/:id      - Update customer profile
 * GET    /api/customers/:id/info - Get detailed customer info
 * DELETE /api/customers/:id      - Deactivate account
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken, authorizeOwner } = require('../middleware/auth');
const { formatUserResponse, sanitizeInput } = require('../utils/auth');

/**
 * GET /api/customers/:id
 * Get customer profile
 * Requires: Authentication
 */
router.get('/:id', verifyToken, authorizeOwner, (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        res.json({
            success: true,
            user: formatUserResponse(user)
        });

    } catch (error) {
        console.error('Get customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve customer profile',
            error: error.message
        });
    }
});

/**
 * PUT /api/customers/:id
 * Update customer profile
 * Requires: Authentication + Owner authorization
 * 
 * Request Body (all fields optional):
 * {
 *   "firstName": "string",
 *   "lastName": "string",
 *   "phone": "string",
 *   "companyName": "string",
 *   "profile": {
 *     "address": "string",
 *     "city": "string",
 *     "state": "string",
 *     "zipCode": "string",
 *     "country": "string",
 *     "businessType": "string"
 *   },
 *   "settings": {
 *     "currency": "string",
 *     "language": "string",
 *     "timezone": "string",
 *     "notifications": boolean
 *   }
 * }
 */
router.put('/:id', verifyToken, authorizeOwner, (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Sanitize input
        const sanitized = sanitizeInput(req.body);

        // Update allowed fields only
        const allowedFields = ['firstName', 'lastName', 'phone', 'companyName', 'profile', 'settings'];
        const updateData = {};

        allowedFields.forEach(field => {
            if (field in sanitized) {
                updateData[field] = sanitized[field];
            }
        });

        // Update user
        const updatedUser = db.updateUser(req.params.id, updateData);

        console.log(`✓ Customer profile updated: ${updatedUser.companyName}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: formatUserResponse(updatedUser)
        });

    } catch (error) {
        console.error('Update customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update customer profile',
            error: error.message
        });
    }
});

/**
 * GET /api/customers/:id/info
 * Get detailed customer information including shipments and inventory
 * Requires: Authentication + Owner authorization
 */
router.get('/:id/info', verifyToken, authorizeOwner, (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Get customer's shipments
        const shipments = db.getShipmentsByCustomerId(req.params.id);
        const inventory = db.getInventoryByCompany(req.params.id);
        const metrics = db.getDashboardMetrics(req.params.id);

        res.json({
            success: true,
            user: formatUserResponse(user),
            summary: {
                totalShipments: shipments.length,
                totalInventoryItems: inventory.length,
                ...metrics
            },
            recentShipments: shipments.slice(-5).reverse(), // Last 5 shipments
            inventoryCount: inventory.length
        });

    } catch (error) {
        console.error('Get customer info error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve customer information',
            error: error.message
        });
    }
});

/**
 * DELETE /api/customers/:id
 * Deactivate customer account
 * Requires: Authentication + Owner authorization
 */
router.delete('/:id', verifyToken, authorizeOwner, (req, res) => {
    try {
        const user = db.getUserById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Customer not found'
            });
        }

        // Don't actually delete, just deactivate
        const updatedUser = db.updateUser(req.params.id, { status: 'inactive' });

        console.log(`✓ Customer account deactivated: ${updatedUser.companyName}`);

        res.json({
            success: true,
            message: 'Account deactivated successfully'
        });

    } catch (error) {
        console.error('Delete customer error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to deactivate account',
            error: error.message
        });
    }
});

module.exports = router;
