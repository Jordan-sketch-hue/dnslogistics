# Sethwan API Integration Layer - Implementation Guide

**Status:** Ready to Implement
**Date:** February 2026
**Scope:** Complete API integration with Sethwan backend

---

## 1. Sethwan API Client (To Create)

### File: `api/utils/sethwanClient.js`

```javascript
/**
 * Sethwan API Client
 * Handles all communication with Sethwan Courier & Warehouse Platform
 * All customer data, tracking, invoicing, and warehouse operations flow through this
 */

const axios = require('axios');

class SethwanAPIClient {
    constructor() {
        this.baseURL = process.env.SETHWAN_API_URL || 'https://api.sethwan.com/v1';
        this.apiKey = process.env.SETHWAN_API_KEY;
        this.accountId = process.env.SETHWAN_ACCOUNT_ID;
        
        this.client = axios.create({
            baseURL: this.baseURL,
            headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'X-Account-ID': this.accountId,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * AUTHENTICATION METHODS
     */

    /**
     * Register new customer account in Sethwan
     * Called when D.N Express customer creates account
     */
    async registerCustomer(customerData) {
        try {
            const response = await this.client.post('/customers/register', {
                companyName: customerData.companyName,
                email: customerData.email,
                phone: customerData.phone,
                address: customerData.address,
                paymentMethod: customerData.paymentMethod,
                currency: customerData.currency || 'JMD',
                serviceType: customerData.serviceType || ['courier'],
                webhookUrl: `${process.env.API_URL}/webhooks/sethwan`,
                customReference: customerData.dnExpressCustomerId
            });
            
            return {
                success: true,
                sethwanCustomerId: response.data.customerId,
                sethwanAccountId: response.data.accountId,
                defaultWarehouse: response.data.defaultWarehouse,
                apiKey: response.data.apiKey,
                data: response.data
            };
        } catch (error) {
            console.error('Sethwan registration error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * SHIPMENT OPERATIONS
     */

    /**
     * Get real-time quote from Sethwan
     * Customer sees exact price before committing
     */
    async getShipmentQuote(quoteData) {
        try {
            const response = await this.client.post('/shipments/quote', {
                customerId: quoteData.sethwanCustomerId,
                origin: {
                    name: quoteData.origin.name,
                    address: quoteData.origin.address,
                    phone: quoteData.origin.phone,
                    email: quoteData.origin.email
                },
                destination: {
                    name: quoteData.destination.name,
                    address: quoteData.destination.address,
                    phone: quoteData.destination.phone,
                    email: quoteData.destination.email
                },
                package: {
                    weight: quoteData.package.weight,
                    length: quoteData.package.length,
                    width: quoteData.package.width,
                    height: quoteData.package.height,
                    weightUnit: quoteData.package.weightUnit || 'kg',
                    dimensionUnit: quoteData.package.dimensionUnit || 'cm',
                    description: quoteData.package.description
                },
                serviceType: quoteData.serviceType || 'standard',
                insuranceRequired: quoteData.insuranceRequired || false
            });
            
            return {
                success: true,
                quoteId: response.data.quoteId,
                estimatedCost: response.data.estimatedCost,
                insuranceCost: response.data.insuranceCost || 0,
                totalCost: response.data.estimatedCost + (response.data.insuranceCost || 0),
                estimatedDelivery: response.data.estimatedDelivery,
                breakdownCosts: response.data.breakdownCosts,
                currency: response.data.currency,
                validUntil: response.data.validUntil,
                serviceDetails: response.data.serviceDetails
            };
        } catch (error) {
            console.error('Sethwan quote error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Create shipment in Sethwan
     * After customer confirms quote
     */
    async createShipment(shipmentData) {
        try {
            const response = await this.client.post('/shipments/create', {
                quoteId: shipmentData.quoteId,
                customerId: shipmentData.sethwanCustomerId,
                paymentMethodId: shipmentData.paymentMethodId,
                chargeImmediately: shipmentData.chargeImmediately !== false,
                insureShipment: shipmentData.insureShipment || false,
                specialHandling: shipmentData.specialHandling || [],
                customNotes: shipmentData.customNotes || '',
                referenceNumber: shipmentData.dnExpressShipmentId,
                metadata: {
                    dnExpressCustomerId: shipmentData.dnExpressCustomerId,
                    dnExpressShipmentId: shipmentData.dnExpressShipmentId
                }
            });
            
            return {
                success: true,
                shipmentId: response.data.shipmentId,
                trackingNumber: response.data.trackingNumber,
                waybillNumber: response.data.waybillNumber,
                status: response.data.status,
                invoice: response.data.invoice,
                pickupSchedule: response.data.pickupSchedule,
                label: response.data.label,
                data: response.data
            };
        } catch (error) {
            console.error('Sethwan shipment create error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get shipment details from Sethwan
     * Shows current status, location, expected delivery
     */
    async getShipment(shipmentId) {
        try {
            const response = await this.client.get(`/shipments/${shipmentId}`);
            
            return {
                success: true,
                shipment: response.data
            };
        } catch (error) {
            console.error('Sethwan get shipment error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * List customer's shipments
     * Shows all shipments with pagination
     */
    async listShipments(customerId, filters = {}) {
        try {
            const response = await this.client.get('/shipments', {
                params: {
                    customerId,
                    status: filters.status,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    limit: filters.limit || 50,
                    offset: filters.offset || 0
                }
            });
            
            return {
                success: true,
                shipments: response.data.shipments,
                total: response.data.total,
                limit: response.data.limit,
                offset: response.data.offset
            };
        } catch (error) {
            console.error('Sethwan list shipments error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Update shipment (change delivery instructions, etc)
     */
    async updateShipment(shipmentId, updates) {
        try {
            const response = await this.client.put(`/shipments/${shipmentId}`, updates);
            
            return {
                success: true,
                shipment: response.data
            };
        } catch (error) {
            console.error('Sethwan update shipment error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Cancel shipment
     */
    async cancelShipment(shipmentId) {
        try {
            const response = await this.client.post(`/shipments/${shipmentId}/cancel`);
            
            return {
                success: true,
                message: response.data.message
            };
        } catch (error) {
            console.error('Sethwan cancel shipment error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * TRACKING METHODS
     */

    /**
     * Get tracking information (public)
     * Customer can track without account
     */
    async getPublicTracking(trackingNumber) {
        try {
            const response = await this.client.get(`/tracking/${trackingNumber}`, {
                headers: {
                    'Authorization': undefined // No auth needed for public tracking
                }
            });
            
            return {
                success: true,
                tracking: response.data
            };
        } catch (error) {
            console.error('Sethwan public tracking error:', error);
            return {
                success: false,
                error: 'Tracking number not found or invalid'
            };
        }
    }

    /**
     * Get detailed tracking events
     */
    async getDetailedTracking(shipmentId) {
        try {
            const response = await this.client.get(`/tracking/${shipmentId}/events`);
            
            return {
                success: true,
                events: response.data.events,
                timeline: response.data.timeline
            };
        } catch (error) {
            console.error('Sethwan detailed tracking error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * INVOICE METHODS
     */

    /**
     * Create invoice for shipment
     * Automatic when shipment is created
     */
    async createInvoice(shipmentId, customerId) {
        try {
            const response = await this.client.post('/invoices/create', {
                shipmentId,
                customerId,
                autoEmail: true
            });
            
            return {
                success: true,
                invoiceId: response.data.invoiceId,
                invoiceNumber: response.data.invoiceNumber,
                amount: response.data.amount,
                dueDate: response.data.dueDate
            };
        } catch (error) {
            console.error('Sethwan create invoice error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get invoice details
     */
    async getInvoice(invoiceId) {
        try {
            const response = await this.client.get(`/invoices/${invoiceId}`);
            
            return {
                success: true,
                invoice: response.data
            };
        } catch (error) {
            console.error('Sethwan get invoice error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * List invoices for customer
     */
    async listInvoices(customerId, filters = {}) {
        try {
            const response = await this.client.get('/invoices', {
                params: {
                    customerId,
                    status: filters.status,
                    dateFrom: filters.dateFrom,
                    dateTo: filters.dateTo,
                    limit: filters.limit || 50,
                    offset: filters.offset || 0
                }
            });
            
            return {
                success: true,
                invoices: response.data.invoices,
                total: response.data.total,
                totalAmount: response.data.totalAmount,
                paidAmount: response.data.paidAmount,
                pendingAmount: response.data.pendingAmount
            };
        } catch (error) {
            console.error('Sethwan list invoices error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Download invoice as PDF
     */
    async downloadInvoicePDF(invoiceId) {
        try {
            const response = await this.client.get(`/invoices/${invoiceId}/pdf`, {
                responseType: 'arraybuffer'
            });
            
            return {
                success: true,
                pdf: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            console.error('Sethwan invoice PDF error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * LABEL METHODS
     */

    /**
     * Generate shipping label
     */
    async generateLabel(shipmentId) {
        try {
            const response = await this.client.post(`/labels/generate`, {
                shipmentId
            });
            
            return {
                success: true,
                labelId: response.data.labelId,
                trackingNumber: response.data.trackingNumber,
                url: response.data.url,
                printUrl: response.data.printUrl
            };
        } catch (error) {
            console.error('Sethwan generate label error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Download label as PDF
     */
    async downloadLabelPDF(labelId) {
        try {
            const response = await this.client.get(`/labels/${labelId}/pdf`, {
                responseType: 'arraybuffer'
            });
            
            return {
                success: true,
                pdf: response.data,
                contentType: response.headers['content-type']
            };
        } catch (error) {
            console.error('Sethwan label PDF error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Batch print labels
     */
    async batchPrintLabels(shipmentIds) {
        try {
            const response = await this.client.post('/labels/batch-print', {
                shipmentIds
            });
            
            return {
                success: true,
                batchId: response.data.batchId,
                labelCount: response.data.labelCount,
                printUrl: response.data.printUrl
            };
        } catch (error) {
            console.error('Sethwan batch print error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * MANIFEST METHODS
     */

    /**
     * Create customs manifest (for Jamaica Asycuda)
     */
    async createManifest(manifestData) {
        try {
            const response = await this.client.post('/manifests/create', {
                customerId: manifestData.customerId,
                shipmentIds: manifestData.shipmentIds,
                manifestType: manifestData.manifestType || 'asycuda', // Jamaica customs
                destinationCountry: manifestData.destinationCountry,
                totalValue: manifestData.totalValue,
                notes: manifestData.notes
            });
            
            return {
                success: true,
                manifestId: response.data.manifestId,
                manifestNumber: response.data.manifestNumber,
                status: response.data.status,
                document: response.data.document
            };
        } catch (error) {
            console.error('Sethwan create manifest error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get manifest details
     */
    async getManifest(manifestId) {
        try {
            const response = await this.client.get(`/manifests/${manifestId}`);
            
            return {
                success: true,
                manifest: response.data
            };
        } catch (error) {
            console.error('Sethwan get manifest error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Submit manifest to customs authorities
     */
    async submitManifest(manifestId) {
        try {
            const response = await this.client.post(`/manifests/${manifestId}/submit`);
            
            return {
                success: true,
                message: 'Manifest submitted to customs',
                referenceNumber: response.data.referenceNumber
            };
        } catch (error) {
            console.error('Sethwan submit manifest error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * PAYMENT METHODS
     */

    /**
     * Process Stripe payment
     * D.N Express collects, then pays Sethwan
     */
    async processPayment(paymentData) {
        try {
            const response = await this.client.post('/payments/process', {
                invoiceId: paymentData.invoiceId,
                amount: paymentData.amount,
                paymentMethod: paymentData.paymentMethod,
                stripeToken: paymentData.stripeToken,
                metadata: {
                    dnExpressCustomerId: paymentData.dnExpressCustomerId
                }
            });
            
            return {
                success: true,
                paymentId: response.data.paymentId,
                status: response.data.status,
                transactionId: response.data.transactionId
            };
        } catch (error) {
            console.error('Sethwan payment error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * REPORT METHODS
     */

    /**
     * Get revenue report
     */
    async getRevenueReport(customerId, timeframe = 'month') {
        try {
            const response = await this.client.get('/reports/revenue', {
                params: { customerId, timeframe }
            });
            
            return {
                success: true,
                report: response.data
            };
        } catch (error) {
            console.error('Sethwan revenue report error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * Get delivery metrics
     */
    async getDeliveryMetrics(customerId, timeframe = 'month') {
        try {
            const response = await this.client.get('/reports/delivery-metrics', {
                params: { customerId, timeframe }
            });
            
            return {
                success: true,
                metrics: response.data
            };
        } catch (error) {
            console.error('Sethwan delivery metrics error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }

    /**
     * WEBHOOK REGISTRATION
     */

    /**
     * Register webhook for real-time updates
     */
    async registerWebhook(url, events = ['shipment.*']) {
        try {
            const response = await this.client.post('/webhooks/register', {
                url,
                events,
                active: true
            });
            
            return {
                success: true,
                webhookId: response.data.webhookId,
                secret: response.data.secret
            };
        } catch (error) {
            console.error('Sethwan webhook register error:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message
            };
        }
    }
}

module.exports = new SethwanAPIClient();
```

