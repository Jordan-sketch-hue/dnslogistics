/**
 * Database Module
 * D.N Express Logistics - In-Memory Data Store with Persistence
 * 
 * This module manages all data for the application:
 * - Users (Customers/Companies)
 * - Shipments
 * - Inventory
 * - Manifests
 * - Status Updates
 * 
 * IMPORTANT: This uses in-memory storage for development/testing.
 * For production with multiple server instances, migrate to:
 * - PostgreSQL
 * - MySQL
 * - MongoDB
 * - Firebase/Cloud Firestore
 */

const fs = require('fs');
const path = require('path');

class Database {
    constructor() {
        // Data storage
        this.users = [];
        this.shipments = [];
        this.inventory = [];
        this.statusUpdates = [];
        this.manifests = [];
        
        // Load persisted data if available
        this.loadData();
    }

    /**
     * User Management
     */

    /**
     * Generate unique customer number
     * Format: DNX-XXXXXX (e.g., DNX-100001)
     */
    generateCustomerNumber() {
        const prefix = 'DNX';
        const number = String(this.users.length + 100001).padStart(6, '0');
        const customerNumber = `${prefix}-${number}`;
        
        // Ensure uniqueness
        if (this.users.find(u => u.customerNumber === customerNumber)) {
            return this.generateCustomerNumber();
        }
        
        return customerNumber;
    }

    /**
     * Generate warehouse shipping address for customer
     * This is the USA address customers use to ship their packages
     */
    generateWarehouseAddress(customerNumber, customerName) {
        return {
            customerNumber: customerNumber,
            recipientName: customerName,
            companyName: 'D.N Express Logistics',
            street1: '4651 NW 72nd Avenue',
            street2: `Suite 101 - ${customerNumber}`,
            city: 'Miami',
            state: 'FL',
            zipCode: '33166',
            country: 'USA',
            fullAddress: `${customerName}\nAccount: ${customerNumber}\nD.N Express Logistics\n4651 NW 72nd Avenue, Suite 101\nMiami, FL 33166\nUSA`
        };
    }

    createUser(userData) {
        const userId = this.generateId();
        const customerNumber = this.generateCustomerNumber();
        const customerName = `${userData.firstName} ${userData.lastName}`;
        const warehouseAddress = this.generateWarehouseAddress(customerNumber, customerName);
        
        const user = {
            id: userId,
            customerNumber: customerNumber,
            companyName: userData.companyName,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // Should be hashed (null for OAuth users)
            role: userData.role || 'customer',
            status: userData.status || 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
            // OAuth provider IDs
            googleId: userData.googleId || null,
            facebookId: userData.facebookId || null,
            profile: {
                address: userData.address || '',
                city: userData.city || '',
                state: userData.state || '',
                zipCode: userData.zipCode || '',
                country: userData.country || '',
                businessType: userData.businessType || '',
                photoURL: userData.profile?.photoURL || null,
                authProvider: userData.profile?.authProvider || 'email',
                ...userData.profile
            },
            warehouseAddress: warehouseAddress,
            settings: {
                currency: 'USD',
                language: 'en',
                timezone: 'UTC',
                notifications: true
            },
            // Sethwan integration fields (populated when integrated)
            sethwan: {
                customerId: null,
                accountId: null,
                apiKey: null,
                defaultWarehouse: null,
                integrated: false
            }
        };

        this.users.push(user);
        this.saveData();
        return user;
    }

    getUserById(userId) {
        return this.users.find(u => u.id === userId);
    }

