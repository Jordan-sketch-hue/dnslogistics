# D.N Express CRM - Complete UI/UX Component Guide

**Status:** Ready to Implement
**Level:** Production-Ready HTML/CSS/JavaScript
**Scope:** 8 New Pages + Component Library

---

## 🎨 UI/UX Architecture

### Color Scheme (D.N Express Branding)
```
Primary Navy:       #0E244C
Accent Red:         #D4262A
Royal Blue:         #1A4F9B
Light Gray:         #F5F7FA
Border Gray:        #E1E5ED
Success Green:      #27AE60
Warning Orange:     #F39C12
Danger Red:         #E74C3C
Info Blue:          #3498DB
```

### Typography
```
Headlines:  Bebas Neue (font-weight: 700)
Body:       Montserrat (font-weight: 400)
Details:    Open Sans (font-weight: 400)
```

---

## 📱 Screen 1: Enhanced Dashboard (Update Existing)

### New Dashboard Layout

```html
<!-- Dashboard Header Widget Row -->
<section class="dashboard-header-widgets">
  
  <!-- Widget 1: Revenue This Month -->
  <div class="widget widget-revenue">
    <div class="widget-header">
      <h3>Revenue This Month</h3>
      <span class="trend trend-up">↑ 12%</span>
    </div>
    <div class="widget-value">JMD 45,000</div>
    <div class="widget-chart" id="revenue-chart"></div>
  </div>

  <!-- Widget 2: Shipments Status -->
  <div class="widget widget-shipments">
    <div class="widget-header">
      <h3>Shipments Status</h3>
    </div>
    <div class="status-breakdown">
      <div class="status-item">
        <span class="status-label">In Transit</span>
        <span class="status-count">12</span>
        <div class="status-bar" style="background: #3498DB; width: 60%"></div>
      </div>
      <div class="status-item">
        <span class="status-label">Pending Pickup</span>
        <span class="status-count">3</span>
        <div class="status-bar" style="background: #F39C12; width: 15%"></div>
      </div>
      <div class="status-item">
        <span class="status-label">Delivered Today</span>
        <span class="status-count">8</span>
        <div class="status-bar" style="background: #27AE60; width: 40%"></div>
      </div>
    </div>
  </div>

  <!-- Widget 3: Pending Payments -->
  <div class="widget widget-payments">
    <div class="widget-header">
      <h3>Pending Payments</h3>
      <a href="/invoices" class="widget-link">View All →</a>
    </div>
    <div class="payment-item">
      <span class="invoice-number">INV-2026-00156</span>
      <span class="payment-amount">JMD 2,500</span>
      <span class="payment-status overdue">OVERDUE - 5 DAYS</span>
      <button class="btn-pay-now">Pay Now</button>
    </div>
    <div class="payment-item">
      <span class="invoice-number">INV-2026-00157</span>
      <span class="payment-amount">JMD 3,200</span>
      <span class="payment-status pending">DUE IN 3 DAYS</span>
      <button class="btn-pay-now">Pay Now</button>
    </div>
  </div>

  <!-- Widget 4: Active Shipments Tracking Map -->
  <div class="widget widget-map" style="grid-column: 1 / -1">
    <div class="widget-header">
      <h3>Real-Time Tracking Map</h3>
      <button class="btn-fullscreen">Fullscreen</button>
    </div>
    <div id="tracking-map" style="height: 400px; background: #f0f0f0; border-radius: 8px">
      <!-- Google Maps embedded here -->
    </div>
    <div class="active-drivers">
      <div class="driver-card">
        <div class="driver-avatar">MJ</div>
        <div class="driver-info">
          <div class="driver-name">Michael Johnson</div>
          <div class="driver-status">3 shipments in transit</div>
        </div>
        <div class="driver-location">Kingston → Montego Bay</div>
      </div>
    </div>
  </div>

</section>
```

### CSS for Dashboard Widgets

