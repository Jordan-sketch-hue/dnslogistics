# Logistics Platform API Documentation

## Backend API Reference

**Version:** 1.0.0  
**Last Updated:** February 2026  
**Base URL:** `http://localhost:5000/api` for development

---

## Table of Contents

1. [Authentication](#authentication)
2. [Core Concepts](#core-concepts)
3. [API Endpoints](#api-endpoints)
4. [Status Codes](#status-codes)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Webhooks](#webhooks)
8. [Database Schema](#database-schema)
9. [Deployment](#deployment)

---

## Authentication

### JWT (JSON Web Tokens)

All protected endpoints require a valid JWT token in the Authorization header.

**Format:**
```
Authorization: Bearer <token>
```

**Token Payload:**
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "role": "customer|admin",
  "companyName": "Company Name",
  "iat": 1234567890,
  "exp": 1234654290
}
```

**Token Lifespan:**
- Access Token: 7 days
- Refresh Token: 30 days

### Getting Tokens

Tokens are issued on login/register:

```bash
POST /auth/login
{
  "email": "customer@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "tokens": {
    "accessToken": "eyJ0eXAi...",
    "refreshToken": "eyJ0eXAi..."
  }
}
```

### Refreshing Tokens

```bash
POST /auth/refresh
{
  "refreshToken": "eyJ0eXAi..."
}

Response:
{
  "success": true,
  "tokens": {
    "accessToken": "eyJ0eXAi...",
    "refreshToken": "eyJ0eXAi..."
  }
}
```

---

## Core Concepts

### User Roles

- **customer**: User with standard account access
- **admin**: System administrator with full access

### Shipment Statuses

- `pending` - Shipment created, awaiting pickup
- `pickup` - Shipment picked up from origin
- `in-transit` - Shipment in transit to destination
- `out-for-delivery` - Shipment out for local delivery
- `delivered` - Shipment delivered successfully
- `cancelled` - Shipment cancelled

### Service Levels

- `standard` - Regular delivery (5-7 business days)
- `express` - Fast delivery (2-3 business days)
- `overnight` - Next day delivery

### Inventory Status

- `active` - Item available for use
- `inactive` - Item temporarily unavailable
- `discontinued` - Item no longer available

---

## API Endpoints

### Authentication Endpoints

#### Register New Customer

```http
POST /auth/register
Content-Type: application/json

{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john@example.com",
  "phone": "+1-555-0123",
  "password": "SecurePass123",
  "address": "123 Main Street",
  "city": "New York",
  "state": "NY",
  "zipCode": "10001",
  "country": "USA"
}

Response (201):
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "cust_1234567890_abc123",
    "email": "john@example.com",
    "role": "customer",
    "status": "active",
    "createdAt": "2026-02-11T10:30:00Z",
    "profile": { ... }
  },
  "tokens": {
    "accessToken": "eyJ0eXAi...",
    "refreshToken": "eyJ0eXAi..."
  }
}
```

#### Login

```http
POST /auth/login
Content-Type: application/json

{
{\n  "email": "john@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "success": true,
  "message": "Login successful",
  "user": { ... },
  "tokens": { ... }
}
```

#### Logout

```http
POST /auth/logout
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Logout successful"
}
```

---

### Customer Endpoints

#### Get Customer Profile

```http
GET /customers/:customerId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": {
    "id": "id_1234567890_abc123",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "status": "active",
    "profile": {
      "address": "123 Main Street",
      "city": "New York",
      "country": "USA"
    },
    "settings": {
      "currency": "USD",
      "language": "en",
      "timezone": "UTC"
    }
  }
}
```

#### Update Customer Profile

```http
PUT /customers/:customerId
Authorization: Bearer <token>
Content-Type: application/json

{
  "phone": "+1-555-0103",
  "profile": {
    "city": "San Francisco"
  }
}

Response (200):
{
  "success": true,
  "message": "Profile updated successfully",
  "user": { ... }
}
```

#### Get Customer Summary

```http
GET /customers/:customerId/info
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "user": { ... },
  "summary": {
    "totalShipments": 45,
    "totalInventoryItems": 120,
    "activeShipments": 12,
    "deliveredShipments": 33,
    "totalRevenue": 2500.00
  },
  "recentShipments": [ ... ]
}
```

---

### Shipment Endpoints

#### Create Shipment

```http
POST /shipments
Authorization: Bearer <token>
Content-Type: application/json

