# 🚀 D.N Express CRM - Complete Feature Roadmap with Sethwan API Integration

**Analysis Date:** February 2026
**Status:** Feature Gap Analysis & Implementation Plan
**Integration:** Sethwan Courier & Warehouse Platform

---

## 📊 Feature Comparison: Current vs. Sethwan Standard

### Currently Implemented ✅
- Basic customer registration and login
- Basic shipment creation
- Basic tracking display
- Simple dashboard
- Customer profile management

### Critical Features Missing ❌

| Feature | Sethwan Feature | Priority | Customer Impact |
|---|---|---|---|
| **Real-time Tracking Updates** | Advance Package Tracking | 🔴 CRITICAL | Customers can't see live status |
| **Invoice Management** | Invoice Management | 🔴 CRITICAL | No billing automation |
| **Payment Processing** | Online Payment (Stripe) | 🔴 CRITICAL | Can't collect payment |
| **Pre-Alert System** | Pre-Alert System | 🟠 HIGH | No pickup notifications |
| **Label Generation** | Label Generation | 🟠 HIGH | Can't print shipping labels |
| **Email Notifications** | Email Marketing | 🟠 HIGH | No shipment updates to customers |
| **Manifest Management** | Asycuda Manifest | 🟠 HIGH | No customs documentation |
| **Multiple Locations** | Multiple Branch Location | 🟠 HIGH | Single location only |
| **Cloud Printing** | Cloud Printing | 🟠 HIGH | Manual printing required |
| **Advanced Reporting** | Advance Reporting | 🟡 MEDIUM | No business insights |
| **Point of Sale** | Point of Sale | 🟡 MEDIUM | No in-store shipping |
| **Warehouse Portal** | Warehouse Portal | 🟡 MEDIUM | No warehouse management |
| **Staff Mobile App** | Mobile App | 🟡 MEDIUM | No field operations |

---

## 🔄 Complete Customer Journey (End-to-End)

### Phase 1: SETUP & ONBOARDING

**Customer Actions:**
1. Visit D.N Express website
2. Click "Register" or "Get Started"
3. Enter company information
4. Verify email address
5. Set up payment method
6. Enable tracking preferences

**Data Flow to Sethwan:**
```
POST /sethwan/api/customers/register
{
  "companyName": "XYZ Company",
  "email": "admin@xyz.com",
  "phone": "876-555-0123",
  "address": {
    "street": "123 Main St",
    "city": "Kingston",
    "country": "Jamaica",
    "zipcode": "JMKNG001"
  },
  "paymentMethod": "credit_card",
  "currency": "JMD",
  "serviceType": ["courier", "warehouse"],
  "webhookUrl": "https://dnexpress.com/api/webhooks/sethwan"
}
```

**Response:**
```
{
  "success": true,
  "customerId": "CUST_12345",
  "sethwanAccountId": "SETH_98765",
  "defaultWarehouse": "WHSE_JAMAICA_01",
  "apiKey": "sk_live_xxxx",
  "activationStatus": "active"
}
```

**UI Components Needed:**
- ✅ Multi-step registration form (company info, address, payment)
- ✅ Email verification screen
- ✅ Payment method setup (Stripe form)
- ✅ Service selection (Courier, Warehouse, or Both)
- ✅ Welcome tour/onboarding

---

### Phase 2: SHIPMENT CREATION & QUOTATION

**Customer Actions:**
1. Click "Create Shipment"
2. Enter origin/destination details
3. Enter package information
4. Select service type (Standard, Express, Overnight)
5. View real-time quote
6. Accept quote and proceed

**Data Flow to Sethwan:**

