// Authentication System
class UserAuth {
    constructor() {
        this.users = this.loadUsers();
        this.currentUser = this.loadCurrentUser();
    }

    loadUsers() {
        const stored = localStorage.getItem('dnexpress_users');
        return stored ? JSON.parse(stored) : [];
    }

    saveUsers() {
        localStorage.setItem('dnexpress_users', JSON.stringify(this.users));
    }

    loadCurrentUser() {
        const stored = localStorage.getItem('dnexpress_currentUser');
        return stored ? JSON.parse(stored) : null;
    }

    saveCurrentUser(user) {
        localStorage.setItem('dnexpress_currentUser', JSON.stringify(user));
        this.currentUser = user;
    }

    isLoggedIn() {
        return this.currentUser !== null;
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    validatePassword(password) {
        // At least 8 chars, 1 uppercase, 1 lowercase, 1 number
        return password.length >= 8 &&
               /[A-Z]/.test(password) &&
               /[a-z]/.test(password) &&
               /[0-9]/.test(password);
    }

    signup(firstName, lastName, email, phone, password) {
        // Validate inputs
        if (!firstName || !lastName) return { success: false, message: 'Please enter your name' };
        if (!this.validateEmail(email)) return { success: false, message: 'Invalid email format' };
        if (!this.validatePassword(password)) {
            return { success: false, message: 'Password must have 8+ chars, uppercase, lowercase, and numbers' };
        }
        if (this.users.find(u => u.email === email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create user
        const user = {
            id: Date.now(),
            firstName,
            lastName,
            email,
            phone,
            password: this.hashPassword(password),
            createdAt: new Date().toISOString(),
            shipments: [],
            savedAddresses: []
        };

        this.users.push(user);
        this.saveUsers();

        // Auto-login after signup
        this.saveCurrentUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        });

        return { success: true, message: 'Account created successfully!' };
    }

    login(email, password) {
        if (!this.validateEmail(email)) {
            return { success: false, message: 'Invalid email format' };
        }

        const user = this.users.find(u => u.email === email);
        if (!user) return { success: false, message: 'User not found' };

        if (this.hashPassword(password) !== user.password) {
            return { success: false, message: 'Invalid password' };
        }

        this.saveCurrentUser({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone
        });

        return { success: true, message: 'Login successful!' };
    }

    logout() {
        localStorage.removeItem('dnexpress_currentUser');
        this.currentUser = null;
    }

    hashPassword(password) {
        // Simple hash for demo (use bcrypt in production)
        return btoa(password);
    }

    getProfile() {
        return this.currentUser;
    }

    updateProfile(data) {
        if (!this.currentUser) return { success: false, message: 'Not logged in' };

        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex === -1) return { success: false, message: 'User not found' };

        // Update user
        Object.assign(this.users[userIndex], data);
        this.saveUsers();

        // Update current user
        Object.assign(this.currentUser, data);
        this.saveCurrentUser(this.currentUser);

        return { success: true, message: 'Profile updated!' };
    }
}

// Initialize auth
const auth = new UserAuth();

// Toggle between login and signup
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

// Handle login
function handleLogin(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = auth.login(email, password);

    if (result.success) {
        showSuccess('Login successful! Redirecting to dashboard...');
        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 2000);
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