```css
.dashboard-header-widgets {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.widget {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #1A4F9B;
}

.widget-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.widget-header h3 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 18px;
  color: #0E244C;
  margin: 0;
}

.widget-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 36px;
  color: #D4262A;
  font-weight: 700;
}

.trend {
  font-size: 14px;
  color: #27AE60;
  font-weight: 600;
}

.trend.trend-down {
  color: #E74C3C;
}

.status-breakdown {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.status-item {
  display: grid;
  grid-template-columns: 150px 40px 1fr;
  align-items: center;
  gap: 10px;
}

.status-label {
  font-size: 13px;
  color: #666;
}

.status-count {
  font-weight: 700;
  font-size: 16px;
  color: #0E244C;
}

.status-bar {
  height: 6px;
  border-radius: 3px;
}

.payment-item {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 15px;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #E1E5ED;
}

.payment-item:last-child {
  border-bottom: none;
}

.invoice-number {
  font-weight: 600;
  color: #0E244C;
  font-size: 14px;
}

.payment-amount {
  font-weight: 700;
  color: #D4262A;
  min-width: 80px;
  text-align: right;
}

.payment-status {
  font-size: 11px;
  font-weight: 700;
  padding: 4px 8px;
  border-radius: 4px;
  white-space: nowrap;
}

.payment-status.pending {
  background: #FFF3CD;
  color: #856404;
}

.payment-status.overdue {
  background: #FFE8E8;
  color: #721C24;
}

.widget-map {
  grid-column: 1 / -1;
}

#tracking-map {
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 15px;
}

.active-drivers {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 12px;
}

.driver-card {
  background: #F5F7FA;
  padding: 12px;
  border-radius: 6px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.driver-avatar {
  width: 40px;
  height: 40px;
  background: #1A4F9B;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  flex-shrink: 0;
}

.driver-name {
  font-weight: 600;
  color: #0E244C;
  font-size: 14px;
}

.driver-status {
  font-size: 12px;
  color: #666;
}

.driver-location {
  font-size: 12px;
  color: #1A4F9B;
  font-weight: 600;
}
```

---

## 📄 Screen 2: Invoices Management Page

### HTML Structure

```html
<div class="page-container">
  <div class="page-header">
    <h1>Invoices & Billing</h1>
    <div class="header-actions">
      <input type="text" placeholder="Search invoices..." class="search-input">
      <select class="filter-select">
        <option>All Invoices</option>
        <option>Paid</option>
        <option>Pending</option>
        <option>Overdue</option>
      </select>
      <button class="btn-primary">Download All as PDF</button>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="invoice-summary">
    <div class="summary-card">
      <div class="summary-label">Total Invoiced</div>
      <div class="summary-value">JMD 125,000</div>
      <div class="summary-trend">+8% from last month</div>
    </div>
    <div class="summary-card">
      <div class="summary-label">Total Paid</div>
      <div class="summary-value">JMD 95,000</div>
      <div class="summary-trend">76% payment rate</div>
    </div>
    <div class="summary-card highlight">
      <div class="summary-label">Amount Due</div>
      <div class="summary-value">JMD 30,000</div>
      <div class="summary-trend">5 invoices pending</div>
    </div>
  </div>

  <!-- Invoices Table -->
  <div class="invoices-list">
    <table class="data-table">
      <thead>
        <tr>
          <th>Invoice #</th>
          <th>Created Date</th>
          <th>Shipment</th>
          <th>Amount</th>
          <th>Due Date</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr class="status-overdue">
          <td>
            <strong>INV-2026-00156</strong>
          </td>
          <td>Feb 8, 2026</td>
          <td>
            <a href="#" class="tracking-link">DN20260212ABC123</a>
          </td>
          <td><strong>JMD 2,500</strong></td>
          <td>Feb 12, 2026</td>
          <td>
            <span class="badge badge-danger">OVERDUE 5 DAYS</span>
          </td>
          <td>
            <button class="btn-icon" title="Download PDF">📥</button>
            <button class="btn-icon btn-primary" title="Pay Now">💳</button>
            <button class="btn-icon" title="Email Invoice">✉️</button>
          </td>
        </tr>
        <tr class="status-pending">
          <td>
            <strong>INV-2026-00157</strong>
          </td>
          <td>Feb 10, 2026</td>
          <td>
            <a href="#" class="tracking-link">DN20260213DEF456</a>
          </td>
          <td><strong>JMD 3,200</strong></td>
          <td>Feb 17, 2026</td>
          <td>
            <span class="badge badge-warning">DUE IN 3 DAYS</span>
          </td>
          <td>
            <button class="btn-icon" title="Download PDF">📥</button>
            <button class="btn-icon btn-primary" title="Pay Now">💳</button>
            <button class="btn-icon" title="Email Invoice">✉️</button>
          </td>
        </tr>
        <tr class="status-paid">
          <td>
            <strong>INV-2026-00155</strong>
          </td>
          <td>Feb 5, 2026</td>
          <td>
            <a href="#" class="tracking-link">DN20260211GHI789</a>
          </td>
          <td><strong>JMD 1,800</strong></td>
          <td>Feb 10, 2026</td>
          <td>
            <span class="badge badge-success">PAID</span>
          </td>
          <td>
            <button class="btn-icon" title="Download PDF">📥</button>
            <button class="btn-icon" title="View Receipt">🧾</button>
            <button class="btn-icon" title="Email Invoice">✉️</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
```