---

## 2. New Routes to Create

### File: `api/routes/sethwan-integration.js`

```javascript
/**
 * Sethwan Integration Routes
 * Routes that directly call Sethwan API
 */

const express = require('express');
const router = express.Router();
const sethwan = require('../utils/sethwanClient');
const db = require('../models/database');
const { verifyToken, authorize } = require('../middleware/auth');

/**
 * POST /api/sethwan/shipments/quote
 * Get real-time quote from Sethwan
 */
router.post('/shipments/quote', verifyToken, async (req, res) => {
    try {
        const { origin, destination, package, serviceType } = req.body;
        
        // Get customer's Sethwan ID from D.N Express database
        const customer = db.getUserById(req.user.id);
        
        const quote = await sethwan.getShipmentQuote({
            sethwanCustomerId: customer.sethwanCustomerId,
            origin,
            destination,
            package,
            serviceType
        });
        
        if (!quote.success) {
            return res.status(400).json(quote);
        }
        
        res.json(quote);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Quote generation failed',
            error: error.message
        });
    }
});

/**
 * POST /api/sethwan/shipments/create
 * Create shipment in Sethwan (with payment)
 */
router.post('/shipments/create', verifyToken, async (req, res) => {
    try {
        const { quoteId, paymentMethodId, insureShipment, specialHandling } = req.body;
        const customer = db.getUserById(req.user.id);
        const shipmentId = db.generateShipmentId();
        
        // Create in Sethwan
        const shipment = await sethwan.createShipment({
            quoteId,
            sethwanCustomerId: customer.sethwanCustomerId,
            paymentMethodId,
            insureShipment,
            specialHandling,
            dnExpressCustomerId: customer.id,
            dnExpressShipmentId: shipmentId,
            chargeImmediately: true
        });
        
        if (!shipment.success) {
            return res.status(400).json(shipment);
        }
        
        // Store in D.N Express database
        const newShipment = db.createShipment({
            id: shipmentId,
            customerId: customer.id,
            sethwanShipmentId: shipment.shipmentId,
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            invoice: shipment.invoice
        });
        
        res.status(201).json({
            success: true,
            shipment: newShipment,
            sethwanData: shipment
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Shipment creation failed',
            error: error.message
        });
    }
});

/**
 * GET /api/sethwan/invoices
 * List customer's invoices from Sethwan
 */
router.get('/invoices', verifyToken, async (req, res) => {
    try {
        const customer = db.getUserById(req.user.id);
        const { status, dateFrom, dateTo } = req.query;
        
        const invoices = await sethwan.listInvoices(customer.sethwanCustomerId, {
            status,
            dateFrom,
            dateTo,
            limit: 50
        });
        
        if (!invoices.success) {
            return res.status(400).json(invoices);
        }
        
        res.json(invoices);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Invoice retrieval failed',
            error: error.message
        });
    }
});

/**
 * GET /api/sethwan/invoices/:id/pdf
 * Download invoice as PDF
 */
router.get('/invoices/:id/pdf', verifyToken, async (req, res) => {
    try {
        const pdf = await sethwan.downloadInvoicePDF(req.params.id);
        
        if (!pdf.success) {
            return res.status(400).json(pdf);
        }
        
        res.contentType('application/pdf');
        res.send(pdf.pdf);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'PDF download failed',
            error: error.message
        });
    }
});

/**
 * POST /api/sethwan/labels/generate
 * Generate shipping label
 */
router.post('/labels/generate', verifyToken, async (req, res) => {
    try {
        const { shipmentId } = req.body;
        const customer = db.getUserById(req.user.id);
        const shipment = db.getShipmentById(shipmentId);
        
        // Verify ownership
        if (shipment.customerId !== customer.id) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to access this shipment'
            });
        }
        
        const label = await sethwan.generateLabel(shipment.sethwanShipmentId);
        
        if (!label.success) {
            return res.status(400).json(label);
        }
        
        res.json(label);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Label generation failed',
            error: error.message
        });
    }
});

/**
 * POST /api/sethwan/manifests/create
 * Create customs manifest
 */
router.post('/manifests/create', verifyToken, async (req, res) => {
    try {
        const { shipmentIds, manifestType, destinationCountry, totalValue } = req.body;
        const customer = db.getUserById(req.user.id);
        
        const manifest = await sethwan.createManifest({
            customerId: customer.sethwanCustomerId,
            shipmentIds,
            manifestType,
            destinationCountry,
            totalValue
        });
        
        if (!manifest.success) {
            return res.status(400).json(manifest);
        }
        
        res.status(201).json(manifest);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Manifest creation failed',
            error: error.message
        });
    }
});

module.exports = router;
```