{
  "origin": {
    "address": "123 Main Street",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001",
    "country": "USA",
    "contactName": "Sender Name",
    "contactPhone": "+1-555-0101"
  },
  "destination": {
    "address": "456 Oak Avenue",
    "city": "Los Angeles",
    "state": "CA",
    "zipCode": "90001",
    "country": "USA",
    "contactName": "Recipient Name",
    "contactPhone": "+1-555-0103"
  },
  "package": {
    "weight": 5.5,
    "dimensions": {
      "length": 12,
      "width": 8,
      "height": 6
    },
    "description": "Electronics shipment",
    "contents": ["Laptop", "Mouse", "Keyboard"]
  },
  "service": "express",
  "rate": 75.00,
  "notes": "Handle with care"
}

Response (201):
{
  "success": true,
  "message": "Shipment created successfully",
  "shipment": {
    "id": "id_1234567890_abc123",
    "trackingNumber": "DNE1234ABC567",
    "customerId": "id_1234567890_abc123",
    "origin": { ... },
    "destination": { ... },
    "status": "pending",
    "statusHistory": [
      {
        "status": "pending",
        "timestamp": "2026-02-11T10:30:00Z",
        "location": "Kingston",
        "notes": "Shipment created"
      }
    ],
    "createdAt": "2026-02-11T10:30:00Z"
  }
}
```

#### List Shipments

```http
GET /shipments?status=in-transit&limit=10&offset=0
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "shipments": [ ... ],
  "pagination": {
    "total": 45,
    "limit": 10,
    "offset": 0,
    "returned": 10
  }
}
```

#### Get Shipment Details

```http
GET /shipments/:shipmentId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "shipment": { ... }
}
```

#### Track Shipment (Public)

```http
GET /shipments/track/DNE1234ABC567
(No authentication required)

Response (200):
{
  "success": true,
  "shipment": {
    "trackingNumber": "DNE1234ABC567",
    "status": "in-transit",
    "origin": {
      "city": "Kingston",
      "country": "Jamaica"
    },
    "destination": {
      "city": "Montego Bay",
      "country": "Jamaica"
    },
    "statusHistory": [ ... ],
    "estimatedDelivery": "2026-02-13T17:00:00Z"
  }
}
```

---

### Inventory Endpoints

#### Add Inventory Item

```http
POST /inventory
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Cardboard Box",
  "description": "Standard shipping box",
  "sku": "BOX-001",
  "quantity": 500,
  "location": "Warehouse A"
}

Response (201):
{
  "success": true,
  "message": "Item added to inventory",
  "item": {
    "id": "id_1234567890_abc123",
    "name": "Cardboard Box",
    "sku": "BOX-001",
    "quantity": 500,
    "status": "active",
    "createdAt": "2026-02-11T10:30:00Z"
  }
}
```

#### List Inventory

```http
GET /inventory?location=Warehouse A&limit=50
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "items": [ ... ],
  "pagination": { ... },
  "summary": {
    "totalItems": 120,
    "totalQuantity": 5500,
    "activeItems": 118
  }
}
```

#### Update Inventory

```http
PUT /inventory/:itemId
Authorization: Bearer <token>
Content-Type: application/json

{
  "quantity": 450
}

Response (200):
{
  "success": true,
  "message": "Inventory item updated successfully",
  "item": { ... }
}
```

#### Delete Inventory Item

```http
DELETE /inventory/:itemId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "message": "Inventory item removed successfully"
}
```

---

### Status Tracking Endpoints

#### Get Shipment Status

```http
GET /status/:shipmentId
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "status": {
    "shipmentId": "id_1234567890_abc123",
    "trackingNumber": "DNE1234ABC567",
    "currentStatus": "in-transit",
    "statusHistory": [ ... ],
    "estimatedDelivery": "2026-02-13T17:00:00Z",
    "lastUpdated": "2026-02-11T15:30:00Z"
  }
}
```

#### Update Shipment Status

```http
POST /status/:shipmentId
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "out-for-delivery",
  "location": "Montego Bay",
  "notes": "Scheduled for delivery this afternoon"
}

Response (200):
{
  "success": true,
  "message": "Status updated successfully",
  "shipment": { ... }
}
```

#### Get Status History

```http
GET /status/list/:customerId?limit=20
Authorization: Bearer <token>

