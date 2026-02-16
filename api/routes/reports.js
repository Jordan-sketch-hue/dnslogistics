/**
 * Enhanced Reporting Routes
 * 
 * Advanced analytics and reporting endpoints
 * Includes:
 * - Revenue analytics
 * - Delivery performance metrics
 * - Carrier cost analysis
 * - Inventory health checks
 * - Custom report generation
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const { verifyToken } = require('../middleware/auth');

/**
 * GET /api/reports/revenue
 * Revenue analytics for authenticated customer
 * Requires: Authentication
 * 
 * Query Parameters:
 * - period: day|week|month|year (default: month)
 * - startDate: ISO date (optional)
 * - endDate: ISO date (optional)
 */
router.get('/revenue', verifyToken, (req, res) => {
    try {
        const { period = 'month', startDate, endDate } = req.query;
        
        // Get all shipments for user
        const shipments = db.getShipmentsByCustomerId(req.user.id);
        
        // Calculate date range
        const now = new Date();
        let start, end;
        
        if (startDate && endDate) {
            start = new Date(startDate);
            end = new Date(endDate);
        } else {
            end = now;
            start = new Date(now);
            switch(period) {
                case 'day':
                    start.setDate(start.getDate() - 1);
                    break;
                case 'week':
                    start.setDate(start.getDate() - 7);
                    break;
                case 'month':
                    start.setMonth(start.getMonth() - 1);
                    break;
                case 'year':
                    start.setFullYear(start.getFullYear() - 1);
                    break;
            }
        }
        
        // Filter shipments in date range
        const periodShipments = shipments.filter(s => {
            const shipDate = new Date(s.createdAt);
            return shipDate >= start && shipDate <= end;
        });
        
        // Calculate metrics
        const totalRevenue = periodShipments.reduce((sum, s) => sum + (s.rate || 0), 0);
        const deliveredCount = periodShipments.filter(s => s.status === 'delivered').length;
        const cancelledCount = periodShipments.filter(s => s.status === 'cancelled').length;
        
        // Group by week for trend data
        const weeklyData = {};
        periodShipments.forEach(shipment => {
            const date = new Date(shipment.createdAt);
            const weekStart = new Date(date);
            weekStart.setDate(date.getDate() - date.getDay());
            const weekKey = weekStart.toISOString().split('T')[0];
            
            if (!weeklyData[weekKey]) {
                weeklyData[weekKey] = { revenue: 0, count: 0 };
            }
            weeklyData[weekKey].revenue += shipment.rate || 0;
            weeklyData[weekKey].count += 1;
        });
        
        res.json({
            success: true,
            period,
            dateRange: {
                start: start.toISOString(),
                end: end.toISOString()
            },
            revenue: {
                total: totalRevenue.toFixed(2),
                average: periodShipments.length > 0 ? 
                    (totalRevenue / periodShipments.length).toFixed(2) : 0,
                count: periodShipments.length,
                currency: 'USD'
            },
            shipmentStatus: {
                delivered: deliveredCount,
                cancelled: cancelledCount,
                pending: periodShipments.length - deliveredCount - cancelledCount
            },
            trend: Object.entries(weeklyData).map(([week, data]) => ({
                week,
                revenue: data.revenue.toFixed(2),
                shipments: data.count
            }))
        });
        
    } catch (error) {
        console.error('Revenue report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate revenue report'
        });
    }
});

/**
 * GET /api/reports/delivery-performance
 * Delivery performance metrics
 * Requires: Authentication
 */
router.get('/delivery-performance', verifyToken, (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const shipments = db.getShipmentsByCustomerId(req.user.id);
        
        // Calculate delivery stats
        const deliveredShipments = shipments.filter(s => s.status === 'delivered');
        const onTimeShipments = deliveredShipments.filter(s => {
            if (!s.estimatedDelivery || !s.actualDelivery) return false;
            return new Date(s.actualDelivery) <= new Date(s.estimatedDelivery);
        });
        
        const lateShipments = deliveredShipments.filter(s => {
            if (!s.estimatedDelivery || !s.actualDelivery) return false;
            return new Date(s.actualDelivery) > new Date(s.estimatedDelivery);
        });
        
        // Calculate average delivery time
        const deliveryTimes = deliveredShipments
            .filter(s => s.createdAt && s.actualDelivery)
            .map(s => {
                const created = new Date(s.createdAt);
                const delivered = new Date(s.actualDelivery);
                return Math.floor((delivered - created) / (1000 * 60 * 60 * 24)); // days
            });
        
        const avgDeliveryDays = deliveryTimes.length > 0 ?
            (deliveryTimes.reduce((a, b) => a + b, 0) / deliveryTimes.length).toFixed(1) : 0;
        
        // Status breakdown
        const statusBreakdown = {};
        shipments.forEach(s => {
            statusBreakdown[s.status] = (statusBreakdown[s.status] || 0) + 1;
        });
        
        res.json({
            success: true,
            performance: {
                totalShipments: shipments.length,
                deliveredShipments: deliveredShipments.length,
                deliveryRate: ((deliveredShipments.length / shipments.length) * 100).toFixed(2) + '%',
                onTimeDeliveries: onTimeShipments.length,
                onTimeRate: deliveredShipments.length > 0 ?
                    ((onTimeShipments.length / deliveredShipments.length) * 100).toFixed(2) + '%' : 'N/A',
                lateDeliveries: lateShipments.length,
                averageDeliveryDays: avgDeliveryDays
            },
            statusBreakdown
        });
        
    } catch (error) {
        console.error('Delivery performance error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate delivery performance report'
        });
    }
});

/**
 * GET /api/reports/inventory-health
 * Inventory status and health check
 * Requires: Authentication
 */