**Step 1: Calculate Quote**
```
POST /sethwan/api/shipments/quote
{
  "customerId": "CUST_12345",
  "origin": {
    "name": "Business Name",
    "address": "123 Main St, Kingston, Jamaica",
    "phone": "876-555-0100",
    "email": "contact@xyz.com"
  },
  "destination": {
    "name": "Recipient Name",
    "address": "456 Harbor Ave, Kingston, Jamaica",
    "phone": "876-555-0101",
    "email": "recipient@example.com"
  },
  "package": {
    "weight": 5.5,
    "length": 30,
    "width": 20,
    "height": 15,
    "weightUnit": "kg",
    "dimensionUnit": "cm",
    "description": "Electronics"
  },
  "serviceType": "standard",
  "insuranceRequired": false
}
```

**Response:**
```
{
  "quoteId": "QUOTE_67890",
  "estimatedCost": 2500,
  "insuranceCost": 0,
  "estimatedDelivery": "2026-02-13T17:00:00Z",
  "breakdownCosts": {
    "baseCost": 2000,
    "fuelSurcharge": 300,
    "handlingFee": 200
  },
  "currency": "JMD",
  "validUntil": "2026-02-12T17:30:00Z",
  "serviceDetails": {
    "type": "standard",
    "cutoffTime": "5:00 PM",
    "estimatedDays": 2
  }
}
```

**Step 2: Create Shipment**
```
POST /sethwan/api/shipments/create
{
  "quoteId": "QUOTE_67890",
  "customerId": "CUST_12345",
  "paymentMethodId": "pm_stripe_xxxx",
  "chargeImmediately": true,
  "insureShipment": false,
  "specialHandling": [
    "fragile",
    "requires_signature"
  ],
  "customNotes": "Handle with care - electronics",
  "referenceNumber": "PO-2026-001"
}
```

**Response:**
```
{
  "success": true,
  "shipmentId": "SHIP_54321",
  "trackingNumber": "DN20260212ABC123XYZ",
  "waybillNumber": "WB-2026-0012345",
  "status": "created",
  "invoice": {
    "invoiceNumber": "INV-2026-00156",
    "amount": 2500,
    "currency": "JMD",
    "dueDate": "2026-02-26",
    "paymentStatus": "paid"
  },
  "pickupSchedule": {
    "scheduledDate": "2026-02-12",
    "scheduledTime": "14:00-16:00",
    "pickupLocation": "origin_address"
  },
  "label": {
    "labelId": "LBL_11223",
    "format": "PDF",
    "url": "https://sethwan.com/labels/LBL_11223.pdf",
    "printUrl": "https://sethwan.com/print/LBL_11223"
  }
}
```

**UI Components Needed:**
- ✅ Multi-step shipment form
- ✅ Address auto-complete (Google Maps API)
- ✅ Real-time package weight calculator
- ✅ Quote preview with breakdown
- ✅ Service type selector with descriptions
- ✅ Insurance add-on toggle
- ✅ Special handling checkboxes
- ✅ System calculates quote in real-time from Sethwan

---

### Phase 3: PRE-ALERT & PICKUP NOTIFICATION

**Sethwan API Event (Webhook):**
```
POST /dnexpress/api/webhooks/sethwan
{
  "event": "shipment.pre_alert",
  "timestamp": "2026-02-12T09:00:00Z",
  "shipmentId": "SHIP_54321",
  "trackingNumber": "DN20260212ABC123XYZ",
  "status": "pending_pickup",
  "message": "Your shipment is ready for pickup",
  "pickupSchedule": {
    "date": "2026-02-12",
    "time": "14:00-16:00",
    "driver": {
      "name": "Michael Johnson",
      "phone": "876-555-0199",
      "vehicle": "Toyota Hiace - KA12345"
    }
  }
}
```

**Customer Receives:**
- 📧 Email notification: "Your shipment is ready for pickup - Today at 2:00 PM"
- 📱 SMS alert: "Pickup scheduled for 2:00 PM. Driver: Michael Johnson (876-555-0199)"
- 🔔 Dashboard notification: Live update on dashboard

**Action:**
- Customer can confirm availability
- Customer can reschedule pickup
- Customer can provide special instructions

