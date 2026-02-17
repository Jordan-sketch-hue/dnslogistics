/**
 * Authentication Routes
 * D.N Express Logistics Platform
 * 
 * POST   /api/auth/register  - Register new company/customer account
 * POST   /api/auth/login     - Login existing customer
 * POST   /api/auth/refresh   - Refresh JWT token
 * POST   /api/auth/logout    - Logout user
 */

const express = require('express');
const router = express.Router();
const db = require('../models/database');
const {
    hashPassword,
    comparePassword,
    validatePassword,
    generateTokenPair,
    refreshAccessToken,
    isValidEmail,
    isValidPhone,
    validateRequiredFields,
    sanitizeInput,
    formatUserResponse
} = require('../utils/auth');
const { verifyToken } = require('../middleware/auth');

/**
 * POST /api/auth/register
 * Register new company/customer account
 * 
 * Request Body:
 * {
 *   "companyName": "string",
 *   "firstName": "string",
 *   "lastName": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "password": "string",
 *   "address": "string (optional)",
 *   "city": "string (optional)",
 *   "state": "string (optional)",
 *   "zipCode": "string (optional)",
 *   "country": "string (optional)",
 *   "businessType": "string (optional)"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Account created successfully",
 *   "user": { user object },
 *   "tokens": {
 *     "accessToken": "string",
 *     "refreshToken": "string"
 *   }
 * }
 */
router.post('/register', async (req, res) => {
    try {
        // Validate required fields
        const required = ['companyName', 'firstName', 'lastName', 'email', 'phone', 'password'];
        const validation = validateRequiredFields(req.body, required);
        
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Missing required fields',
                missingFields: validation.missingFields
            });
        }

        // Sanitize input
        const sanitized = sanitizeInput(req.body);

        // Validate email
        if (!isValidEmail(sanitized.email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Validate phone
        if (!isValidPhone(sanitized.phone)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid phone number (minimum 10 digits required)'
            });
        }

        // Check if email already exists
        const existingUser = db.getUserByEmail(sanitized.email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Validate password strength
        const passwordValidation = validatePassword(sanitized.password);
        if (!passwordValidation.valid) {
            return res.status(400).json({
                success: false,
                message: 'Password does not meet requirements',
                errors: passwordValidation.errors
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(sanitized.password);

        // Create user
        const user = db.createUser({
            ...sanitized,
            password: hashedPassword,
            role: 'customer'
        });

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Log this important event
        console.log(`✓ New customer registered: ${user.companyName} (${user.email})`);

        res.status(201).json({
            success: true,
            message: 'Account created successfully',
            user: formatUserResponse(user),
            tokens
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Registration failed',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/login
 * Login existing customer
 * 
 * Request Body:
 * {
 *   "email": "string",
 *   "password": "string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "message": "Login successful",
 *   "user": { user object },
 *   "tokens": {
 *     "accessToken": "string",
 *     "refreshToken": "string"
 *   }
 * }
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate required fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Validate email format
        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid email format'
            });
        }

        // Find user by email
        const user = db.getUserByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Verify password
        const passwordMatch = await comparePassword(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if account is active
        if (user.status !== 'active') {
            return res.status(403).json({
                success: false,
                message: 'Account is not active. Please contact support.'
            });
        }

        // Generate tokens
        const tokens = generateTokenPair(user);

        // Log successful login
        console.log(`✓ Customer logged in: ${user.companyName} (${user.email})`);

        res.json({
            success: true,
            message: 'Login successful',
            user: formatUserResponse(user),
            tokens
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Login failed',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/refresh
 * Refresh JWT access token
 * 
 * Request Body:
 * {
 *   "refreshToken": "string"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "tokens": {
 *     "accessToken": "string",
 *     "refreshToken": "string"
 *   }
 * }
 */
router.post('/refresh', (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({
                success: false,
                message: 'Refresh token is required'
            });
        }

        const tokens = refreshAccessToken(refreshToken);
        
        if (!tokens) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired refresh token'
            });
        }

        res.json({
            success: true,
            message: 'Token refreshed successfully',
            tokens
        });

    } catch (error) {
        console.error('Token refresh error:', error);
        res.status(500).json({
            success: false,
            message: 'Token refresh failed',
            error: error.message
        });
    }
});

/**
 * POST /api/auth/logout
 * Logout user (client-side token deletion)
 * This is a simple endpoint - actual logout is handled by client deleting token
 */
router.post('/logout', verifyToken, (req, res) => {
    console.log(`✓ Customer logged out: ${req.user.email}`);
    
    res.json({
        success: true,
        message: 'Logout successful. Please delete the token from client.'
    });
});

/**
 * GET /api/auth/verify
 * Verify if a token is valid
 */
router.get('/verify', verifyToken, (req, res) => {
    res.json({
        success: true,
        message: 'Token is valid',
        user: {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        }
    });
});

module.exports = router;