router.get('/inventory-health', verifyToken, (req, res) => {
    try {
        const inventory = db.getInventoryByCompany(req.user.id);
        
        // Inventory metrics
        const totalItems = inventory.length;
        const activeItems = inventory.filter(i => i.status === 'active').length;
        const totalQuantity = inventory.reduce((sum, i) => sum + i.quantity, 0);
        
        // Low stock items (less than 10 units)
        const lowStockItems = inventory.filter(i => i.quantity < 10 && i.status === 'active');
        
        // Out of stock items
        const outOfStockItems = inventory.filter(i => i.quantity === 0 && i.status === 'active');
        
        // Recently added items (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentItems = inventory.filter(i => new Date(i.createdAt) > thirtyDaysAgo);
        
        // Group by status
        const byStatus = {};
        inventory.forEach(i => {
            byStatus[i.status] = (byStatus[i.status] || 0) + 1;
        });
        
        res.json({
            success: true,
            inventory: {
                totalItems,
                activeItems,
                totalQuantity,
                averageQuantityPerItem: totalItems > 0 ? 
                    (totalQuantity / totalItems).toFixed(2) : 0
            },
            alerts: {
                lowStockCount: lowStockItems.length,
                lowStockItems: lowStockItems.slice(0, 10).map(i => ({
                    id: i.id,
                    name: i.name,
                    sku: i.sku,
                    quantity: i.quantity
                })),
                outOfStockCount: outOfStockItems.length,
                outOfStockItems: outOfStockItems.slice(0, 10).map(i => ({
                    id: i.id,
                    name: i.name,
                    sku: i.sku
                }))
            },
            recentAdditions: recentItems.length,
            statusBreakdown: byStatus
        });
        
    } catch (error) {
        console.error('Inventory health error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate inventory health report'
        });
    }
});

/**
 * GET /api/reports/carrier-costs
 * Carrier cost analysis (by shipment rate/service type)
 * Requires: Authentication
 */
router.get('/carrier-costs', verifyToken, (req, res) => {
    try {
        const { period = 'month' } = req.query;
        const shipments = db.getShipmentsByCustomerId(req.user.id);
        
        // Group by service type
        const byCost = {};
        let totalSpent = 0;
        
        shipments.forEach(s => {
            const service = s.service || 'standard';
            const rate = s.rate || 0;
            
            if (!byCost[service]) {
                byCost[service] = { count: 0, total: 0, average: 0 };
            }
            byCost[service].count += 1;
            byCost[service].total += rate;
            totalSpent += rate;
        });
        
        // Calculate averages
        Object.keys(byCost).forEach(service => {
            byCost[service].average = (byCost[service].total / byCost[service].count).toFixed(2);
            byCost[service].total = byCost[service].total.toFixed(2);
        });
        
        res.json({
            success: true,
            costAnalysis: {
                totalSpent: totalSpent.toFixed(2),
                totalShipments: shipments.length,
                averageCostPerShipment: shipments.length > 0 ? 
                    (totalSpent / shipments.length).toFixed(2) : 0,
                currency: 'USD'
            },
            byServiceType: byCost
        });
        
    } catch (error) {
        console.error('Carrier costs error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate carrier cost report'
        });
    }
});

/**
 * POST /api/reports/custom
 * Generate custom report with specified metrics
 * Requires: Authentication
 * 
 * Request Body:
 * {
 *   "metrics": ["revenue", "delivery", "inventory"],
 *   "period": "month",
 *   "format": "json|csv" (optional, default: json)
 * }
 */
router.post('/custom', verifyToken, (req, res) => {
    try {
        const { metrics = [], period = 'month', format = 'json' } = req.body;
        
        const report = {
            generated: new Date(),
            period,
            user: req.user.companyName,
            metrics: {}
        };
        
        // Generate requested metrics
        if (metrics.includes('revenue')) {
            const shipments = db.getShipmentsByCustomerId(req.user.id);
            const totalRevenue = shipments.reduce((sum, s) => sum + (s.rate || 0), 0);
            report.metrics.revenue = {
                total: totalRevenue.toFixed(2),
                count: shipments.length,
                average: shipments.length > 0 ? (totalRevenue / shipments.length).toFixed(2) : 0
            };
        }
        
        if (metrics.includes('delivery')) {
            const shipments = db.getShipmentsByCustomerId(req.user.id);
            const delivered = shipments.filter(s => s.status === 'delivered').length;
            report.metrics.delivery = {
                totalShipments: shipments.length,
                delivered: delivered,
                rate: shipments.length > 0 ? ((delivered / shipments.length) * 100).toFixed(2) + '%' : '0%'
            };
        }
        
        if (metrics.includes('inventory')) {
            const inventory = db.getInventoryByCompany(req.user.id);
            report.metrics.inventory = {
                totalItems: inventory.length,
                totalQuantity: inventory.reduce((sum, i) => sum + i.quantity, 0)
            };
        }
        
        // Format response
        if (format === 'csv') {
            const csv = convertToCSV(report);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="report.csv"');
            res.send(csv);
        } else {
            res.json({
                success: true,
                report
            });
        }
        
    } catch (error) {
        console.error('Custom report error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate custom report'
        });
    }
});

/**
 * Helper function to convert report to CSV
 */
function convertToCSV(report) {
    let csv = 'Report Generated,' + report.generated + '\n';
    csv += 'Period,' + report.period + '\n';
    csv += 'Company,' + report.user + '\n\n';
    
    Object.entries(report.metrics).forEach(([metricName, metricData]) => {
        csv += 'METRIC,' + metricName.toUpperCase() + '\n';
        Object.entries(metricData).forEach(([key, value]) => {
            csv += key + ',' + value + '\n';
        });
        csv += '\n';
    });
    
    return csv;
}

module.exports = router;