**UI Components Needed:**
- ✅ Real-time notification center
- ✅ Pre-alert card on dashboard
- ✅ Confirm/Reschedule buttons
- ✅ Driver details card (name, phone, vehicle info)
- ✅ Special instructions text area
- ✅ Integration with email/SMS service

---

### Phase 4: ACTUAL PICKUP

**Sethwan API Event (Driver Mobile App):**
```
POST /dnexpress/api/webhooks/sethwan
{
  "event": "shipment.pickup_arrived",
  "timestamp": "2026-02-12T13:55:00Z",
  "shipmentId": "SHIP_54321",
  "trackingNumber": "DN20260212ABC123XYZ",
  "status": "in_transit",
  "driver": {
    "driverId": "DRIV_001",
    "name": "Michael Johnson",
    "location": {
      "latitude": 17.9757,
      "longitude": -76.8066,
      "address": "123 Main St, Kingston"
    },
    "arrivalTime": "2026-02-12T13:55:00Z"
  },
  "verification": {
    "photoProof": "https://sethwan.com/proofs/PROOF_12345.jpg",
    "signatureRequired": true
  }
}
```

**After Successful Pickup:**
```
POST /dnexpress/api/webhooks/sethwan
{
  "event": "shipment.picked_up",
  "timestamp": "2026-02-12T14:10:00Z",
  "shipmentId": "SHIP_54321",
  "trackingNumber": "DN20260212ABC123XYZ",
  "status": "picked_up",
  "pickupDetails": {
    "actualPickupTime": "2026-02-12T14:10:00Z",
    "driver": "Michael Johnson",
    "packageWeight": 5.5,
    "packageCondition": "good",
    "proofOfDelivery": "https://sethwan.com/proofs/PROOF_12345.jpg"
  }
}
```

**Customer Receives:**
- 📧 Email: "Your shipment has been picked up! Tracking #: DN20260212ABC123XYZ"
- 📱 SMS: "Pickup successful. Your shipment is on the way."
- 🔔 Dashboard updates to show "In Transit"

**UI Components Needed:**
- ✅ Live tracking map (showing driver location)
- ✅ Status timeline (Created → Picked Up → In Transit → etc.)
- ✅ Proof of pickup image viewer
- ✅ Driver details card
- ✅ Contact driver button (SMS/call)

---

### Phase 5: IN-TRANSIT & WAREHOUSE UPDATE

**Sethwan API Events (Continuous Updates):**

**Event 1: Arrived at Processing Hub**
```
POST /dnexpress/api/webhooks/sethwan
{
  "event": "shipment.arrived_warehouse",
  "timestamp": "2026-02-12T17:30:00Z",
  "shipmentId": "SHIP_54321",
  "warehouseId": "WHSE_KINGSTON_01",
  "status": "in_warehouse",
  "details": {
    "warehouseName": "Kingston Distribution Center",
    "scanTime": "2026-02-12T17:30:00Z",
    "receivedBy": "Warehouse Staff",
    "nextStop": "Destination Hub"
  }
}
```

**Event 2: Out for Delivery**
```
POST /dnexethwan/api/webhooks/sethwan
{
  "event": "shipment.out_for_delivery",
  "timestamp": "2026-02-13T08:00:00Z",
  "shipmentId": "SHIP_54321",
  "status": "out_for_delivery",
  "details": {
    "deliveryDate": "2026-02-13",
    "estimatedDeliveryWindow": "09:00-17:00",
    "deliveryDriver": {
      "name": "Sarah Williams",
      "phone": "876-555-0188",
      "vehicle": "UPS Brown Van - VAN987"
    },
    "currentLocation": {
      "latitude": 17.9757,
      "longitude": -76.8066
    }
  }
}
```

**Customer Receives:**
- 📧 Email: "Your shipment is out for delivery today (9 AM - 5 PM)"
- 📱 SMS: "Your package is on its way! Driver: Sarah Williams (876-555-0188)"
- 🔔 Dashboard: Live map showing driver approaching

