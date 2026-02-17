/**
 * Validation Utilities
 * D.N Express Logistics - Input Validation & Sanitization
 * 
 * Helper functions for validating user input across the platform
 */

const validator = require('validator');

class ValidationHelper {
    /**
     * Validate email
     */
    static isValidEmail(email) {
        return validator.isEmail(email);
    }

    /**
     * Validate password strength
     * Requirements: min 8 chars, 1 uppercase, 1 lowercase, 1 number
     */
    static isStrongPassword(password) {
        return validator.isStrongPassword(password, {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 0
        });
    }

    /**
     * Validate phone number
     */
    static isValidPhone(phone) {
        return validator.isMobilePhone(phone, 'any', { strictMode: false });
    }

    /**
     * Validate ZIP code
     */
    static isValidZipCode(zipCode) {
        return validator.isPostalCode(zipCode, 'US');
    }

    /**
     * Sanitize string input
     */
    static sanitizeString(input) {
        return validator.trim(validator.escape(input));
    }

    /**
     * Validate tracking number format
     */
    static isValidTrackingNumber(trackingNumber) {
        // Format: TRK-XXXXXX or similar
        return /^[A-Z]{3}-[A-Z0-9]{6}$/.test(trackingNumber);
    }

    /**
     * Validate customer number format
     */
    static isValidCustomerNumber(customerNumber) {
        // Format: DNX-XXXXXX
        return /^DNX-\d{6}$/.test(customerNumber);
    }

    /**
     * Validate shipment weight
     */
    static isValidWeight(weight) {
        return !isNaN(weight) && weight > 0 && weight < 1000;
    }

    /**
     * Validate array of required fields
     */
    static validateRequiredFields(obj, requiredFields) {
        const missing = requiredFields.filter(field => !obj[field]);
        if (missing.length > 0) {
            return {
                valid: false,
                message: `Missing required fields: ${missing.join(', ')}`
            };
        }
        return { valid: true };
    }
}

module.exports = ValidationHelper;