    getUserByEmail(email) {
        return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    updateUser(userId, updateData) {
        const user = this.getUserById(userId);
        if (!user) return null;

        Object.assign(user, updateData, { updatedAt: new Date() });
        this.saveData();
        return user;
    }

    getAllUsers() {
        return this.users.map(u => {
            const { password, ...userWithoutPassword } = u;
            return userWithoutPassword;
        });
    }

    /**
     * Get user by customer number
     */
    getUserByCustomerNumber(customerNumber) {
        return this.users.find(u => u.customerNumber === customerNumber);
    }

    /**
     * Shipment Management
     */

    createShipment(shipmentData) {
        const shipment = {
            id: this.generateId(),
            trackingNumber: this.generateTrackingNumber(),
            customerId: shipmentData.customerId,
            companyId: shipmentData.companyId,
            origin: {
                address: shipmentData.origin.address,
                city: shipmentData.origin.city,
                state: shipmentData.origin.state,
                zipCode: shipmentData.origin.zipCode,
                country: shipmentData.origin.country,
                contactName: shipmentData.origin.contactName || '',
                contactPhone: shipmentData.origin.contactPhone || ''
            },
            destination: {
                address: shipmentData.destination.address,
                city: shipmentData.destination.city,
                state: shipmentData.destination.state,
                zipCode: shipmentData.destination.zipCode,
                country: shipmentData.destination.country,
                contactName: shipmentData.destination.contactName || '',
                contactPhone: shipmentData.destination.contactPhone || ''
            },
            package: {
                weight: shipmentData.package.weight, // in lbs
                dimensions: shipmentData.package.dimensions || {
                    length: 0,
                    width: 0,
                    height: 0
                },
                description: shipmentData.package.description || '',
                contents: shipmentData.package.contents || []
            },
            service: shipmentData.service || 'standard', // standard, express, overnight
            rate: shipmentData.rate || 0,
            status: 'pending', // pending, pickup, in-transit, out-for-delivery, delivered, cancelled
            statusHistory: [{
                status: 'pending',
                timestamp: new Date(),
                location: shipmentData.origin.city,
                notes: 'Shipment created'
            }],
            createdAt: new Date(),
            updatedAt: new Date(),
            estimatedDelivery: null,
            actualDelivery: null,
            notes: shipmentData.notes || ''
        };

        this.shipments.push(shipment);
        this.saveData();
        return shipment;
    }

    getShipmentById(shipmentId) {
        return this.shipments.find(s => s.id === shipmentId);
    }

    getShipmentByTrackingNumber(trackingNumber) {
        return this.shipments.find(s => s.trackingNumber === trackingNumber);
    }

    getShipmentsByCustomerId(customerId) {
        return this.shipments.filter(s => s.customerId === customerId);
    }

    updateShipmentStatus(shipmentId, newStatus, location, notes) {
        const shipment = this.getShipmentById(shipmentId);
        if (!shipment) return null;

        shipment.status = newStatus;
        shipment.statusHistory.push({
            status: newStatus,
            timestamp: new Date(),
            location: location || '',
            notes: notes || ''
        });
        shipment.updatedAt = new Date();

        if (newStatus === 'delivered') {
            shipment.actualDelivery = new Date();
        }

        this.saveData();
        return shipment;
    }

    getAllShipments() {
        return this.shipments;
    }

    /**
     * Inventory Management
     */

    addInventoryItem(inventoryData) {
        const item = {
            id: this.generateId(),
            companyId: inventoryData.companyId,
            name: inventoryData.name,
            description: inventoryData.description || '',
            sku: inventoryData.sku || this.generateSKU(),
            quantity: inventoryData.quantity || 0,
            location: inventoryData.location || '',
            status: 'active', // active, inactive, discontinued
            lastUpdated: new Date(),
            createdAt: new Date()
        };

        this.inventory.push(item);
        this.saveData();
        return item;
    }

    getInventoryItemById(itemId) {
        return this.inventory.find(i => i.id === itemId);
    }

    getInventoryBySku(sku) {
        return this.inventory.find(i => i.sku === sku);
    }

    getInventoryByCompany(companyId) {
        return this.inventory.filter(i => i.companyId === companyId);
    }

    updateInventory(itemId, updateData) {
        const item = this.getInventoryItemById(itemId);
        if (!item) return null;

        Object.assign(item, updateData, { lastUpdated: new Date() });
        this.saveData();
        return item;
    }

    /**
     * Status Updates
     */

    createStatusUpdate(statusData) {
        const update = {
            id: this.generateId(),
            shipmentId: statusData.shipmentId,
            companyId: statusData.companyId,
            status: statusData.status,
            location: statusData.location || '',
            timestamp: new Date(),
            notes: statusData.notes || '',
            updatedBy: statusData.updatedBy || 'system'
        };

        this.statusUpdates.push(update);
        this.saveData();
        return update;
    }

    getStatusUpdatesByShipment(shipmentId) {
        return this.statusUpdates
            .filter(s => s.shipmentId === shipmentId)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    /**
     * Utility Methods
     */

    generateId() {
        return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateTrackingNumber() {
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substr(2, 5).toUpperCase();
        return `DNE${timestamp}${random}`;
    }

    generateSKU() {
        return 'SKU-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    }

    /**
     * Data Persistence
     */

    saveData() {
        // In production, this would write to a real database
        // For now, we'll keep data in memory
        // To add file persistence, uncomment below:
        /*
        try {
            const dataPath = path.join(__dirname, 'database.json');
            const data = {
                users: this.users,
                shipments: this.shipments,
                inventory: this.inventory,
                statusUpdates: this.statusUpdates,
                manifests: this.manifests,
                lastSaved: new Date()
            };
            fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
        } catch (error) {
            console.error('Error saving data:', error);
        }
        */
    }

    loadData() {
        // In production, this would load from a real database
        // For now, we'll start with empty data
        // To add file persistence, uncomment below:
        /*
        try {
            const dataPath = path.join(__dirname, 'database.json');
            if (fs.existsSync(dataPath)) {
                const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
                this.users = data.users || [];
                this.shipments = data.shipments || [];
                this.inventory = data.inventory || [];
                this.statusUpdates = data.statusUpdates || [];
                this.manifests = data.manifests || [];
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
        */
    }

    /**
     * Analytics & Reporting
     */

    getDashboardMetrics(companyId) {
        const userShipments = this.shipments.filter(s => s.companyId === companyId);
        const activeShipments = userShipments.filter(s => 
            s.status !== 'delivered' && s.status !== 'cancelled'
        );
        const deliveredShipments = userShipments.filter(s => s.status === 'delivered');

        return {
            totalShipments: userShipments.length,
            activeShipments: activeShipments.length,
            deliveredShipments: deliveredShipments.length,
            totalRevenue: userShipments.reduce((acc, s) => acc + (s.rate || 0), 0),
            inventoryItems: this.inventory.filter(i => i.companyId === companyId).length,
            lastUpdated: new Date()
        };
    }

    generateReport(companyId, startDate, endDate) {
        const shipments = this.shipments.filter(s => 
            s.companyId === companyId &&
            s.createdAt >= startDate &&
            s.createdAt <= endDate
        );

        return {
            companyId,
            dateRange: { startDate, endDate },
            totalShipments: shipments.length,
            totalRevenue: shipments.reduce((acc, s) => acc + (s.rate || 0), 0),
            shipmentsByStatus: this.groupByStatus(shipments),
            averageRate: shipments.length > 0 ? 
                shipments.reduce((acc, s) => acc + (s.rate || 0), 0) / shipments.length : 0,
            generatedAt: new Date()
        };
    }

    groupByStatus(shipments) {
        return shipments.reduce((acc, s) => {
            acc[s.status] = (acc[s.status] || 0) + 1;
            return acc;
        }, {});
    }

    /**
     * Manifest Management
     */

    createManifest(manifestData) {
        const manifest = {
            id: this.generateId(),
            manifestNumber: this.generateManifestNumber(),
            companyId: manifestData.companyId,
            shipmentIds: manifestData.shipmentIds,
            manifestType: manifestData.manifestType || 'standard',
            destination: manifestData.destination || '',
            status: 'pending', // pending, submitted, approved, rejected
            shipmentCount: manifestData.shipmentIds.length,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        if (!this.manifests) {
            this.manifests = [];
        }

        this.manifests.push(manifest);
        this.saveData();
        return manifest;
    }

    getManifestById(manifestId) {
        if (!this.manifests) return null;
        return this.manifests.find(m => m.id === manifestId);
    }

    getManifestsByCompany(companyId) {
        if (!this.manifests) return [];
        return this.manifests.filter(m => m.companyId === companyId);
    }

    updateManifestStatus(manifestId, status) {
        const manifest = this.getManifestById(manifestId);
        if (!manifest) return null;

        manifest.status = status;
        manifest.updatedAt = new Date();
        this.saveData();
        return manifest;
    }

    generateManifestNumber() {
        const prefix = 'MNF';
        const date = new Date().toISOString().split('-').join('').substring(0, 8);
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        return `${prefix}-${date}-${random}`;
    }
}

// Create and export singleton instance
const db = new Database();

module.exports = db;
