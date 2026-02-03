// ========================================
// PREMIUM D.N EXPRESS LOGISTICS
// Modern JavaScript with clean interactions
// ========================================

// Toggle mobile menu
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const hamburger = document.getElementById('hamburger');
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
}

// Close menu when link is clicked
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        document.getElementById('navMenu').classList.remove('active');
        document.getElementById('hamburger').classList.remove('active');
    });
});

// Calculate shipping rate
function calculateRate() {
    const destination = document.getElementById('destination').value;
    const weight = parseFloat(document.getElementById('weight').value);
    const service = document.getElementById('service').value;

    if (!destination || !weight) {
        alert('Please fill in all fields');
        return;
    }

    // Pricing model
    const baseRate = 25;
    const weightCharge = weight * 0.50;
    let total = baseRate + weightCharge;

    // Apply service multiplier
    if (service === 'air') {
        total *= 1.5; // Air freight premium
    }

    // Display result
    const rateResult = document.getElementById('rateResult');
    const rateDetails = document.getElementById('rateDetails');
    const rateAmount = document.getElementById('rateAmount');

    const serviceText = service === 'air' ? 'Air Freight (5-7 days)' : 'Sea Freight (14-21 days)';
    const destDisplay = destination || 'Not Selected';

    rateDetails.innerHTML = `
        <strong>${serviceText}</strong> to <strong>${destDisplay}</strong><br>
        <small>${weight} lbs</small>
    `;
    rateAmount.innerHTML = `$${total.toFixed(2)}`;
    rateResult.style.display = 'block';
    rateResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Track shipment
function trackShipment(event) {
    event.preventDefault();
    
    const trackingNumber = document.getElementById('trackingNumber').value;
    const trackingResult = document.getElementById('trackingResult');

    if (!trackingNumber) {
        trackingResult.innerHTML = '<p style="color: red;">Please enter a tracking number</p>';
        return;
    }

    // Simulate tracking data
    const statuses = ['Processing', 'In Transit', 'Customs Clearance', 'Ready for Delivery', 'Delivered'];
    const randomStatus = Math.floor(Math.random() * statuses.length);
    const currentStatus = statuses[randomStatus];

    const days = Math.floor(Math.random() * 14) + 1;
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + days);

    trackingResult.innerHTML = `
        <div class="tracking-status">
            <div class="status-badge">${currentStatus}</div>
            <div class="status-info">
                <h3>Tracking #${trackingNumber.toUpperCase()}</h3>
                <p>Estimated delivery: ${estimatedDate.toLocaleDateString()}</p>
            </div>
        </div>
        <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(14, 36, 76, 0.1);">
            <p><strong>Current Location:</strong> In Transit - Jamaica Customs</p>
            <p><strong>Last Update:</strong> ${new Date().toLocaleString()}</p>
        </div>
    `;
    trackingResult.style.display = 'block';
    trackingResult.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Handle contact form
function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const name = form.querySelector('input[type="text"]').value;
    const email = form.querySelector('input[type="email"]').value;
    const subject = form.querySelectorAll('input[type="text"]')[1].value;
    const message = form.querySelector('textarea').value;

    // Store in localStorage (for demo)
    const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
    messages.push({
        name,
        email,
        subject,
        message,
        date: new Date().toLocaleString()
    });
    localStorage.setItem('contactMessages', JSON.stringify(messages));

    // Show success
    alert('✅ Message sent! We\'ll get back to you soon!');
    form.reset();
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// Add scroll effects to navbar
window.addEventListener('scroll', () => {
    const navbar = document.querySelector('.navbar');
    if (window.scrollY > 50) {
        navbar.style.boxShadow = '0 4px 12px rgba(14, 36, 76, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 8px rgba(14, 36, 76, 0.04)';
    }
});

// Animate elements on scroll (Intersection Observer)
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe service cards, product cards, etc
document.querySelectorAll('.service-card, .product-card, .timeline-item').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Initialize on page load
window.addEventListener('load', () => {
    // Add any initialization logic here
    console.log('✅ D.N Express Premium Site Loaded');
});
