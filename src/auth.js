/**
 * D.N Express Logistics - Authentication System
 * Connected to Backend API
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
        if (!companyName) {
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('companyName', 'Please enter company name');
            }
            return { success: false, message: 'Please enter company name' };
        }
        if (!firstName || !lastName) {
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('firstName', 'Please enter your full name');
            }
            return { success: false, message: 'Please enter your name' };
        }
        if (!this.validateEmail(email)) {
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('email', 'Invalid email format');
            }
            return { success: false, message: 'Invalid email format' };
        }
        if (!this.validatePassword(password)) {
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('password', 'Password must have 8+ chars, uppercase, lowercase, and numbers');
            }
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

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                if (window.errorHandler) {
                    window.errorHandler.showNotification('error', 'Registration Failed', data.message || 'Registration failed');
                }
                return { success: false, message: data.message || 'Registration failed' };
            }

            // Save user and tokens
            this.saveCurrentUser(data.user);
            this.saveTokens(data.tokens);

            console.log('✓ Account created successfully');
            if (window.errorHandler) {
                window.errorHandler.showSuccess('Success', 'Account created successfully!');
            }
            return { success: true, message: 'Account created successfully!' };

        } catch (error) {
            console.error('Registration error:', error);
            if (window.errorHandler) {
                window.errorHandler.handleAPIError(error, '/auth/register', 'POST');
            }
            return { 
                success: false, 
                message: error.message.includes('fetch') 
                    ? 'Unable to connect to server. Please check your connection.' 
                    : 'Registration failed. Please try again.'
            };
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
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('email', 'Invalid email format');
            }
            return { success: false, message: 'Invalid email format' };
        }

        if (!password) {
            if (window.errorHandler) {
                window.errorHandler.handleValidationError('password', 'Please enter password');
            }
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

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();

            if (!data.success) {
                if (window.errorHandler) {
                    window.errorHandler.handleAuthError(data.message || 'Login failed');
                }
                return { success: false, message: data.message || 'Login failed' };
            }

            // Save user and tokens
            this.saveCurrentUser(data.user);
            this.saveTokens(data.tokens);

            console.log('✓ Login successful');
            if (window.errorHandler) {
                window.errorHandler.showSuccess('Welcome Back!', 'Login successful');
            }
            return { success: true, message: 'Login successful!' };

        } catch (error) {
            console.error('Login error:', error);
            if (window.errorHandler) {
                window.errorHandler.handleAPIError(error, '/auth/login', 'POST');
            }
            return { 
                success: false, 
                message: error.message.includes('fetch') 
                    ? 'Unable to connect to server. Please check your connection.' 
                    : 'Login failed. Please try again.'
            };
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

    // Auto-generate company name from user's full name
    const companyName = `${firstName} ${lastName}`;

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

/**
 * OAuth Login Functions
 */

/**
 * Initiate Google OAuth login
 */
function loginWithGoogle() {
    const apiURL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';
    window.location.href = `${apiURL}/auth/google`;
}

/**
 * Initiate Facebook OAuth login
 */
function loginWithFacebook() {
    const apiURL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';
    window.location.href = `${apiURL}/auth/facebook`;
}

/**
 * Handle OAuth callback when redirected back from provider
 * Extracts tokens from URL parameters and saves them
 */
function handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    
    // Check if this is an OAuth callback
    if (urlParams.get('oauth') === 'success') {
        const accessToken = urlParams.get('accessToken');
        const refreshToken = urlParams.get('refreshToken');
        
        if (accessToken && refreshToken) {
            // Save tokens
            const tokens = { accessToken, refreshToken };
            localStorage.setItem('dnexpress_tokens', JSON.stringify(tokens));
            
            // Fetch user profile using the token
            fetchOAuthUserProfile(accessToken);
        }
    }
    
    // Check for OAuth errors
    const error = urlParams.get('error');
    if (error) {
        let errorMessage = 'Authentication failed. Please try again.';
        
        if (error === 'google_auth_failed') {
            errorMessage = 'Google authentication failed. Please try again.';
        } else if (error === 'facebook_auth_failed') {
            errorMessage = 'Facebook authentication failed. Please try again.';
        } else if (error === 'token_generation_failed') {
            errorMessage = 'Failed to generate access token. Please try again.';
        }
        
        if (window.errorHandler) {
            window.errorHandler.showError('Authentication Error', errorMessage);
        } else {
            showError(errorMessage);
        }
        
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

/**
 * Fetch user profile after OAuth login
 */
async function fetchOAuthUserProfile(accessToken) {
    try {
        const apiURL = localStorage.getItem('apiUrl') || 'http://localhost:5000/api';
        
        const response = await fetch(`${apiURL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`
            }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
            // Fetch full user profile
            const profileResponse = await fetch(`${apiURL}/customers/${data.user.id}`, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`
                }
            });
            
            const profileData = await profileResponse.json();
            
            if (profileData.success) {
                // Save user data
                auth.saveCurrentUser(profileData.user);
                
                // Show success message
                if (window.errorHandler) {
                    window.errorHandler.showSuccess('Success!', 'Login successful via OAuth');
                } else {
                    showSuccess('Login successful! Redirecting...');
                }
                
                // Clean URL and redirect to dashboard
                window.history.replaceState({}, document.title, window.location.pathname);
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1500);
            }
        }
    } catch (error) {
        console.error('OAuth profile fetch error:', error);
        if (window.errorHandler) {
            window.errorHandler.showError('Error', 'Failed to load user profile');
        }
    }
}

/**
 * Toggle password visibility
 */
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.parentElement.querySelector('.password-toggle');
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

/**
 * Check password strength in real-time
 */
function checkPasswordStrength() {
    const password = document.getElementById('signup-password').value;
    const fill = document.getElementById('passwordStrengthFill');
    
    if (!fill) return;
    
    // Check requirements
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    // Update requirement indicators
    updateRequirement('req-length', hasLength);
    updateRequirement('req-uppercase', hasUppercase);
    updateRequirement('req-lowercase', hasLowercase);
    updateRequirement('req-number', hasNumber);
    
    // Calculate strength
    let strength = 0;
    if (hasLength) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumber) strength++;
    
    // Update visual indicator
    fill.className = 'password-strength-fill';
    if (strength === 0) {
        fill.style.width = '0%';
    } else if (strength === 1) {
        fill.classList.add('weak');
    } else if (strength === 2) {
        fill.classList.add('fair');
    } else if (strength === 3) {
        fill.classList.add('good');
    } else if (strength === 4) {
        fill.classList.add('strong');
    }
}

/**
 * Update individual requirement indicator
 */
function updateRequirement(id, isMet) {
    const element = document.getElementById(id);
    if (element) {
        if (isMet) {
            element.classList.add('met');
        } else {
            element.classList.remove('met');
        }
    }
}

/**
 * Check if passwords match
 */
function checkPasswordMatch() {
    const password = document.getElementById('signup-password').value;
    const confirmPassword = document.getElementById('signup-confirm-password').value;
    const message = document.getElementById('passwordMatchMessage');
    
    if (!message) return;
    
    if (confirmPassword.length === 0) {
        message.style.display = 'none';
        return;
    }
    
    message.style.display = 'block';
    
    if (password === confirmPassword) {
        message.textContent = '✓ Passwords match';
        message.className = 'match';
    } else {
        message.textContent = '✗ Passwords do not match';
        message.className = 'no-match';
    }
}

/**
 * Check profile password strength (for dashboard)
 */
function checkProfilePasswordStrength() {
    const password = document.getElementById('profilePassword')?.value;
    const fill = document.getElementById('profilePasswordStrengthFill');
    
    if (!fill || !password) return;
    
    const hasLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    
    let strength = 0;
    if (hasLength) strength++;
    if (hasUppercase) strength++;
    if (hasLowercase) strength++;
    if (hasNumber) strength++;
    
    fill.className = 'password-strength-fill';
    if (strength === 0) {
        fill.style.width = '0%';
    } else if (strength === 1) {
        fill.classList.add('weak');
    } else if (strength === 2) {
        fill.classList.add('fair');
    } else if (strength === 3) {
        fill.classList.add('good');
    } else if (strength === 4) {
        fill.classList.add('strong');
    }
}

// Make functions globally available for onclick handlers
window.auth = auth;
window.toggleAuthForms = toggleAuthForms;
window.handleLogin = handleLogin;
window.handleSignup = handleSignup;
window.showSuccess = showSuccess;
window.showError = showError;
window.closeModal = closeModal;
window.checkAuth = checkAuth;
window.togglePassword = togglePassword;
window.checkPasswordStrength = checkPasswordStrength;
window.checkPasswordMatch = checkPasswordMatch;
window.checkProfilePasswordStrength = checkProfilePasswordStrength;
window.loginWithGoogle = loginWithGoogle;
window.loginWithFacebook = loginWithFacebook;

// Handle OAuth callback on page load
document.addEventListener('DOMContentLoaded', () => {
    handleOAuthCallback();
});