### Invoice CSS

```css
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #E1E5ED;
}

.page-header h1 {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 32px;
  color: #0E244C;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.search-input,
.filter-select {
  padding: 10px 15px;
  border: 1px solid #E1E5ED;
  border-radius: 6px;
  font-family: 'Montserrat', sans-serif;
  font-size: 14px;
}

.invoice-summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 30px;
}

.summary-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  border-left: 4px solid #1A4F9B;
}

.summary-card.highlight {
  border-left-color: #D4262A;
  background: linear-gradient(135deg, #fff8f8 0%, #ffffff 100%);
}

.summary-label {
  font-size: 13px;
  color: #999;
  font-weight: 600;
  margin-bottom: 8px;
}

.summary-value {
  font-family: 'Bebas Neue', sans-serif;
  font-size: 28px;
  color: #0E244C;
  font-weight: 700;
  margin-bottom: 5px;
}

.summary-trend {
  font-size: 12px;
  color: #27AE60;
  font-weight: 600;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.data-table th {
  background: #F5F7FA;
  padding: 15px;
  text-align: left;
  font-weight: 600;
  color: #0E244C;
  font-size: 13px;
  border-bottom: 1px solid #E1E5ED;
}

.data-table td {
  padding: 15px;
  border-bottom: 1px solid #E1E5ED;
}

.data-table tr:hover {
  background: #F9FAFC;
}

.status-overdue {
  border-left: 3px solid #E74C3C;
}

.status-pending {
  border-left: 3px solid #F39C12;
}

.status-paid {
  border-left: 3px solid #27AE60;
}

.badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}

.badge-success {
  background: #D4EDDA;
  color: #155724;
}

.badge-warning {
  background: #FFF3CD;
  color: #856404;
}

.badge-danger {
  background: #FFE8E8;
  color: #721C24;
}

.btn-icon {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 5px 8px;
  border-radius: 4px;
  transition: background 0.2s;
}

.btn-icon:hover {
  background: #E1E5ED;
}

.btn-icon.btn-primary {
  color: #D4262A;
}
```

---

## 🏷️ Screen 3: Labels Management

```html
<div class="page-container">
  <div class="page-header">
    <h1>Shipping Labels</h1>
    <div class="header-actions">
      <button class="btn btn-primary">Generate New Labels</button>
      <button class="btn btn-secondary">Batch Print</button>
    </div>
  </div>

  <!-- Labels Grid -->
  <div class="labels-grid">
    
    <!-- Label Card -->
    <div class="label-card">
      <div class="label-preview">
        <img src="label-preview.jpg" alt="Label Preview">
      </div>
      <div class="label-details">
        <div class="label-header">
          <strong>DN20260212ABC123</strong>
          <span class="badge-success">READY TO PRINT</span>
        </div>
        <div class="label-info">
          <p><strong>From:</strong> Kingston, Jamaica</p>
          <p><strong>To:</strong> Montego Bay, Jamaica</p>
          <p><strong>Created:</strong> Feb 12, 2026</p>
        </div>
        <div class="label-actions">
          <button class="btn btn-small btn-primary">Print Label</button>
          <button class="btn btn-small">Download PDF</button>
          <button class="btn btn-small">Replace Label</button>
        </div>
      </div>
    </div>

  </div>

  <!-- Cloud Printing Queue -->
  <div class="print-queue-section">
    <h3>Print Queue Status</h3>
    <div class="print-queue">
      <div class="queue-item">
        <span>3 documents pending</span>
        <button class="btn btn-small">Send to Printer</button>
      </div>
    </div>
  </div>
</div>
```

