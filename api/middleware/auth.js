/**
 * Authentication Middleware
 * 
 * Handles JWT token verification and user authentication
 * Applied to protected routes
 */

const jwt = require('jsonwebtoken');

/**
 * Verify JWT token in Authorization header
 * Format: Authorization: Bearer <token>
 */
const verifyToken = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No authorization header provided'
            });
        }

        const parts = authHeader.split(' ');
        
        if (parts.length !== 2 || parts[0] !== 'Bearer') {
            return res.status(401).json({
                success: false,
                message: 'Invalid authorization header format. Use: Bearer <token>'
            });
        }

        const token = parts[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                code: 'TOKEN_EXPIRED'
            });
        }

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }

        res.status(401).json({
            success: false,
            message: 'Authentication failed'
        });
    }
};

/**
 * Check if user has required role
 * Usage: app.get('/route', verifyToken, authorize('admin'), handler)
 */
const authorize = (requiredRole) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: 'User not authenticated'
            });
        }

        if (req.user.role !== requiredRole) {
            return res.status(403).json({
                success: false,
                message: `This action requires ${requiredRole} role`
            });
        }

        next();
    };
};

/**
 * Check if user owns the requested resource
 */
const authorizeOwner = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            message: 'User not authenticated'
        });
    }

    // Allow access if user ID in URL matches current user
    // or if user is admin
    const userId = req.params.id;
    if (req.user.id === userId || req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({
            success: false,
            message: 'Not authorized to access this resource'
        });
    }
};

module.exports = {
    verifyToken,
    authorize,
    authorizeOwner
};
