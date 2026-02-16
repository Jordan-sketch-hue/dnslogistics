/**
 * Manifest Routes
 * 
 * Handles generation of shipping manifests for customs/delivery
 * Supports:
 * - Asycuda manifests (for international shipping)
 * - Standard shipping manifests
 * - Bulk manifest generation
 * - Manifest tracking and status
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const sethwan = require('../middleware/sethwan');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/manifests
 * Create a new manifest
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "shipmentIds": ["id1", "id2"],  // Array of shipment IDs to include
 *   "manifestType": "asycuda|standard",
 *   "destination": "country_code"
 * }
 */
router.post('/', verifyToken, (req, res) => {
    try {
        const { shipmentIds, manifestType = 'standard', destination } = req.body;

        if (!shipmentIds || !Array.isArray(shipmentIds) || shipmentIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Shipment IDs array is required'
            });
        }

        // Get all shipments and validate they belong to user
        const shipments = shipmentIds.map(id => {
            const shipment = db.getShipmentById(id);
            if (!shipment || shipment.companyId !== req.user.id) {
                throw new Error(`Shipment ${id} not found or unauthorized`);
            }
            return shipment;
        });

        // Generate manifest
        const manifest = db.createManifest({
            companyId: req.user.id,
            shipmentIds,
            shipments,
            manifestType,
            destination
        });

        console.log(`✓ Manifest created: ${manifest.id} (${shipmentIds.length} shipments) - ${req.user.companyName}`);

        res.status(201).json({
            success: true,
            message: 'Manifest created successfully',
            manifest: {
                id: manifest.id,
                manifestNumber: manifest.manifestNumber,
                type: manifest.manifestType,
                shipmentCount: manifest.shipmentIds.length,
                status: manifest.status,
                createdAt: manifest.createdAt,
                PDF_URL: `/api/manifests/${manifest.id}/pdf`
            }
        });

    } catch (error) {
        console.error('Create manifest error:', error);
        res.status(400).json({
            success: false,
            message: error.message || 'Failed to create manifest'
        });
    }
});

/**
 * GET /api/manifests/:manifestId
 * Get manifest details
 * Requires: Authentication
 */
router.get('/:manifestId', verifyToken, (req, res) => {
    try {
        const manifest = db.getManifestById(req.params.manifestId);

        if (!manifest || manifest.companyId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Manifest not found'
            });
        }

        res.json({
            success: true,
            manifest
        });

    } catch (error) {
        console.error('Get manifest error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve manifest'
        });
    }
});

/**
 * GET /api/manifests/:manifestId/pdf
 * Download manifest as PDF
 * Requires: Authentication
 */
router.get('/:manifestId/pdf', verifyToken, (req, res) => {
    try {
        const manifest = db.getManifestById(req.params.manifestId);

        if (!manifest || manifest.companyId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Manifest not found'
            });
        }

        // Generate PDF content
        const pdfContent = generateManifestPDF(manifest);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="manifest-${manifest.manifestNumber}.pdf"`);
        res.send(pdfContent);

    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate PDF'
        });
    }
});

/**
 * GET /api/manifests
 * List all manifests for authenticated user
 * Requires: Authentication
 */
router.get('/', verifyToken, (req, res) => {
    try {
        const { status, type, limit = 50, offset = 0 } = req.query;

        let manifests = db.getManifestsByCompany(req.user.id);

        // Filter by status if provided
        if (status) {
            manifests = manifests.filter(m => m.status === status);
        }

        // Filter by type if provided
        if (type) {
            manifests = manifests.filter(m => m.manifestType === type);
        }

        // Apply pagination
        const total = manifests.length;
        manifests = manifests.slice(offset, offset + parseInt(limit));

        res.json({
            success: true,
            total,
            count: manifests.length,
            offset: parseInt(offset),
            limit: parseInt(limit),
            manifests: manifests.map(m => ({
                id: m.id,
                manifestNumber: m.manifestNumber,
                type: m.manifestType,
                status: m.status,
                shipmentCount: m.shipmentIds.length,
                createdAt: m.createdAt,
                updatedAt: m.updatedAt
            }))
        });

    } catch (error) {
        console.error('List manifests error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve manifests'
        });
    }
});

/**
 * PATCH /api/manifests/:manifestId/status
 * Update manifest status
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "status": "pending|submitted|approved|rejected"
 * }
 */
router.patch('/:manifestId/status', verifyToken, (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['pending', 'submitted', 'approved', 'rejected'];

        if (!status || !validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Valid status is required'
            });
        }

        const manifest = db.getManifestById(req.params.manifestId);

        if (!manifest || manifest.companyId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Manifest not found'
            });
        }

        const updated = db.updateManifestStatus(req.params.manifestId, status);

        console.log(`✓ Manifest status updated: ${manifest.manifestNumber} → ${status}`);

        res.json({
            success: true,
            message: 'Manifest status updated',
            manifest: updated
        });

    } catch (error) {
        console.error('Update manifest status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update manifest'
        });
    }
});

/**
 * POST /api/manifests/:manifestId/submit-to-sethwan
 * Submit manifest to Sethwan for processing
 * Requires: Authentication
 */
router.post('/:manifestId/submit-to-sethwan', verifyToken, (req, res) => {
    try {
        const manifest = db.getManifestById(req.params.manifestId);

        if (!manifest || manifest.companyId !== req.user.id) {
            return res.status(404).json({
                success: false,
                message: 'Manifest not found'
            });
        }

        // Get user's Sethwan integration info
        const user = db.getUserById(req.user.id);
        if (!user.sethwan.integrated) {
            return res.status(400).json({
                success: false,
                message: 'Sethwan integration not configured'
            });
        }

        // Prepare manifest data for Sethwan
        const manifestData = {
            manifest_number: manifest.manifestNumber,
            shipment_ids: manifest.shipmentIds,
            type: manifest.manifestType,
            destination: manifest.destination,
            warehouse_id: user.sethwan.defaultWarehouse
        };

        // In production, this would call Sethwan's manifest API
        // For now, we'll update the status and return success
        db.updateManifestStatus(req.params.manifestId, 'submitted');

        console.log(`✓ Manifest submitted to Sethwan: ${manifest.manifestNumber}`);

        res.json({
            success: true,
            message: 'Manifest submitted to Sethwan',
            manifestNumber: manifest.manifestNumber,
            status: 'submitted'
        });

    } catch (error) {
        console.error('Submit to Sethwan error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to submit manifest'
        });
    }
});

/**
 * Helper function to generate manifest PDF
 * In production, use a library like 'pdfkit' or 'html-pdf'
 */
function generateManifestPDF(manifest) {
    // Placeholder - in production use actual PDF generation library
    const content = `
SHIPPING MANIFEST
Manifest Number: ${manifest.manifestNumber}
Created: ${new Date(manifest.createdAt).toLocaleDateString()}
Type: ${manifest.manifestType}
Status: ${manifest.status}

Shipments Included: ${manifest.shipmentIds.length}
${manifest.shipmentIds.map(id => `- ${id}`).join('\n')}
    `;
    return Buffer.from(content);
}

module.exports = router;