---

## 📋 Screen 4: Manifests

```html
<div class="page-container">
  <div class="page-header">
    <h1>Customs Manifests (Asycuda)</h1>
    <button class="btn btn-primary">Create New Manifest</button>
  </div>

  <!-- Manifests Table -->
  <table class="data-table">
    <thead>
      <tr>
        <th>Manifest #</th>
        <th>Packages</th>
        <th>Destination</th>
        <th>Created Date</th>
        <th>Status</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td><strong>MF-2026-001</strong></td>
        <td>15 packages</td>
        <td>Montego Bay</td>
        <td>Feb 10, 2026</td>
        <td><span class="badge badge-success">SUBMITTED</span></td>
        <td>
          <button class="btn-icon">📥 Download</button>
          <button class="btn-icon">📧 Email</button>
        </td>
      </tr>
    </tbody>
  </table>
</div>
```

---

## 📊 Screen 5: Real-Time Tracking Map

```html
<div class="page-container">
  <div class="page-header">
    <h1>Real-Time Tracking</h1>
  </div>

  <div class="tracking-layout">
    
    <!-- Map Section (Left) -->
    <div class="tracking-map-section">
      <div id="full-tracking-map" style="height: 600px; background: #f0f0f0"></div>
    </div>

    <!-- Sidebar (Right) -->
    <div class="tracking-sidebar">
      
      <!-- Active Shipment -->
      <div class="active-shipment">
        <h3>Current Delivery</h3>
        <div class="shipment-card">
          <div class="tracking-number">DN20260212ABC123</div>
          <div class="shipment-address">
            <div><strong>🚗 In Transit</strong></div>
            <div style="color: #666; font-size: 13px">
              From: Kingston Distribution Center<br>
              To: 456 Harbor Ave, Montego Bay
            </div>
          </div>
          <div class="eta">
            <strong>Estimated Delivery:</strong><br>
            Today, 4:00 PM
          </div>
          <div class="driver-info">
            <div class="driver-avatar">SW</div>
            <div class="driver-details">
              <div class="driver-name">Sarah Williams</div>
              <div class="driver-phone">📞 876-555-0188</div>
              <div class="driver-vehicle">Toyota Hiace - VAN987</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Timeline -->
      <div class="tracking-timeline">
        <h3>Tracking Progress</h3>
        <div class="timeline">
          <div class="timeline-event completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="event-title">Order Placed</div>
              <div class="event-time">Feb 12, 9:30 AM</div>
            </div>
          </div>
          <div class="timeline-event completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="event-title">Picked Up</div>
              <div class="event-time">Feb 12, 2:10 PM</div>
            </div>
          </div>
          <div class="timeline-event completed">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="event-title">In Transit</div>
              <div class="event-time">Feb 13, 8:00 AM</div>
            </div>
          </div>
          <div class="timeline-event active">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="event-title">Out for Delivery</div>
              <div class="event-time">Feb 13, 2:30 PM</div>
            </div>
          </div>
          <div class="timeline-event">
            <div class="timeline-marker"></div>
            <div class="timeline-content">
              <div class="event-title">Delivered</div>
              <div class="event-time">Today, ~4:00 PM</div>
            </div>
          </div>
        </div>
      </div>

    </div>

  </div>
</div>
```

### Tracking Map CSS

```css
.tracking-layout {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 20px;
}

#full-tracking-map {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.shipment-card {
  background: white;
  padding: 15px;
  border-radius: 6px;
  border: 1px solid #E1E5ED;
  margin-bottom: 15px;
}

.tracking-number {
  font-weight: 700;
  color: #0E244C;
  font-size: 16px;
  margin-bottom: 10px;
}

.timeline {
  position: relative;
  padding-left: 30px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #E1E5ED;
}

.timeline-event {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;
  position: relative;
}

.timeline-marker {
  width: 12px;
  height: 12px;
  background: white;
  border: 3px solid #E1E5ED;
  border-radius: 50%;
  position: absolute;
  left: -20px;
  top: 5px;
}

.timeline-event.completed .timeline-marker {
  background: #27AE60;
  border-color: #27AE60;
}

.timeline-event.active .timeline-marker {
  background: #D4262A;
  border-color: #D4262A;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(212, 38, 42, 0.7); }
  50% { box-shadow: 0 0 0 5px rgba(212, 38, 42, 0); }
}

.event-title {
  font-weight: 600;
  color: #0E244C;
  font-size: 13px;
}

.event-time {
  font-size: 12px;
  color: #999;
}

.timeline-event.completed .event-title {
  color: #27AE60;
}
```

