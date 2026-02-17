/**
 * Inventory Routes
 * D.N Express Logistics - Warehouse Inventory Management
 * 
 * Handles inventory management:
 * - Add items to inventory
 * - Update inventory quantities
 * - Track inventory levels
 * - Manage SKUs and locations
 */
 * - Add items to inventory
 * - Update inventory quantities
 * - Track inventory levels
 * - Manage SKUs
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/inventory
 * Add item to inventory
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "name": "string",
 *   "description": "string (optional)",
 *   "sku": "string (optional - auto-generated if not provided)",
 *   "quantity": number,
 *   "location": "string (optional)"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Item added to inventory",
 *   "item": { inventory item object }
 * }
 */
router.post('/', verifyToken, (req, res) => {
    try {
        const { name, description, sku, quantity, location } = req.body;

        // Validate required fields
        if (!name || quantity === undefined || quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Item name and quantity are required'
            });
        }

        // Check if SKU already exists
        if (sku) {
            const existingSku = db.getInventoryBySku(sku);
            if (existingSku) {
                return res.status(409).json({
                    success: false,
                    message: 'SKU already exists'
                });
            }
        }

        // Create inventory item
        const item = db.addInventoryItem({
            companyId: req.user.id,
            name,
            description,
            sku,
            quantity,
            location
        });

        console.log(`✓ Inventory item added: ${name} (SKU: ${item.sku}) - ${req.user.companyName}`);

        res.status(201).json({
            success: true,
            message: 'Item added to inventory',
            item
        });

    } catch (error) {
        console.error('Add inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to add inventory item',
            error: error.message
        });
    }
});

/**
 * GET /api/inventory
 * Get all inventory items for authenticated customer
 * Requires: Authentication
 * 
 * Query Parameters:
 * - location: filter by location
 * - status: filter by status (active, inactive, discontinued)
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/', verifyToken, (req, res) => {
    try {
        const items = db.getInventoryByCompany(req.user.id);
        const { location, status, limit = 50, offset = 0 } = req.query;

        // Filter by location if provided
        let filtered = items;
        if (location) {
            filtered = items.filter(i => i.location === location);
        }

        // Filter by status if provided
        if (status) {
            filtered = filtered.filter(i => i.status === status);
        }

        // Sort by most recent first
        filtered.sort((a, b) => b.createdAt - a.createdAt);

        // Pagination
        const paginationStart = parseInt(offset);
        const paginationLimit = parseInt(limit);
        const paginated = filtered.slice(paginationStart, paginationStart + paginationLimit);

        res.json({
            success: true,
            items: paginated,
            pagination: {
                total: filtered.length,
                limit: paginationLimit,
                offset: paginationStart,
                returned: paginated.length
            },
            summary: {
                totalItems: items.length,
                totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
                activeItems: items.filter(i => i.status === 'active').length
            }
        });

    } catch (error) {
        console.error('Get inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory',
            error: error.message
        });
    }
});

/**
 * GET /api/inventory/:id
 * Get specific inventory item
 * Requires: Authentication
 */
router.get('/:id', verifyToken, (req, res) => {
    try {
        const item = db.getInventoryItemById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        // Verify ownership
        if (item.companyId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this item'
            });
        }

        res.json({
            success: true,
            item
        });

    } catch (error) {
        console.error('Get inventory item error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve inventory item',
            error: error.message
        });
    }
});

/**
 * PUT /api/inventory/:id
 * Update inventory item
 * Requires: Authentication
 * 
 * Request Body (all fields optional):
 * {
 *   "name": "string",
 *   "description": "string",
 *   "quantity": number,
 *   "location": "string",
 *   "status": "string"
 * }
 */
router.put('/:id', verifyToken, (req, res) => {
    try {
        const item = db.getInventoryItemById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        // Verify ownership
        if (item.companyId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this item'
            });
        }

        const { name, description, quantity, location, status } = req.body;
        const updateData = {};

        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (quantity !== undefined) {
            if (quantity < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Quantity cannot be negative'
                });
            }
            updateData.quantity = quantity;
        }
        if (location !== undefined) updateData.location = location;
        if (status !== undefined) updateData.status = status;

        const updated = db.updateInventory(req.params.id, updateData);

        console.log(`✓ Inventory item updated: ${updated.name} - ${req.user.companyName}`);

        res.json({
            success: true,
            message: 'Inventory item updated successfully',
            item: updated
        });

    } catch (error) {
        console.error('Update inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update inventory item',
            error: error.message
        });
    }
});

/**
 * DELETE /api/inventory/:id
 * Remove inventory item (soft delete - mark as inactive)
 * Requires: Authentication
 */
router.delete('/:id', verifyToken, (req, res) => {
    try {
        const item = db.getInventoryItemById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: 'Inventory item not found'
            });
        }

        // Verify ownership
        if (item.companyId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this item'
            });
        }

        // Soft delete - mark as inactive instead of removing
        const updated = db.updateInventory(req.params.id, { status: 'inactive' });

        console.log(`✓ Inventory item deleted: ${updated.name} - ${req.user.companyName}`);

        res.json({
            success: true,
            message: 'Inventory item removed successfully'
        });

    } catch (error) {
        console.error('Delete inventory error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to delete inventory item',
            error: error.message
        });
    }
});

module.exports = router;
