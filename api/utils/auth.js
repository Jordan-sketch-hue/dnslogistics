/**
 * Authentication Utilities
 * 
 * Helper functions for:
 * - Password hashing and verification
 * - JWT token generation and verification
 * - Input validation
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator = require('validator');

/**
 * Password Management
 */

/**
 * Hash a password using bcryptjs
 * @param {string} password - Plain text password
 * @returns {Promise<string>} - Hashed password
 */
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    return await bcrypt.hash(password, salt);
};

/**
 * Compare plain password with hash
 * @param {string} password - Plain text password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} - True if password matches
 */
const comparePassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
};

/**
 * Validate password strength
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter
 * - At least 1 lowercase letter
 * - At least 1 number
 * @param {string} password - Password to validate
 * @returns {object} - { valid: boolean, errors: string[] }
 */
const validatePassword = (password) => {
    const errors = [];

    if (!password || password.length < 8) {
        errors.push('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
        errors.push('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
        errors.push('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
        errors.push('Password must contain at least one number');
    }

    return {
        valid: errors.length === 0,
        errors
    };
};

/**
 * JWT Token Management
 */

/**
 * Generate JWT access token
 * @param {object} user - User object
 * @returns {string} - JWT token
 */
const generateAccessToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email,
        role: user.role,
        companyName: user.companyName
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    });
};

/**
 * Generate JWT refresh token
 * @param {object} user - User object
 * @returns {string} - JWT refresh token
 */
const generateRefreshToken = (user) => {
    const payload = {
        id: user.id,
        email: user.email
    };

    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d'
    });
};

/**
 * Generate token pair (access + refresh)
 * @param {object} user - User object
 * @returns {object} - { accessToken, refreshToken }
 */
const generateTokenPair = (user) => {
    return {
        accessToken: generateAccessToken(user),
        refreshToken: generateRefreshToken(user)
    };
};

/**
 * Verify refresh token and generate new access token
 * @param {string} refreshToken - Refresh token
 * @returns {object} - { accessToken, refreshToken } or null if invalid
 */
const refreshAccessToken = (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        
        const newAccessToken = jwt.sign(
            { id: decoded.id, email: decoded.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '7d' }
        );

        return {
            accessToken: newAccessToken,
            refreshToken: refreshToken // Keep the same refresh token
        };
    } catch (error) {
        return null;
    }
};

/**
 * Input Validation
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - True if valid email
 */
const isValidEmail = (email) => {
    return validator.isEmail(email);
};

/**
 * Validate phone number (basic)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - True if valid phone
 */
const isValidPhone = (phone) => {
    // Basic validation: at least 10 digits
    const cleaned = phone.replace(/\D/g, '');
    return cleaned.length >= 10;
};

/**
 * Validate required fields
 * @param {object} data - Data object to validate
 * @param {string[]} requiredFields - Array of required field names
 * @returns {object} - { valid: boolean, missingFields: string[] }
 */
const validateRequiredFields = (data, requiredFields) => {
    const missingFields = requiredFields.filter(field => 
        !data[field] || data[field].toString().trim() === ''
    );

    return {
        valid: missingFields.length === 0,
        missingFields
    };
};

/**
 * Sanitize user input
 * @param {object} data - Data to sanitize
 * @returns {object} - Sanitized data
 */
const sanitizeInput = (data) => {
    const sanitized = {};
    
    for (const [key, value] of Object.entries(data)) {
        if (typeof value === 'string') {
            // Remove leading/trailing whitespace and trim
            sanitized[key] = validator.trim(value);
            // Escape HTML characters
            sanitized[key] = validator.escape(sanitized[key]);
        } else {
            sanitized[key] = value;
        }
    }
    
    return sanitized;
};

/**
 * Format user response (exclude sensitive data)
 * @param {object} user - User object
 * @returns {object} - Formatted user object
 */
const formatUserResponse = (user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
};

module.exports = {
    // Password functions
    hashPassword,
    comparePassword,
    validatePassword,
    
    // Token functions
    generateAccessToken,
    generateRefreshToken,
    generateTokenPair,
    refreshAccessToken,
    
    // Validation functions
    isValidEmail,
    isValidPhone,
    validateRequiredFields,
    sanitizeInput,
    formatUserResponse
};