---

## 🔔 Screen 6: Notifications Center

```html
<div class="notifications-container">
  <div class="notifications-header">
    <h2>Notifications</h2>
    <div class="notification-actions">
      <button class="btn-icon" title="Mark All as Read">✓</button>
      <button class="btn-icon" title="Settings">⚙️</button>
    </div>
  </div>

  <!-- Notification Filters -->
  <div class="notification-filters">
    <button class="filter-btn active">All</button>
    <button class="filter-btn">Shipments</button>
    <button class="filter-btn">Payments</button>
    <button class="filter-btn">System</button>
  </div>

  <!-- Notifications List -->
  <div class="notifications-list">
    
    <!-- Pre-Alert Notification -->
    <div class="notification-item unread status-pre-alert">
      <div class="notification-icon">📦</div>
      <div class="notification-content">
        <div class="notification-title">Shipment Ready for Pickup</div>
        <div class="notification-message">
          Your shipment DN20260212ABC123 is ready for pickup today at 2:00 PM.
        </div>
        <div class="notification-actions">
          <button class="btn-link">Confirm Availability</button>
          <button class="btn-link text-danger">Reschedule Pickup</button>
        </div>
        <div class="notification-time">5 minutes ago</div>
      </div>
    </div>

    <!-- Picked Up Notification -->
    <div class="notification-item read status-pickup">
      <div class="notification-icon">✓</div>
      <div class="notification-content">
        <div class="notification-title">Shipment Picked Up</div>
        <div class="notification-message">
          Your shipment has been picked up by driver Michael Johnson.
        </div>
        <div class="notification-action-link">
          <a href="/tracking">Track Shipment →</a>
        </div>
        <div class="notification-time">2 hours ago</div>
      </div>
    </div>

    <!-- Payment Reminder -->
    <div class="notification-item unread status-payment">
      <div class="notification-icon">💳</div>
      <div class="notification-content">
        <div class="notification-title">Invoice Payment Due</div>
        <div class="notification-message">
          Invoice INV-2026-00156 for JMD 2,500 is now 5 days overdue.
        </div>
        <div class="notification-actions">
          <button class="btn-link btn-primary">Pay Now</button>
          <button class="btn-link">View Invoice</button>
        </div>
        <div class="notification-time">1 day ago</div>
      </div>
    </div>

  </div>
</div>
```

### Notifications CSS

```css
.notifications-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.notification-filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  border-bottom: 1px solid #E1E5ED;
  padding-bottom: 15px;
}

.filter-btn {
  background: none;
  border: none;
  padding: 8px 12px;
  font-size: 13px;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  color: #999;
  transition: all 0.2s;
}

.filter-btn.active {
  color: #D4262A;
  border-bottom-color: #D4262A;
}

.notification-item {
  display: flex;
  gap: 15px;
  padding: 15px;
  border: 1px solid #E1E5ED;
  border-radius: 6px;
  margin-bottom: 12px;
  background: white;
}

.notification-item.unread {
  background: #F0F7FF;
  border-color: #1A4F9B;
}

.notification-icon {
  font-size: 24px;
  min-width: 40px;
  text-align: center;
}

.notification-title {
  font-weight: 600;
  color: #0E244C;
  margin-bottom: 5px;
}

.notification-message {
  font-size: 13px;
  color: #666;
  margin-bottom: 10px;
}

.notification-time {
  font-size: 11px;
  color: #999;
}

.btn-link {
  background: none;
  border: none;
  color: #1A4F9B;
  cursor: pointer;
  padding: 0;
  font-size: 13px;
  text-decoration: underline;
}

.btn-link.btn-primary {
  color: #D4262A;
  font-weight: 600;
  text-decoration: none;
}
```

