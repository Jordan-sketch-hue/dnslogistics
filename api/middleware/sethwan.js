/**
 * Sethwan API Integration Middleware
 * D.N Express Logistics - Warehouse Platform Integration
 * 
 * This middleware handles communication with the Sethwan logistics platform.
 * Sethwan is a courier/warehouse management system that offers:
 * - Shipment tracking
 * - Package management
 * - Manifest generation
 * - Pricing integration
 * - Warehouse operations
 * 
 * This module translates between our internal data format and Sethwan's API format.
 */

const axios = require('axios');
const db = require('../models/database');

class SethwanIntegration {
    constructor() {
        this.baseURL = process.env.SETHWAN_API_URL || 'https://api.sethwan.com';
        this.apiKey = process.env.SETHWAN_API_KEY;
        this.accountId = process.env.SETHWAN_ACCOUNT_ID;
    }

    /**
     * Validate Sethwan credentials and connection
     * Tests if API key and account are valid
     */
    async validateConnection() {
        try {
            const response = await axios.get(`${this.baseURL}/v1/account/validate`, {
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'X-Account-ID': this.accountId
                }
            });

            return {
                success: true,
                valid: response.status === 200,
                account: response.data.account,
                features: response.data.features
            };
        } catch (error) {
            console.error('Sethwan validation error:', error.message);
            return {
                success: false,
                valid: false,
                error: error.message
            };
        }
    }

    /**
     * Convert internal shipment format to Sethwan format
     * @param {Object} shipment - Internal shipment object
     * @returns {Object} Sethwan-formatted shipment
     */
    convertToSethwanFormat(shipment) {
        return {
            tracking_number: shipment.trackingNumber,
            shipper: {
                name: shipment.customerId, // Would be customer name ideally
                address: `${shipment.origin.address}, ${shipment.origin.city}, ${shipment.origin.state} ${shipment.origin.zipCode}`,
                country: shipment.origin.country || 'USA'
            },
            receiver: {
                name: shipment.destination.contactName || 'Recipient',
                address: `${shipment.destination.address}, ${shipment.destination.city}, ${shipment.destination.state} ${shipment.destination.zipCode}`,
                country: shipment.destination.country || 'USA'
            },
            package: {
                weight: shipment.package.weight,
                length: shipment.package.dimensions?.length || 0,
                width: shipment.package.dimensions?.width || 0,
                height: shipment.package.dimensions?.height || 0,
                description: shipment.package.description,
                contents: shipment.package.contents
            },
            service_type: this.mapServiceType(shipment.service),
            status: this.mapStatus(shipment.status),
            created_at: shipment.createdAt,
            updated_at: shipment.updatedAt
        };
    }

    /**
     * Convert Sethwan shipment response to internal format
     * @param {Object} sethwanShipment - Sethwan shipment object
     * @returns {Object} Internal format shipment
     */
    convertFromSethwanFormat(sethwanShipment) {
        return {
            trackingNumber: sethwanShipment.tracking_number,
            status: this.reverseMapStatus(sethwanShipment.status),
            estimatedDelivery: sethwanShipment.estimated_delivery,
            sethwanId: sethwanShipment.id,
            sethwanData: sethwanShipment // Store raw Sethwan data for reference
        };
    }

    /**
     * Map internal service types to Sethwan service types
     */
    mapServiceType(service) {
        const mapping = {
            'standard': 'standard_shipping',
            'express': 'express_shipping',
            'overnight': 'overnight_shipping',
            'priority': 'priority_shipping'
        };
        return mapping[service] || 'standard_shipping';
    }

    /**
     * Map internal status to Sethwan status
     */
    mapStatus(status) {
        const mapping = {
            'pending': 'pending',
            'pickup': 'picked_up',
            'in-transit': 'in_transit',
            'out-for-delivery': 'out_for_delivery',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
        };
        return mapping[status] || 'pending';
    }

    /**
     * Reverse map Sethwan status to internal status
     */
    reverseMapStatus(sethwanStatus) {
        const mapping = {
            'pending': 'pending',
            'picked_up': 'pickup',
            'in_transit': 'in-transit',
            'out_for_delivery': 'out-for-delivery',
            'delivered': 'delivered',
            'cancelled': 'cancelled'
        };
        return mapping[sethwanStatus] || 'pending';
    }

    /**
     * Send shipment to Sethwan
     * @param {Object} shipment - Internal shipment object
     * @returns {Object} Response from Sethwan
     */
    async sendShipmentToSethwan(shipment) {
        try {
            const sethwanShipment = this.convertToSethwanFormat(shipment);
            
            const response = await axios.post(
                `${this.baseURL}/v1/shipments`,
                sethwanShipment,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Account-ID': this.accountId,
                        'Content-Type': 'application/json'
                    }
                }
            );

            return {
                success: true,
                sethwanId: response.data.id,
                sethwanTrackingNumber: response.data.tracking_number,
                data: response.data
            };
        } catch (error) {
            console.error('Error sending shipment to Sethwan:', error.message);
            return {
                success: false,
                error: error.message,
                details: error.response?.data
            };
        }
    }

    /**
     * Get shipment tracking from Sethwan
     * @param {String} trackingNumber - Sethwan tracking number
     * @returns {Object} Tracking information
     */
    async getShipmentTracking(trackingNumber) {
        try {
            const response = await axios.get(
                `${this.baseURL}/v1/shipments/track/${trackingNumber}`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Account-ID': this.accountId
                    }
                }
            );

            const converted = this.convertFromSethwanFormat(response.data);
            return {
                success: true,
                shipment: converted
            };
        } catch (error) {
            console.error('Error fetching tracking from Sethwan:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get warehouses available for the account
     */
    async getWarehouses() {
        try {
            const response = await axios.get(
                `${this.baseURL}/v1/warehouses`,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Account-ID': this.accountId
                    }
                }
            );

            return {
                success: true,
                warehouses: response.data.data || response.data
            };
        } catch (error) {
            console.error('Error fetching warehouses:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get pricing from Sethwan based on shipment details
     */
    async getShippingRate(shipmentDetails) {
        try {
            const response = await axios.post(
                `${this.baseURL}/v1/rates/calculate`,
                {
                    from: {
                        address: shipmentDetails.fromAddress,
                        country: shipmentDetails.fromCountry || 'USA'
                    },
                    to: {
                        address: shipmentDetails.toAddress,
                        country: shipmentDetails.toCountry
                    },
                    package: {
                        weight: shipmentDetails.weight,
                        length: shipmentDetails.length,
                        width: shipmentDetails.width,
                        height: shipmentDetails.height
                    },
                    service_type: shipmentDetails.serviceType || 'standard_shipping'
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Account-ID': this.accountId
                    }
                }
            );

            return {
                success: true,
                rate: response.data.rate,
                currency: response.data.currency || 'USD',
                estimatedDelivery: response.data.estimated_delivery
            };
        } catch (error) {
            console.error('Error calculating rate:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Sync customer warehouse address with Sethwan
     */
    async syncCustomerWarehouse(user) {
        try {
            const warehouseData = {
                customer_id: user.customerNumber,
                name: user.companyName,
                address: user.warehouseAddress.street1,
                city: user.warehouseAddress.city,
                state: user.warehouseAddress.state,
                zip_code: user.warehouseAddress.zipCode,
                country: user.warehouseAddress.country,
                phone: user.phone,
                email: user.email
            };

            const response = await axios.post(
                `${this.baseURL}/v1/customer-warehouses`,
                warehouseData,
                {
                    headers: {
                        'Authorization': `Bearer ${this.apiKey}`,
                        'X-Account-ID': this.accountId
                    }
                }
            );

            // Update user with Sethwan warehouse ID
            db.updateUser(user.id, {
                sethwan: {
                    ...user.sethwan,
                    defaultWarehouse: response.data.id,
                    integrated: true
                }
            });

            return {
                success: true,
                warehouseId: response.data.id
            };
        } catch (error) {
            console.error('Error syncing warehouse:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new SethwanIntegration();
