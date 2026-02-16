/**
 * Global Error Handler & Notification System
 * Provides comprehensive error tracking and user-friendly notifications
 * 
 * Features:
 * - Centralized error logging
 * - User-friendly error messages
 * - Error categorization (Network, Validation, Auth, Server, etc.)
 * - Stack trace capture for debugging
 * - Auto-recovery suggestions
 */

class ErrorHandler {
    constructor() {
        this.errors = [];
        this.maxErrors = 50; // Keep last 50 errors in memory
        this.notificationContainer = null;
        this.init();
    }

    /**
     * Initialize error handler
     */
    init() {
        // Create notification container
        this.createNotificationContainer();
        
        // Global error handlers
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, event.filename, event.lineno, event.colno);
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handlePromiseRejection(event.reason, event.promise);
        });

        console.log('✓ Error Handler initialized');
    }

    /**
     * Create notification container for toast messages
     */
    createNotificationContainer() {
        if (!this.notificationContainer) {
            this.notificationContainer = document.createElement('div');
            this.notificationContainer.id = 'error-notification-container';
            this.notificationContainer.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 999999;
                max-width: 400px;
                pointer-events: none;
            `;
            document.body.appendChild(this.notificationContainer);
        }
    }

    /**
     * Handle global JavaScript errors
     */
    handleGlobalError(error, filename, lineno, colno) {
        const errorObj = {
            type: 'JavaScript Error',
            message: error?.message || String(error),
            stack: error?.stack,
            filename,
            lineno,
            colno,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.logError(errorObj);
        this.showNotification('error', 'An unexpected error occurred', error?.message);

        // Send to server if backend is available
        this.sendToServer(errorObj);
    }

    /**
     * Handle unhandled promise rejections
     */
    handlePromiseRejection(reason, promise) {
        const errorObj = {
            type: 'Promise Rejection',
            message: reason?.message || String(reason),
            stack: reason?.stack,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.logError(errorObj);
        
        // Don't show notification for handled API errors (they show their own)
        if (!reason?.isHandled) {
            this.showNotification('error', 'Request Failed', this.getUserFriendlyMessage(reason));
        }

        this.sendToServer(errorObj);
    }

    /**
     * Handle API errors
     */
    handleAPIError(error, endpoint, method = 'GET') {
        const errorObj = {
            type: 'API Error',
            endpoint,
            method,
            status: error.response?.status,
            statusText: error.response?.statusText,
            message: error.response?.data?.message || error.message,
            data: error.response?.data,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.logError(errorObj);

        // Categorize error and show appropriate message
        const { title, message, suggestion } = this.categorizeAPIError(errorObj);
        this.showNotification('error', title, `${message}${suggestion ? '\n' + suggestion : ''}`, 7000);

        return errorObj;
    }

    /**
     * Handle validation errors
     */
    handleValidationError(field, message) {
        const errorObj = {
            type: 'Validation Error',
            field,
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.logError(errorObj);
        this.showNotification('warning', 'Validation Error', message, 4000);

        // Highlight the field if it exists
        const element = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
        if (element) {
            element.style.borderColor = '#F44336';
            element.focus();
            setTimeout(() => {
                element.style.borderColor = '';
            }, 3000);
        }

        return errorObj;
    }

    /**
     * Handle authentication errors
     */
    handleAuthError(message = 'Authentication failed') {
        const errorObj = {
            type: 'Authentication Error',
            message,
            timestamp: new Date().toISOString(),
            url: window.location.href
        };

        this.logError(errorObj);
        this.showNotification('error', 'Authentication Error', message, 5000);

        // Redirect to login after delay if needed
        if (message.includes('session') || message.includes('expired')) {
            setTimeout(() => {
                window.location.href = 'auth.html?error=session_expired';
            }, 2000);
        }

        return errorObj;
    }

    /**
     * Categorize API errors and provide helpful messages
     */
    categorizeAPIError(errorObj) {
        const status = errorObj.status;
        let title = 'Request Failed';
        let message = errorObj.message || 'An error occurred';
        let suggestion = '';

        switch (status) {
            case 400:
                title = 'Invalid Request';
                suggestion = 'Please check your input and try again.';
                break;
            case 401:
                title = 'Authentication Required';
                message = 'Your session has expired.';
                suggestion = 'Please log in again.';
                break;
            case 403:
                title = 'Access Denied';
                message = 'You don\'t have permission to perform this action.';
                break;
            case 404:
                title = 'Not Found';
                message = 'The requested resource was not found.';
                suggestion = 'Please verify the information and try again.';
                break;
            case 429:
                title = 'Too Many Requests';
                message = 'You\'re making too many requests.';
                suggestion = 'Please wait a moment and try again.';
                break;
            case 500:
            case 502:
            case 503:
                title = 'Server Error';
                message = 'The server encountered an error.';
                suggestion = 'Please try again later or contact support if the issue persists.';
                break;
            case 0:
            case undefined:
                title = 'Network Error';
                message = 'Unable to connect to the server.';
                suggestion = 'Please check your internet connection and try again.';
                break;
        }

        return { title, message, suggestion };
    }

    /**
     * Get user-friendly error message
     */
    getUserFriendlyMessage(error) {
        if (!error) return 'An unknown error occurred';
        
        if (typeof error === 'string') return error;
        
        if (error.message) {
            // Convert technical messages to user-friendly ones
            if (error.message.includes('Network') || error.message.includes('fetch')) {
                return 'Unable to connect. Please check your internet connection.';
            }
            if (error.message.includes('timeout')) {
                return 'Request timed out. Please try again.';
            }
            if (error.message.includes('JSON')) {
                return 'Invalid response from server. Please try again.';
            }
            return error.message;
        }

        return 'An unexpected error occurred';
    }

    /**
     * Log error to console and memory
     */
    logError(errorObj) {
        // Add to memory
        this.errors.push(errorObj);
        
        // Keep only last maxErrors
        if (this.errors.length > this.maxErrors) {
            this.errors.shift();
        }

        // Console logging with styling
        console.group(`%c${errorObj.type}`, 'color: #F44336; font-weight: bold;');
        console.error('Message:', errorObj.message);
        if (errorObj.endpoint) console.log('Endpoint:', errorObj.endpoint);
        if (errorObj.stack) console.log('Stack:', errorObj.stack);
        console.log('Timestamp:', errorObj.timestamp);
        console.groupEnd();
    }

    /**
     * Show notification to user
     */
    showNotification(type = 'info', title, message, duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `error-notification error-notification-${type}`;
        
        const colors = {
            error: { bg: '#F44336', icon: 'fa-exclamation-circle' },
            warning: { bg: '#FF9800', icon: 'fa-exclamation-triangle' },
            success: { bg: '#4CAF50', icon: 'fa-check-circle' },
            info: { bg: '#2196F3', icon: 'fa-info-circle' }
        };

        const color = colors[type] || colors.info;

        notification.style.cssText = `
            background: ${color.bg};
            color: white;
            padding: 16px 20px;
            border-radius: 8px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            pointer-events: auto;
            cursor: pointer;
            animation: slideIn 0.3s ease-out;
            max-width: 400px;
            word-wrap: break-word;
        `;

        notification.innerHTML = `
            <div style="display: flex; align-items: start; gap: 12px;">
                <i class="fas ${color.icon}" style="font-size: 20px; margin-top: 2px;"></i>
                <div style="flex: 1;">
                    <div style="font-weight: 600; margin-bottom: 4px;">${title}</div>
                    <div style="font-size: 14px; opacity: 0.95;">${message}</div>
                </div>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 0; opacity: 0.8;">
                    ×
                </button>
            </div>
        `;

        // Add animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateX(400px); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            @keyframes slideOut {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(400px); opacity: 0; }
            }
        `;
        if (!document.getElementById('error-handler-styles')) {
            style.id = 'error-handler-styles';
            document.head.appendChild(style);
        }

        this.notificationContainer.appendChild(notification);

        // Auto-remove after duration
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, duration);

        // Click to dismiss
        notification.addEventListener('click', () => {
            notification.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        });
    }

    /**
     * Show success message
     */
    showSuccess(title, message, duration = 3000) {
        this.showNotification('success', title, message, duration);
    }

    /**
     * Show info message
     */
    showInfo(title, message, duration = 4000) {
        this.showNotification('info', title, message, duration);
    }

    /**
     * Show warning message
     */
    showWarning(title, message, duration = 4000) {
        this.showNotification('warning', title, message, duration);
    }

    /**
     * Send error to server for logging
     */
    async sendToServer(errorObj) {
        try {
            // Only send if API is available
            const apiUrl = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';
            
            await fetch(`${apiUrl}/errors/log`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(errorObj)
            });
        } catch (error) {
            // Silently fail - don't want error reporting to cause more errors
            console.log('Could not send error to server:', error.message);
        }
    }

    /**
     * Get all logged errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Clear error log
     */
    clearErrors() {
        this.errors = [];
        console.log('✓ Error log cleared');
    }

    /**
     * Export errors for debugging
     */
    exportErrors() {
        const data = JSON.stringify(this.errors, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dnexpress-errors-${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// Create global instance
const errorHandler = new ErrorHandler();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = errorHandler;
}