---

## 📈 Screen 7: Advanced Reporting

```html
<div class="reports-container">
  <div class="page-header">
    <h1>Business Reports</h1>
    <div class="report-filters">
      <select>
        <option>This Month</option>
        <option>Last Month</option>
        <option>Last 3 Months</option>
        <option>Last Year</option>
        <option>Custom Range</option>
      </select>
      <button class="btn btn-secondary">Download Report</button>
    </div>
  </div>

  <!-- Report Cards -->
  <div class="report-cards">
    <div class="report-card">
      <h3>Revenue</h3>
      <div class="report-value">JMD 125,000</div>
      <canvas id="revenue-chart"></canvas>
    </div>
    <div class="report-card">
      <h3>Delivery Success Rate</h3>
      <div class="report-value">98.5%</div>
      <canvas id="success-chart"></canvas>
    </div>
    <div class="report-card">
      <h3>Average Delivery Time</h3>
      <div class="report-value">2.3 Days</div>
      <canvas id="time-chart"></canvas>
    </div>
    <div class="report-card">
      <h3>Total Shipments</h3>
      <div class="report-value">245</div>
      <canvas id="shipments-chart"></canvas>
    </div>
  </div>

  <!-- Detailed Analytics -->
  <div class="analytics-section">
    <h2>Detailed Analytics</h2>
    
    <div class="analytics-grid">
      <div class="chart-container">
        <h3>Revenue Trend</h3>
        <canvas id="revenue-trend-chart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Cost Analysis</h3>
        <canvas id="cost-chart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Shipments by Route</h3>
        <canvas id="routes-chart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Customer Activity</h3>
        <canvas id="activity-chart"></canvas>
      </div>
    </div>
  </div>
</div>
```

---

## 💳 Screen 8: Payment Processing

```html
<div class="payment-modal">
  <div class="payment-header">
    <h2>Payment Processing</h2>
    <button class="btn-close">×</button>
  </div>

  <!-- Invoice Summary -->
  <div class="payment-summary">
    <div class="summary-row">
      <span>Invoice:</span>
      <strong>INV-2026-00156</strong>
    </div>
    <div class="summary-row">
      <span>Amount Due:</span>
      <strong class="amount">JMD 2,500</strong>
    </div>
    <div class="summary-row">
      <span>Due Date:</span>
      <strong>Feb 26, 2026</strong>
    </div>
  </div>

  <!-- Payment Method Selection -->
  <div class="payment-methods">
    <h3>Select Payment Method</h3>
    
    <label class="payment-option selected">
      <input type="radio" name="payment" value="credit-card" checked>
      <div class="method-icon">💳</div>
      <div class="method-info">
        <div class="method-name">Credit Card</div>
        <div class="method-desc">Visa, Mastercard, American Express</div>
      </div>
    </label>

    <label class="payment-option">
      <input type="radio" name="payment" value="bank-transfer">
      <div class="method-icon">🏦</div>
      <div class="method-info">
        <div class="method-name">Bank Transfer</div>
        <div class="method-desc">Direct from your bank account</div>
      </div>
    </label>

    <label class="payment-option">
      <input type="radio" name="payment" value="saved-card">
      <div class="method-icon">💾</div>
      <div class="method-info">
        <div class="method-name">Saved Card</div>
        <div class="method-desc">**** **** **** 4242</div>
      </div>
    </label>
  </div>

  <!-- Stripe Card Form -->
  <div class="stripe-form">
    <h3>Card Details</h3>
    <div id="stripe-card-element"></div>
    <div id="card-errors" role="alert"></div>
  </div>

  <!-- Payment Actions -->
  <div class="payment-actions">
    <button class="btn btn-secondary">Cancel</button>
    <button class="btn btn-primary btn-large" id="pay-button">Pay JMD 2,500</button>
  </div>
</div>
```

---

## 🎨 Complete Component Library

All components use consistent styling with:
- **Rounded corners:** 6-8px (border-radius)
- **Shadows:** 0 2px 4px rgba(0,0,0,0.1)
- **Spacing:** 15px base unit
- **Transitions:** 0.2s ease
- **Hover states:** #F5F7FA background

Ready to implement these screens as HTML templates + CSS!
