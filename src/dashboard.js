// Dashboard Management System
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
    initializeDashboard();
});

function checkAuth() {
    if (!auth.isLoggedIn()) {
        window.location.href = 'auth.html';
        return;
    }
}

function initializeDashboard() {
    const user = auth.getProfile();
    
    // Update user info
    document.getElementById('userName').textContent = user.firstName + ' ' + user.lastName;
    document.getElementById('userNameSidebar').textContent = user.firstName + ' ' + user.lastName;
    document.getElementById('userEmailSidebar').textContent = user.email;
    document.getElementById('dashboardName').textContent = user.firstName;
    
    // Load profile form
    document.getElementById('profileFirstName').value = user.firstName;
    document.getElementById('profileLastName').value = user.lastName;
    document.getElementById('profileEmail').value = user.email;
    document.getElementById('profilePhone').value = user.phone;

    // Load dashboard data
    loadDashboardStats();
    loadRecentShipments();
    
    // Setup navigation
    setupNavigation();
}

function setupNavigation() {
    // Sidebar menu items
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            sidebarItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });

    // Top nav items
    const navItems = document.querySelectorAll('[data-section]');
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show selected section
    const selectedSection = document.getElementById(sectionName + '-section');
    if (selectedSection) {
        selectedSection.classList.add('active');
    }

    // Update nav active state
    const navItems = document.querySelectorAll('[data-section]');
    navItems.forEach(item => item.classList.remove('active'));
    const activeNav = document.querySelector(`[data-section="${sectionName}"]`);
    if (activeNav) activeNav.classList.add('active');

    // Update sidebar active state
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    sidebarItems.forEach(item => item.classList.remove('active'));
    const activeSidebar = Array.from(sidebarItems).find(item => 
        item.textContent.toLowerCase().includes(sectionName.replace(/-/g, ' '))
    );
    if (activeSidebar) activeSidebar.classList.add('active');
}

function loadDashboardStats() {
    // Demo data
    document.getElementById('totalShipments').textContent = '0';
    document.getElementById('deliveredShipments').textContent = '0';
    document.getElementById('inTransitShipments').textContent = '0';
    document.getElementById('totalSpent').textContent = '$0.00';
}

function loadRecentShipments() {
    const recentList = document.getElementById('recentList');
    // Demo - no shipments yet
    recentList.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">No shipments yet. Create your first one!</p>';
}

function showCreateShipment() {
    switchSection('shipments');
}

function handleQuoteSubmit(event) {
    event.preventDefault();
    
    const weight = event.target.querySelector('input[type="number"]').value;
    const service = event.target.querySelector('select:nth-of-type(2)').value;

    // Calculate quote
    const baseRate = 25;
    const weightCharge = weight * 0.50;
    const total = baseRate + weightCharge;

    // Display result
    document.getElementById('baseRate').textContent = '$' + baseRate.toFixed(2);
    document.getElementById('weightCharge').textContent = '$' + weightCharge.toFixed(2);
    document.getElementById('totalQuote').textContent = '$' + total.toFixed(2);
    document.getElementById('quoteResult').style.display = 'block';

    // Scroll to result
    document.getElementById('quoteResult').scrollIntoView({ behavior: 'smooth' });
}

function proceedToShipment() {
    switchSection('shipments');
}

function handleTrackingSubmit(event) {
    event.preventDefault();

    const trackingNumber = document.getElementById('trackingInput').value;

    // Demo tracking data
    const statuses = ['Processing', 'In Transit', 'Customs Clearance', 'Out for Delivery'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    const date = new Date();
    date.setDate(date.getDate() + Math.floor(Math.random() * 5) + 3);

    document.getElementById('trackingStatus').textContent = randomStatus;
    document.getElementById('trackingNum').textContent = trackingNumber;
    document.getElementById('trackingOrigin').textContent = 'United States';
    document.getElementById('trackingDest').textContent = 'Jamaica';
    document.getElementById('trackingETA').textContent = date.toLocaleDateString();
    
    const statusBadge = document.getElementById('statusBadge');
    statusBadge.className = 'status-badge ' + randomStatus.toLowerCase().replace(' ', '-');
    statusBadge.textContent = randomStatus;

    document.getElementById('trackingResult').style.display = 'block';
    document.getElementById('trackingResult').scrollIntoView({ behavior: 'smooth' });
}

function handleProfileUpdate(event) {
    event.preventDefault();

    const firstName = document.getElementById('profileFirstName').value;
    const lastName = document.getElementById('profileLastName').value;
    const phone = document.getElementById('profilePhone').value;

    const result = auth.updateProfile({
        firstName,
        lastName,
        phone
    });

    if (result.success) {
        alert('Profile updated successfully!');
        // Update display
        document.getElementById('userNameSidebar').textContent = firstName + ' ' + lastName;
        document.getElementById('dashboardName').textContent = firstName;
    }
}

function handleSupportSubmit(event) {
    event.preventDefault();
    alert('Thank you for your message! We will get back to you soon.');
    event.target.reset();
}

function handleLogout() {
    if (confirm('Are you sure you want to logout?')) {
        auth.logout();
        window.location.href = 'index.html';
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { switchSection };
}
