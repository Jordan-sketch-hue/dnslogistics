/**
 * Status Tracking Routes
 * D.N Express Logistics - Real-time Shipment Status
 * 
 * Handles real-time status updates for shipments:
 * - Update shipment status
 * - Retrieve status history
 * - Track shipment progress
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken, authorize } = require('../middleware/auth');

/**
 * GET /api/status/:shipmentId
 * Get current status and history for a shipment
 * Requires: Authentication
 */
router.get('/:shipmentId', verifyToken, (req, res) => {
    try {
        const shipment = db.getShipmentById(req.params.shipmentId);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Verify ownership or admin
        if (shipment.customerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this shipment status'
            });
        }

        res.json({
            success: true,
            status: {
                shipmentId: shipment.id,
                trackingNumber: shipment.trackingNumber,
                currentStatus: shipment.status,
                statusHistory: shipment.statusHistory,
                estimatedDelivery: shipment.estimatedDelivery,
                actualDelivery: shipment.actualDelivery,
                lastUpdated: shipment.updatedAt
            }
        });

    } catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve shipment status',
            error: error.message
        });
    }
});

/**
 * POST /api/status/:shipmentId
 * Update shipment status
 * Requires: Authentication (staff/admin)
 * 
 * Request Body:
 * {
 *   "status": "string (pending|pickup|in-transit|out-for-delivery|delivered|cancelled)",
 *   "location": "string (optional - current location)",
 *   "notes": "string (optional - additional notes)"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Status updated successfully",
 *   "shipment": { updated shipment object }
 * }
 */
router.post('/:shipmentId', verifyToken, (req, res) => {
    try {
        const { status, location, notes } = req.body;

        // Validate status
        const validStatuses = ['pending', 'pickup', 'in-transit', 'out-for-delivery', 'delivered', 'cancelled'];
        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status',
                validStatuses
            });
        }

        const shipment = db.getShipmentById(req.params.shipmentId);

        if (!shipment) {
            return res.status(404).json({
                success: false,
                message: 'Shipment not found'
            });
        }

        // Verify ownership or admin authorization
        if (shipment.customerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to update this shipment'
            });
        }

        // Update shipment status
        const updated = db.updateShipmentStatus(
            req.params.shipmentId,
            status,
            location || shipment.destination.city,
            notes
        );

        // Create status update record
        const statusUpdate = db.createStatusUpdate({
            shipmentId: req.params.shipmentId,
            companyId: shipment.companyId,
            status,
            location: location || shipment.destination.city,
            notes,
            updatedBy: req.user.email
        });

        console.log(`✓ Shipment status updated: ${shipment.trackingNumber} → ${status}`);

        // Send notification to customer (placeholder for future email/webhook)
        notifyCustomer(shipment, status);

        res.json({
            success: true,
            message: 'Status updated successfully',
            shipment: updated,
            statusUpdate
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update shipment status',
            error: error.message
        });
    }
});

/**
 * GET /api/status/list/:customerId
 * Get all status updates for a customer
 * Requires: Authentication + Authorization
 * 
 * Query Parameters:
 * - limit: number of results (default: 50)
 * - offset: pagination offset (default: 0)
 */
router.get('/list/:customerId', verifyToken, (req, res) => {
    try {
        // Verify ownership or admin
        if (req.params.customerId !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to view this customer\'s status updates'
            });
        }

        const { limit = 50, offset = 0 } = req.query;

        // Get all shipments for customer
        const shipments = db.getShipmentsByCustomerId(req.params.customerId);
        
        // Collect all status updates from all shipments
        const allUpdates = [];
        shipments.forEach(shipment => {
            allUpdates.push(...shipment.statusHistory.map(update => ({
                ...update,
                shipmentId: shipment.id,
                trackingNumber: shipment.trackingNumber
            })));
        });

        // Sort by most recent first
        allUpdates.sort((a, b) => b.timestamp - a.timestamp);

        // Pagination
        const paginationStart = parseInt(offset);
        const paginationLimit = parseInt(limit);
        const paginated = allUpdates.slice(paginationStart, paginationStart + paginationLimit);

        res.json({
            success: true,
            statusUpdates: paginated,
            pagination: {
                total: allUpdates.length,
                limit: paginationLimit,
                offset: paginationStart,
                returned: paginated.length
            }
        });

    } catch (error) {
        console.error('Get status list error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve status updates',
            error: error.message
        });
    }
});

/**
 * Helper function to notify customer of status updates
 * PLACEHOLDER - Integrate with your notification service
 * 
 * Future implementations:
 * - Email notifications via SMTP
 * - SMS notifications via Twilio
 * - Push notifications
 * - Webhook callbacks
 */
function notifyCustomer(shipment, newStatus) {
    // Email template mapping
    const statusMessages = {
        'pending': 'Your shipment has been created and is waiting for pickup',
        'pickup': 'Your shipment has been picked up',
        'in-transit': 'Your shipment is in transit',
        'out-for-delivery': 'Your shipment is out for delivery',
        'delivered': 'Your shipment has been delivered',
        'cancelled': 'Your shipment has been cancelled'
    };

    // Log notification (real implementation would send email/SMS)
    console.log(`
    📧 NOTIFICATION TO SEND:
    ├─ Customer: ${shipment.customerId}
    ├─ Tracking: ${shipment.trackingNumber}
    ├─ Status: ${newStatus}
    └─ Message: ${statusMessages[newStatus]}
    `);

    // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
    // TODO: Add SMS notifications
    // TODO: Add webhook callbacks to notify integrations
}

module.exports = router;