**UI Components Needed:**
- ✅ Live tracking map with driver location
- ✅ Delivery window countdown
- ✅ Driver info card (photo, name, vehicle, contact)
- ✅ Estimated delivery time in header
- ✅ "Track in Real Time" button
- ✅ Signature requirement indicator
- ✅ Delivery instruction form (gate code, side gate, etc.)

---

### Phase 6: DELIVERY & PROOF

**Sethwan API Event:**
```
POST /dnexpress/api/webhooks/sethwan
{
  "event": "shipment.delivered",
  "timestamp": "2026-02-13T14:45:00Z",
  "shipmentId": "SHIP_54321",
  "trackingNumber": "DN20260212ABC123XYZ",
  "status": "delivered",
  "deliveryDetails": {
    "deliveryTime": "2026-02-13T14:45:00Z",
    "deliveryAddress": "456 Harbor Ave, Kingston, Jamaica",
    "recipientName": "John Smith",
    "recipientSignature": "https://sethwan.com/signatures/SIG_54321.jpg",
    "proofOfDelivery": {
      "photo": "https://sethwan.com/proofs/PROOF_54321.jpg",
      "location": {
        "latitude": 17.9757,
        "longitude": -76.8066
      },
      "comments": "Delivered to front desk"
    },
    "driver": "Sarah Williams"
  }
}
```

**Customer Receives:**
- 📧 Email: "Your shipment has been delivered!"
- 📱 SMS: "Delivery confirmed. Thank you for using D.N Express!"
- 🔔 Dashboard: "Delivered" status with proof images

**UI Components Needed:**
- ✅ Delivered status confirmation
- ✅ Proof of delivery image gallery
- ✅ Recipient signature preview
- ✅ Delivery map pinpoint
- ✅ "Rate Delivery" button for feedback
- ✅ "Need Help?" button for issues
- ✅ Invoice/receipt download link

---

### Phase 7: POST-DELIVERY & ARCHIVE

**Customer Actions:**
1. Rate delivery experience
2. Download receipt/invoice
3. Request return label (if applicable)
4. View archived shipment

**UI Components Needed:**
- ✅ Feedback form (star rating, comments)
- ✅ Invoice download (PDF)
- ✅ Return label request form
- ✅ Shipment archive search
- ✅ Repeat shipment from history
- ✅ Share tracking link with recipient

---

## 🛠️ Missing UI/UX Components - Implementation Priority

### 🔴 CRITICAL (Implement First)

#### 1. **Real-Time Tracking Map**
- Location: `/dashboard/tracking-map`
- Shows live driver location
- Shows route/path
- Shows estimated arrival time
- Address: Shows current location details
- Component: Google Maps API integration

#### 2. **Invoice Management System**
- Location: `/dashboard/invoices` (new page)
- Invoice list with filtering
- Invoice detail view
- Download as PDF
- Email invoice
- Mark as paid/unpaid
- Recurring invoice support

#### 3. **Payment Processing**
- Location: `/dashboard/billing` (new page)
- Stripe integration
- Payment method management
- Transaction history
- Auto-charge setup
- Invoice payment status

#### 4. **Email Notification Center**
- Location: `/dashboard/notifications` (new page)
- Notification history
- Mark as read
- Archive notifications
- Notification preferences/settings
- Resend notification

#### 5. **Label Management & Printing**
- Location: `/dashboard/labels` (new page)
- Print shipping labels (PDF)
- Cloud printing support
- Batch label printing
- Label template customization
- Barcode/QR code display

---

### 🟠 HIGH (Implement Second)

#### 6. **Pre-Alert & Pickup Scheduling**
- Location: Updates to dashboard
- Confirm pickup availability
- Reschedule pickup
- Provide special instructions
- Driver details display
- Arrival countdown

