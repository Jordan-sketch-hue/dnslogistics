/**
 * Authentication System - Connected to Backend API
 * Handles login, registration, and token management
 * Communicates with Express backend at /api/auth endpoints
 */
class UserAuth {
    constructor() {
        // API configuration
        this.apiURL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';
        this.currentUser = this.loadCurrentUser();
    }

    /**
     * Load current user from localStorage if exists
     */
    loadCurrentUser() {
        const stored = localStorage.getItem('dnexpress_currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Save user data to localStorage
     */
    saveCurrentUser(user) {
        localStorage.setItem('dnexpress_currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    /**
     * Get JWT tokens from localStorage
     */
    getTokens() {
        const stored = localStorage.getItem('dnexpress_tokens');
        return stored ? JSON.parse(stored) : null;
    }

    /**
     * Save JWT tokens to localStorage
     */
    saveTokens(tokens) {
        localStorage.setItem('dnexpress_tokens', JSON.stringify(tokens));
    }

    /**
     * Get access token for API requests
     */
    getAccessToken() {
        const tokens = this.getTokens();
        return tokens ? tokens.accessToken : null;
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn() {
        return this.currentUser !== null && this.getAccessToken() !== null;
    }

    /**
     * Validate email format
     */
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    /**
     * Validate password strength
     * Requirements: 8+ chars, uppercase, lowercase, number
     */
    validatePassword(password) {
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password);
    }

    /**
     * Register new customer account via backend API
     * @param {string} companyName - Company name
     * @param {string} firstName - First name
     * @param {string} lastName - Last name
     * @param {string} email - Email address
     * @param {string} phone - Phone number
     * @param {string} password - Password
     * @returns {Promise<object>} - Success/error response
     */
    async signup(companyName, firstName, lastName, email, phone, password) {
        // Validate inputs
        if (!companyName) return { success: false, message: 'Please enter company name' };
        if (!firstName || !lastName) return { success: false, message: 'Please enter your name' };
        if (!this.validateEmail(email)) return { success: false, message: 'Invalid email format' };
        if (!this.validatePassword(password)) {
            return { success: false, message: 'Password must have 8+ chars, uppercase, lowercase, and numbers' };
        }

        try {
            // Call backend API to register
            const response = await fetch(`${this.apiURL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    companyName,
                    firstName,
                    lastName,
                    email,
                    phone,
                    password
                })
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, message: data.message || 'Registration failed' };
            }

            // Save user and tokens
            this.saveCurrentUser(data.user);
            this.saveTokens(data.tokens);

            console.log('✓ Account created successfully');
            return { success: true, message: 'Account created successfully!' };

        } catch (error) {
            console.error('Registration error:', error);
            return { success: false, message: 'Registration failed. Please try again.' };
        }
    }

    /**
     * Login customer via backend API
     * @param {string} email - Email address
     * @param {string} password - Password
     * @returns {Promise<object>} - Success/error response with tokens
     */
    async login(email, password) {
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Invalid email format' };
        }

        if (!password) {
            return { success: false, message: 'Please enter password' };
        }

        try {
            // Call backend API to login
            const response = await fetch(`${this.apiURL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (!data.success) {
                return { success: false, message: data.message || 'Login failed' };
            }

            // Save user and tokens
            this.saveCurrentUser(data.user);
            this.saveTokens(data.tokens);

            console.log('✓ Login successful');
            return { success: true, message: 'Login successful!' };

        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'Login failed. Please try again.' };
        }
    }
    /**
     * Logout user and clear stored data
     */
    logout() {
        localStorage.removeItem('dnexpress_currentUser');
        localStorage.removeItem('dnexpress_tokens');
        this.currentUser = null;
    }

    /**
     * Get user profile
     */
    getProfile() {
        return this.currentUser;
    }

    /**
     * Update user profile via backend API
     */
    async updateProfile(data) {
        if (!this.currentUser) return { success: false, message: 'Not logged in' };

        try {
            const response = await fetch(`${this.apiURL}/customers/${this.currentUser.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.getAccessToken()}`
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!result.success) {
                return { success: false, message: result.message || 'Update failed' };
            }

            // Update stored user
            this.saveCurrentUser(result.user);

            return { success: true, message: 'Profile updated!' };

        } catch (error) {
            console.error('Profile update error:', error);
            return { success: false, message: 'Failed to update profile' };
        }
    }
}

// Initialize auth
const auth = new UserAuth();

/**
 * Toggle between login and signup forms
 */
function toggleAuthForms() {
    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');

    if (loginForm.style.display === 'none') {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
    }
}

/**
 * Handle login form submission
 * Calls backend API to authenticate user
 */
async function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Signing in...';

    const result = await auth.login(email, password);

    if (result.success) {
        showSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showError(result.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}

/**
 * Handle signup form submission
 * Calls backend API to register new account
 */
async function handleSignup(event) {
    event.preventDefault();

    const companyName = document.getElementById('signup-company').value;
    const firstName = document.getElementById('signup-firstName').value;
    const lastName = document.getElementById('signup-lastName').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    // Show loading state
    const submitBtn = event.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating account...';

    const result = await auth.signup(companyName, firstName, lastName, email, phone, password);

    if (result.success) {
        showSuccess('Account created! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);
    } else {
        showError(result.message);
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
    }
}
    } else {
        showError(result.message);
    }
}

// Handle signup
function handleSignup(event) {
    event.preventDefault();

    const firstName = document.getElementById('signup-first-name').value;
    const lastName = document.getElementById('signup-last-name').value;
    const email = document.getElementById('signup-email').value;
    const phone = document.getElementById('signup-phone').value;
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;

    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }

    const result = auth.signup(firstName, lastName, email, phone, password);

    if (result.success) {
        showSuccess('Account created successfully! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
    } else {
        showError(result.message);
    }
}

// Show success modal
function showSuccess(message) {
    document.getElementById('successMessage').textContent = message;
    const modal = document.getElementById('successModal');
    modal.classList.add('active');
}

// Show error modal
function showError(message) {
    document.getElementById('errorMessage').textContent = message;
    const modal = document.getElementById('errorModal');
    modal.classList.add('active');
}

// Close modal
function closeModal() {
    document.getElementById('successModal').classList.remove('active');
    document.getElementById('errorModal').classList.remove('active');
}

// Check auth status
function checkAuth() {
    if (auth.isLoggedIn()) {
        const user = auth.getProfile();
        // User is logged in
        if (window.location.pathname.includes('auth.html')) {
            window.location.href = 'dashboard.html';
        }
    } else {
        // User is not logged in
        if (!window.location.pathname.includes('auth.html') && 
            !window.location.pathname.includes('index.html')) {
            window.location.href = 'auth.html';
        }
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { UserAuth, auth };
}