---

## 3. Webhook Handler

### File: `api/routes/webhooks.js` (New)

```javascript
/**
 * Webhook Handler
 * Receives real-time events from Sethwan
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');

/**
 * POST /api/webhooks/sethwan
 * Receive tracking updates from Sethwan
 */
router.post('/sethwan', async (req, res) => {
    try {
        const { event, timestamp, shipmentId, trackingNumber, status, details } = req.body;
        
        // Find shipment in D.N Express database
        const shipment = db.getShipmentBySethwanId(shipmentId);
        
        if (!shipment) {
            console.warn('Received event for unknown shipment:', shipmentId);
            return res.status(404).json({ success: false });
        }
        
        // Handle different event types
        switch (event) {
            case 'shipment.pre_alert':
                handlePreAlert(shipment, details);
                break;
            case 'shipment.picked_up':
                handlePickup(shipment, details);
                break;
            case 'shipment.in_transit':
                handleInTransit(shipment, details);
                break;
            case 'shipment.arrived_warehouse':
                handleWarehouseArrive(shipment, details);
                break;
            case 'shipment.out_for_delivery':
                handleOutForDelivery(shipment, details);
                break;
            case 'shipment.delivered':
                handleDelivered(shipment, details);
                break;
            case 'shipment.cancelled':
                handleCancelled(shipment, details);
                break;
        }
        
        // Update shipment status in D.N Express database
        db.updateShipmentStatus(shipment.id, status);
        
        // Store event in tracking history
        db.createStatusUpdate(shipment.id, {
            status,
            location: details.location,
            timestamp,
            description: getEventDescription(event),
            proofUrl: details.proofOfDelivery?.photo
        });
        
        // Send notification to customer
        notifyCustomer(shipment, event, details);
        
        res.json({ success: true, received: true });
    } catch (error) {
        console.error('Webhook error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * Handle pre-alert event
 */
function handlePreAlert(shipment, details) {
    // Customer should confirm availability or reschedule
    console.log(`Pre-alert: ${shipment.id} - Pickup scheduled for ${details.pickupSchedule.time}`);
}

/**
 * Handle pickup event
 */
function handlePickup(shipment, details) {
    // Shipment is on its way
    console.log(`Picked up: ${shipment.id}`);
}

/**
 * Handle in-transit event
 */
function handleInTransit(shipment, details) {
    // Shipment moving through network
    console.log(`In transit: ${shipment.id}`);
}

/**
 * Handle warehouse arrival
 */
function handleWarehouseArrive(shipment, details) {
    // Arrived at facility
    console.log(`Warehouse arrival: ${shipment.id} at ${details.warehouseName}`);
}

/**
 * Handle out for delivery
 */
function handleOutForDelivery(shipment, details) {
    // Driver picked up shipment
    console.log(`Out for delivery: ${shipment.id} with ${details.deliveryDriver.name}`);
}

/**
 * Handle delivered event
 */
function handleDelivered(shipment, details) {
    // Shipment delivered
    console.log(`Delivered: ${shipment.id} to ${details.recipientName}`);
}

/**
 * Handle cancelled event
 */
function handleCancelled(shipment, details) {
    // Shipment cancelled
    console.log(`Cancelled: ${shipment.id}`);
}

/**
 * Get human-readable event description
 */
function getEventDescription(event) {
    const descriptions = {
        'shipment.pre_alert': 'Pickup scheduled',
        'shipment.picked_up': 'Shipment picked up',
        'shipment.in_transit': 'In transit',
        'shipment.arrived_warehouse': 'Arrived at facility',
        'shipment.out_for_delivery': 'Out for delivery',
        'shipment.delivered': 'Delivered',
        'shipment.cancelled': 'Cancelled'
    };
    return descriptions[event] || event;
}

/**
 * Notify customer of shipment update
 */
function notifyCustomer(shipment, event, details) {
    // Send email, SMS, push notification, etc.
    // Integration with notification service
    console.log(`Notifying customer: ${shipment.customerId} about ${event}`);
}

module.exports = router;
```

---

## 4. Updated server.js

Add these routes to `server.js`:

```javascript
const sethwanIntegration = require('./api/routes/sethwan-integration');
const webhooks = require('./api/routes/webhooks');

// Register new routes
app.use('/api/sethwan', sethwanIntegration);
app.use('/api/webhooks', webhooks);
```

---

## 5. Environment Variables to Add (.env)

```env
# Sethwan API Configuration
SETHWAN_API_URL=https://api.sethwan.com/v1
SETHWAN_API_KEY=sk_live_xxxxxxxxxxxx
SETHWAN_ACCOUNT_ID=SETH_xxxxxxxxxxxx

# Payment Processing
STRIPE_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx

# Email Service
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@dnexpress.com

# SMS Service (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1876xxxxxxx

# Webhook Configuration
WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
API_URL=https://dnexpress.com
```

---

This complete API integration layer is ready to implement!
