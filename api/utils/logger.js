/**
 * Logger Utility
 * Centralized logging system for all API operations
 */

class Logger {
    constructor() {
        this.logLevel = process.env.LOG_LEVEL || 'debug';
        this.levels = {
            error: 0,
            warn: 1,
            info: 2,
            debug: 3
        };
    }

    /**
     * Log an error
     */
    error(message, details = null) {
        if (this.levels[this.logLevel] >= this.levels.error) {
            console.error(`❌ ERROR: ${message}`, details || '');
        }
    }

    /**
     * Log a warning
     */
    warn(message, details = null) {
        if (this.levels[this.logLevel] >= this.levels.warn) {
            console.warn(`⚠️  WARN: ${message}`, details || '');
        }
    }

    /**
     * Log info
     */
    info(message, details = null) {
        if (this.levels[this.logLevel] >= this.levels.info) {
            console.log(`ℹ️  INFO: ${message}`, details || '');
        }
    }

    /**
     * Log debug
     */
    debug(message, details = null) {
        if (this.levels[this.logLevel] >= this.levels.debug) {
            console.log(`🔍 DEBUG: ${message}`, details || '');
        }
    }

    /**
     * Log API request
     */
    logRequest(method, path, user = null) {
        const userInfo = user ? ` [${user}]` : '';
        this.info(`${method} ${path}${userInfo}`);
    }

    /**
     * Log API response
     */
    logResponse(status, message) {
        const statusIcon = status >= 400 ? '❌' : '✅';
        this.info(`${statusIcon} Response: ${status} - ${message}`);
    }
}

module.exports = new Logger();