Response (200):
{
  "success": true,
  "statusUpdates": [ ... ],
  "pagination": { ... }
}
```

---

### Admin Endpoints

#### Get Dashboard Metrics

```http
GET /admin/dashboard
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "dashboard": {
    "totalUsers": 156,
    "activeUsers": 142,
    "totalShipments": 4532,
    "activeShipments": 453,
    "deliveredShipments": 3890,
    "totalRevenue": "145230.50",
    "inventoryItems": 2340,
    "systemStatus": "healthy"
  }
}
```

#### List All Users

```http
GET /admin/users?status=active&limit=50
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "users": [ ... ],
  "pagination": { ... }
}
```

#### Generate Reports

```http
GET /admin/reports?type=shipments&startDate=2026-01-11&endDate=2026-02-11
Authorization: Bearer <admin-token>

Response (200):
{
  "success": true,
  "report": {
    "dateRange": { ... },
    "shipments": {
      "total": 156,
      "delivered": 145,
      "byStatus": { ... }
    },
    "revenue": { ... }
  }
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid input |
| 401 | Unauthorized - Missing/invalid token |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 500 | Server Error - Internal error |

---

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "error": {
    "details": "Additional error information"
  }
}
```

### Common Error Codes

- `TOKEN_EXPIRED` - JWT token has expired
- `INVALID_TOKEN` - JWT token is invalid
- `EMAIL_EXISTS` - Email already registered
- `INVALID_PASSWORD` - Password doesn't meet requirements
- `NOT_FOUND` - Resource not found
- `UNAUTHORIZED` - Missing authorization

---

## Rate Limiting

Current rate limits (per user):
- **Auth endpoints**: 10 requests per minute
- **Read endpoints**: 100 requests per minute
- **Write endpoints**: 50 requests per minute

Rate limit info returned in response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1675080600
```

---

## Webhooks

Webhooks notify external systems of important events.

### Webhook Events

- `shipment.created` - New shipment created
- `shipment.status_updated` - Shipment status changed
- `shipment.delivered` - Shipment delivered
- `customer.registered` - New customer registered
- `customer.profile_updated` - Customer profile updated

### Webhook Configuration

Configure webhooks in customer settings to receive POST requests at your specified URL.

**Webhook Payload Example:**
```json
{
  "event": "shipment.status_updated",
  "timestamp": "2026-02-11T10:30:00Z",
  "data": {
    "shipmentId": "id_1234567890_abc123",
    "trackingNumber": "DNE1234ABC567",
    "newStatus": "in-transit"
  },
  "signature": "sha256_signature_for_verification"
}
```

---

## Database Schema

### Users Table

```
id (PK)
companyName
firstName
lastName
email (UNIQUE)
phone
password (hashed)
role (customer|admin)
status (active|inactive)
createdAt
updatedAt
profile (JSON)
  - address
  - city
  - state
  - zipCode
  - country
  - businessType
settings (JSON)
  - currency
  - language
  - timezone
  - notifications
```

### Shipments Table

```
id (PK)
trackingNumber (UNIQUE)
customerId (FK)
companyId (FK)
origin (JSON)
destination (JSON)
package (JSON)
service (standard|express|overnight)
rate
status
statusHistory (JSON Array)
createdAt
updatedAt
estimatedDelivery
actualDelivery
notes
```

### Inventory Table

```
id (PK)
companyId (FK)
name
description
sku (UNIQUE)
quantity
location
status (active|inactive|discontinued)
lastUpdated
createdAt
```

### Status Updates Table

```
id (PK)
shipmentId (FK)
companyId (FK)
status
location
timestamp
notes
updatedBy
```

---

## Deployment

### Prerequisites

- Node.js 16.x or higher
- npm or yarn
- Environment variables configured

### Installation

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Update .env with your values
nano .env
```

### Running Locally

```bash
# Development (with auto-reload)
npm run dev

# Production
npm start
```

### Docker Deployment

```bash
# Build image
docker build -t dnexpress-api:1.0.0 .

# Run container
docker run -p 5000:5000 --env-file .env dnexpress-api:1.0.0
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Update JWT secrets (strong, random values)
- [ ] Configure CORS origins
- [ ] Set up HTTPS/SSL
- [ ] Configure database (production)
- [ ] Set up logging/monitoring
- [ ] Configure email service
- [ ] Set up backup strategy
- [ ] Implement rate limiting
- [ ] Security headers enabled

---

## Support

For API support or issues:
- Documentation: See README.md for setup instructions
- Issues: Submit via GitHub repository issues