#### 7. **Email Marketing/Notifications**
- Automated notifications for:
  - Pre-alert
  - Pickup confirmation
  - In-transit updates
  - Out for delivery
  - Delivered confirmation
- Customizable email templates
- SMS integration (Twilio)
- Notification preferences

#### 8. **Manifest Management**
- Location: `/dashboard/manifests` (new page)
- Asycuda manifest generation (Jamaican customs)
- Manifest list and search
- Manifest detail view
- Export/download manifest
- Manifest status tracking

#### 9. **Multiple Location Support**
- Location: Settings → Locations
- Add/edit branch locations
- Set default pickup location
- Set default warehouse
- Location-specific invoicing
- Location-based user permissions

#### 10. **Advanced Reporting Dashboard**
- Location: `/dashboard/reports` (new page)
- Revenue by shipment type
- Delivery success rate
- Average delivery time
- Top routes
- Cost analysis
- Charts and graphs (Chart.js)
- Export to PDF/Excel

---

### 🟡 MEDIUM (Implement Later)

#### 11. **Point of Sale Integration**
- Location: `/dashboard/pos` (new page)
- In-store shipping creation
- Quick shipment creation
- Card reader integration
- Receipt printing
- Daily POS reports

#### 12. **Warehouse Portal**
- Location: Separate app `/warehouse` (new section)
- Warehouse staff dashboard
- Package inbound scanning
- Inventory management
- Bulk operations
- Warehouse-specific reporting

#### 13. **Mobile App for Drivers**
- iOS/Android app
- Real-time map navigation
- Package scanning (barcode)
- Proof of delivery (photos/signature)
- Live location tracking
- Offline mode

#### 14. **Cloud Printing**
- Integration with print services
- Auto-print labels
- Schedule batch printing
- Print queue management
- Printer management interface

---

## 🔌 API Integration Architecture

### Sethwan API Endpoints D.N Express Needs

```
BASE_URL: https://api.sethwan.com/v1
AUTHENTICATION: Bearer {apiKey}
HEADERS:
  - Authorization: Bearer sk_live_xxxx
  - X-Account-ID: SETH_98765
  - Content-Type: application/json
```

### Endpoints to Implement

#### Authentication
```
POST /customers/register
POST /customers/login
POST /auth/refresh
GET /auth/verify
```

#### Shipments
```
POST /shipments/quote           # Get shipping quote
POST /shipments/create          # Create shipment
GET /shipments/{id}             # Get shipment details
GET /shipments                  # List shipments
PUT /shipments/{id}             # Update shipment
GET /shipments/{id}/tracking    # Get tracking info
POST /shipments/{id}/cancel     # Cancel shipment
```

#### Tracking
```
GET /tracking/{trackingNumber}  # Public tracking
GET /tracking/{shipmentId}      # Detailed tracking events
```

#### Invoices
```
POST /invoices/create           # Create invoice
GET /invoices/{id}              # Get invoice details
GET /invoices                   # List invoices
POST /invoices/{id}/pay         # Process payment
GET /invoices/{id}/pdf          # Download as PDF
```

#### Labels
```
GET /labels/{labelId}           # Get label details
POST /labels/{shipmentId}       # Generate label
GET /labels/{labelId}/pdf       # Download label PDF
POST /labels/batch-print        # Print multiple labels
```

#### Manifests
```
POST /manifests/create          # Create manifest
GET /manifests/{id}             # Get manifest details
GET /manifests                  # List manifests
POST /manifests/{id}/download   # Download manifest
POST /manifests/{id}/submit     # Submit to customs
```

#### Webhooks
```
POST /webhooks/register         # Register webhook
DELETE /webhooks/{id}           # Unregister webhook
GET /webhooks                   # List webhooks
```

#### Payments
```
POST /payments/create           # Create payment
GET /payments/{id}              # Get payment details
POST /payments/{id}/refund      # Refund payment
```

