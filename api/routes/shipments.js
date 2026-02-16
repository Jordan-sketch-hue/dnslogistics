/**
 * Shipment Routes
 * 
 * Handles all shipment-related operations:
 * - Create shipments
 * - Track shipments
 * - Update shipment status
 * - View shipment history
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/shipments
 * Create new shipment
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "origin": {
 *     "address": "string",
 *     "city": "string",
 *     "state": "string",
 *     "zipCode": "string",
 *     "country": "string",
 *     "contactName": "string (optional)",
 *     "contactPhone": "string (optional)"
 *   },
 *   "destination": {
 *     "address": "string",
 *     "city": "string",
 *     "state": "string",
 *     "zipCode": "string",
 *     "country": "string",
 *     "contactName": "string (optional)",
 *     "contactPhone": "string (optional)"
 *   },
 *   "package": {
 *     "weight": number,
 *     "dimensions": { "length": number, "width": number, "height": number },
 *     "description": "string",
 *     "contents": ["string"]
 *   },
 *   "service": "standard|express|overnight",
 *   "rate": number (optional),
 *   "notes": "string (optional)"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Shipment created successfully",
 *   "shipment": { shipment object }
 * }
 */
router.post('/', verifyToken, (req, res) => {
    try {
        const { origin, destination, package: pkg, service, rate, notes } = req.body;

        // Validate required fields
        if (!origin || !destination || !pkg) {
            return res.status(400).json({
                success: false,
                message: 'Missing required shipment information'
            });
        }

        // Validate origin
        if (!origin.address || !origin.city || !origin.state || !origin.zipCode || !origin.country) {
            return res.status(400).json({
                success: false,
                message: 'Invalid origin address'
            });
        }

        // Validate destination
        if (!destination.address || !destination.city || !destination.state || !destination.zipCode || !destination.country) {
            return res.status(400).json({
                success: false,
                message: 'Invalid destination address'
            });
        }

        // Validate package
        if (!pkg.weight || pkg.weight <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Invalid package weight'
            });
        }

        // Create shipment
        const shipment = db.createShipment({
            customerId: req.user.id,
            companyId: req.user.id,
            origin,
            destination,
            package: pkg,
            service: service || 'standard',
            rate: rate || 0,
            notes
        });

        console.log(`✓ New shipment created: ${shipment.trackingNumber} - ${req.user.companyName}`);

        res.status(201).json({
            success: true,
            message: 'Shipment created successfully',
            shipment
        });

    } catch (error) {
        console.error('Create shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create shipment',
            error: error.message
        });
    }
});

/**
 * GET /api/shipments
 * Get all shipments for authenticated customer
 * Requires: Authentication
 * 
 * Query Parameters:
 * - status: filter by status
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/', verifyToken, (req, res) => {
    try {
        const shipments = db.getShipmentsByCustomerId(req.user.id);
        const { status, limit = 50, offset = 0 } = req.query;

        // Filter by status if provided
        let filtered = shipments;
        if (status) {
            filtered = shipments.filter(s => s.status === status);
        }

        // Sort by most recent first
        filtered.sort((a, b) => b.createdAt - a.createdAt);

        // Pagination
        const paginationStart = parseInt(offset);
        const paginationLimit = parseInt(limit);
        const paginated = filtered.slice(paginationStart, paginationStart + paginationLimit);

        res.json({
            success: true,
            shipments: paginated,
            pagination: {
                total: filtered.length,
                limit: paginationLimit,
                offset: paginationStart,
                returned: paginated.length
            }
        });

    } catch (error) {
        console.error('Get shipments error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shipments',
            error: error.message
        });
    }
});

/**
 * GET /api/shipments/track/:trackingNumber
 * Public tracking endpoint - no authentication required
 * Get shipment by tracking number
 * 
 * This allows customers to track their packages
 * IMPORTANT: Must be defined BEFORE /:id route to avoid route collision
 */
router.get('/track/:trackingNumber', (req, res) => {
    try {
        const shipment = db.getShipmentByTrackingNumber(req.params.trackingNumber);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Return status history without sensitive customer data
        res.json({
            success: true,
            shipment: {
                trackingNumber: shipment.trackingNumber,
                status: shipment.status,
                origin: {
                    city: shipment.origin.city,
                    state: shipment.origin.state,
                    country: shipment.origin.country
                },
                destination: {
                    city: shipment.destination.city,
                    state: shipment.destination.state,
                    country: shipment.destination.country
                },
                statusHistory: shipment.statusHistory,
                estimatedDelivery: shipment.estimatedDelivery,
                actualDelivery: shipment.actualDelivery,
                createdAt: shipment.createdAt
            }
        });

    } catch (error) {
        console.error('Track shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to track shipment',
            error: error.message
        });
    }
});

/**
 * GET /api/shipments/:id
 * Get shipment details
 * Requires: Authentication
 */
router.get('/:id', verifyToken, (req, res) => {
    try {
        const shipment = db.getShipmentById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Verify ownership
        if (shipment.customerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this shipment'
            });
        }

        res.json({
            success: true,
            shipment
        });

    } catch (error) {
        console.error('Get shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shipment',
            error: error.message
        });
    }
});

/**
 * PUT /api/shipments/:id
 * Update shipment
 * Requires: Authentication
 * 
 * Can update:
 * - notes
 * - service level
 * - estimated delivery
 */
router.put('/:id', verifyToken, (req, res) => {
    try {
        const shipment = db.getShipmentById(req.params.id);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Verify ownership
        if (shipment.customerId !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this shipment'
            });
        }

        // Only allow updating if shipment is in pending status
        if (shipment.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update shipment that is already in transit'
            });
        }

        const { notes, service } = req.body;
        const updateData = {};

        if (notes !== undefined) updateData.notes = notes;
        if (service !== undefined) updateData.service = service;

        const updated = db.updateUser(req.params.id, updateData);

        res.json({
            success: true,
            message: 'Shipment updated successfully',
            shipment: updated
        });

    } catch (error) {
        console.error('Update shipment error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shipment',
            error: error.message
        });
    }
});

module.exports = router;