#### Locations
```
POST /locations/create          # Create location
GET /locations/{id}             # Get location details
GET /locations                  # List locations
PUT /locations/{id}             # Update location
```

#### Reports
```
GET /reports/revenue            # Revenue report
GET /reports/delivery-rate      # Delivery metrics
GET /reports/shipments          # Shipment summary
GET /reports/costs              # Cost analysis
```

---

## 📱 UI/UX Screen Layout Plan

### Current (Basic)
```
Dashboard
├── Overview (stats)
├── My Shipments (list)
├── Get Quotes (form)
├── Track (search)
└── Profile (info)
```

### Enhanced (Complete)
```
Dashboard
├── Overview (stats + widgets)
│   ├── Revenue this month
│   ├── Shipments in transit
│   ├── Deliveries today
│   └── Pending payments
├── My Shipments
│   ├── Active shipments
│   ├── Delivery calendar
│   ├── Filter & search
│   └── Batch operations
├── Create Shipment
│   ├── Quick create
│   ├── Step-by-step form
│   ├── Real-time quote
│   └── Template builder
├── Track
│   ├── Public tracking
│   ├── Real-time map
│   ├── Delivery timeline
│   └── Proof of delivery
├── Invoices (NEW)
│   ├── Invoice list
│   ├── Payment status
│   ├── Download PDF
│   └── Pay now button
├── Labels (NEW)
│   ├── Label history
│   ├── Print labels
│   ├── Cloud printing
│   └── Batch operations
├── Manifests (NEW)
│   ├── Manifest list
│   ├── Generate manifest
│   ├── Submit to customs
│   └── Download/export
├── Reports (NEW)
│   ├── Revenue analytics
│   ├── Delivery metrics
│   ├── Cost analysis
│   └── Custom reports
├── Notifications (NEW)
│   ├── Notification center
│   ├── Notification history
│   └── Preferences
└── Settings
    ├── Profile
    ├── Locations
    ├── Billing
    ├── Notifications
    ├── API Keys
    └── Integrations
```

---

## 🔄 Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    D.N EXPRESS FRONTEND                         │
│ (React/Vue or Enhanced HTML/JS)                                │
│                                                                 │
│  auth.html → dashboard.html → [NEW PAGES]                      │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTP REST API
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│              D.N EXPRESS BACKEND (EXPRESS.JS)                   │
│                                                                 │
│  ├─ GET /api/dashboard        (fetch all widgets)              │
│  ├─ POST /api/shipments        (create shipment)               │
│  ├─ GET /api/shipments         (list shipments)               │
│  ├─ GET /api/invoices          (list invoices)                │
│  ├─ POST /api/payments         (process payment)              │
│  ├─ GET /api/labels            (get labels)                   │
│  ├─ POST /api/webhooks/sethwan (receive updates)              │
│  └─ GET /api/reports           (generate reports)             │
│                                                                 │
│  Middleware:                                                    │
│  └─ SETHWAN API CLIENT (forwards requests/receives webhooks)  │
└──────────────────┬──────────────────────────────────────────────┘
                   │
                   │ HTTPS REST API + Webhooks
                   ▼
┌──────────────────────────────────────────────────────────────────┐
│            SETHWAN COURIER & WAREHOUSE PLATFORM                 │
│                                                                 │
│  ├─ POST /shipments/quote     (calculate costs)               │
│  ├─ POST /shipments/create    (create shipment)               │
│  ├─ GET /shipments/{id}       (get shipment details)          │
│  ├─ POST /invoices/create     (auto-invoice)                  │
│  ├─ POST /labels/generate     (create labels)                 │
│  ├─ POST /manifests/create    (customs docs)                  │
│  ├─ GET /reports/*            (business analytics)            │
│  └─ WEBHOOKS (send real-time updates)                         │
│                                                                 │
│  Manages:                                                       │
│  ├─ All shipment data         (source of truth)               │
│  ├─ All tracking information  (driver locations, etc)         │
│  ├─ Warehouse operations      (inventory, scanning)           │
│  ├─ Customs documentation     (manifests, declarations)       │
│  ├─ Financial records         (invoices, payments)            │
│  └─ Driver assignments        (mobile app, routing)           │
└──────────────────────────────────────────────────────────────────┘
```

---

## 💾 Database Schema Updates Needed

### New Tables/Collections

```sql
-- Invoices Table
CREATE TABLE invoices (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  sethwanInvoiceId STRING UNIQUE,
  shipmentId UUID REFERENCES shipments(id),
  amount DECIMAL(10,2),
  currency STRING,
  status ENUM('draft', 'issued', 'paid', 'overdue', 'cancelled'),
  issueDate TIMESTAMP,
  dueDate TIMESTAMP,
  paidDate TIMESTAMP,
  paymentMethodId STRING,
  notes TEXT,
  createdAt TIMESTAMP DEFAULT NOW(),
  updatedAt TIMESTAMP DEFAULT NOW()
);

-- Payments Table
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  invoiceId UUID REFERENCES invoices(id),
  sethwanPaymentId STRING UNIQUE,
  amount DECIMAL(10,2),
  currency STRING,
  paymentMethod STRING,
  status ENUM('pending', 'completed', 'failed', 'refunded'),
  transactionId STRING,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Labels Table
CREATE TABLE labels (
  id UUID PRIMARY KEY,
  shipmentId UUID REFERENCES shipments(id),
  sethwanLabelId STRING UNIQUE,
  trackingNumber STRING,
  waybillNumber STRING,
  format STRING,
  url STRING,
  printUrl STRING,
  status ENUM('created', 'printed', 'used', 'archived'),
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Manifests Table
CREATE TABLE manifests (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  sethwanManifestId STRING UNIQUE,
  shipmentIds UUID[],
  manifestNumber STRING,
  type STRING,
  status ENUM('draft', 'submitted', 'approved', 'rejected'),
  submittedDate TIMESTAMP,
  submittedBy UUID REFERENCES users(id),
  document TEXT,
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Warehouse Locations Table
CREATE TABLE warehouse_locations (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  sethwanLocationId STRING UNIQUE,
  name STRING,
  address TEXT,
  city STRING,
  country STRING,
  phone STRING,
  email STRING,
  isDefault BOOLEAN,
  capabilities STRING[],
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  shipmentId UUID REFERENCES shipments(id),
  type STRING,
  title STRING,
  message TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  readAt TIMESTAMP,
  channels STRING[],
  createdAt TIMESTAMP DEFAULT NOW()
);

-- Reports Table
CREATE TABLE reports (
  id UUID PRIMARY KEY,
  customerId UUID REFERENCES customers(id),
  type STRING,
  startDate DATE,
  endDate DATE,
  metrics JSONB,
  generatedAt TIMESTAMP DEFAULT NOW()
);

-- Tracking Events Table (Extended)
ALTER TABLE shipment_tracking_events ADD COLUMN (
  sethwanEventId STRING UNIQUE,
  eventType STRING,
  eventDetails JSONB,
  webhookId STRING,
  receivedAt TIMESTAMP
);
```

---

## 🔗 API Integration Code Structure

### New Backend Endpoints Needed

```javascript
// routes/invoices.js
GET    /api/invoices               - List customer invoices
GET    /api/invoices/:id           - Get invoice details
POST   /api/invoices/:id/download  - Download invoice PDF
POST   /api/invoices/:id/pay       - Process payment

// routes/payments.js
GET    /api/payments               - List payments
POST   /api/payments               - Create payment
POST   /api/payments/refund        - Request refund
GET    /api/payments/methods       - List payment methods
POST   /api/payments/methods       - Add payment method

// routes/labels.js
GET    /api/labels                 - List labels
GET    /api/labels/:id/pdf         - Download label
POST   /api/labels/print           - Send to printer
POST   /api/labels/batch-print     - Batch print labels

// routes/manifests.js
GET    /api/manifests              - List manifests
POST   /api/manifests              - Create manifest
GET    /api/manifests/:id/download - Download manifest
POST   /api/manifests/:id/submit   - Submit to customs

// routes/notifications.js
GET    /api/notifications          - Get notifications
GET    /api/notifications/:id      - Get notification
POST   /api/notifications/:id/read - Mark as read
GET    /api/notifications/preferences - Get prefs
POST   /api/notifications/preferences - Update prefs

// routes/reports.js
GET    /api/reports/revenue        - Revenue report
GET    /api/reports/delivery-rate  - Delivery metrics
GET    /api/reports/shipments      - Shipment summary
GET    /api/reports/costs          - Cost analysis
POST   /api/reports/custom         - Generate custom report

// routes/locations.js
GET    /api/locations              - List locations
POST   /api/locations              - Add location
PUT    /api/locations/:id          - Update location
DELETE /api/locations/:id          - Delete location

// routes/dashboard.js (Enhanced)
GET    /api/dashboard              - All dashboard widgets
GET    /api/dashboard/stats        - Key statistics
GET    /api/dashboard/recent       - Recent activity
```

### Sethwan API Client Service

```javascript
// utils/sethwanClient.js
class SethwanAPIClient {
  // Authentication
  createAccount(customerData)
  authenticateUser(email, password)
  
  // Shipments
  getShipmentQuote(shipmentDetails)
  createShipment(shipmentData)
  getShipmentDetails(shipmentId)
  listShipments(customerId, filters)
  updateShipment(shipmentId, updates)
  cancelShipment(shipmentId)
  getTracking(trackingNumber)
  
  // Invoices
  createInvoice(shipmentId)
  getInvoice(invoiceId)
  listInvoices(customerId)
  markInvoiceAsPaid(invoiceId)
  downloadInvoicePDF(invoiceId)
  
  // Labels
  generateLabel(shipmentId)
  getLabel(labelId)
  downloadLabelPDF(labelId)
  batchPrintLabels(shipmentIds)
  
  // Manifests
  createManifest(manifestData)
  getManifest(manifestId)
  submitManifest(manifestId)
  downloadManifest(manifestId)
  
  // Payments
  createPayment(invoiceId, paymentMethod)
  processStripePayment(token, amount)
  refundPayment(paymentId)
  
  // Webhooks
  registerWebhook(url, events)
  unregisterWebhook(webhookId)
  
  // Reports
  getRevenueReport(timeframe)
  getDeliveryMetrics(timeframe)
  getCostAnalysis(timeframe)
}
```

---

## 🚀 Implementation Roadmap

### Week 1: Foundation
- [ ] Real-time tracking map integration
- [ ] Invoice management system
- [ ] Sethwan API client setup
- [ ] Database migration

### Week 2: Payments & Notifications
- [ ] Stripe payment integration
- [ ] Email notification system
- [ ] SMS integration (Twilio)
- [ ] Webhook handlers

### Week 3: Labels & Manifests
- [ ] Label generation and printing
- [ ] Customs manifest creation
- [ ] Cloud printing integration
- [ ] PDF generation

### Week 4: Analytics & Polish
- [ ] Advanced reporting dashboard
- [ ] Multi-location support
- [ ] UI/UX refinements
- [ ] Performance optimization

### Phase 2: Premium Features
- [ ] Point of Sale system
- [ ] Warehouse portal
- [ ] Mobile apps (iOS/Android)
- [ ] AI-powered route optimization

---

## 📊 Success Metrics

- Customer can complete shipment in <3 minutes
- 95% automated notification delivery
- 99.9% tracking accuracy
- <2% payment failure rate
- <1% courier issue rate
- Customer satisfaction score >4.5/5

---

**This roadmap transforms D.N Express from basic CRM to full Sethwan-integrated logistics platform.**

Create updated API documentation and start Phase 1 implementation next!
