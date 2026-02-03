// D.N Express Logistics - Build Plan Dashboard
// Private project management interface

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    // Update timestamps
    const now = new Date();
    document.getElementById('lastUpdate').textContent = now.toLocaleString();
    document.getElementById('footerUpdate').textContent = now.toLocaleString();

    // Add interactivity to checklist
    const checklistItems = document.querySelectorAll('.checklist-item input');
    checklistItems.forEach((item, index) => {
        // Load state from localStorage
        const savedState = localStorage.getItem(`checklist_${index}`);
        if (savedState === 'true') {
            item.checked = true;
        }

        // Save state on change
        item.addEventListener('change', function() {
            localStorage.setItem(`checklist_${index}`, this.checked);
            updateProgress();
        });
    });

    // Enable checkboxes for demo
    checklistItems.forEach(item => {
        item.disabled = false;
        item.style.cursor = 'pointer';
    });

    updateProgress();
}

function updateProgress() {
    const checklistItems = document.querySelectorAll('.checklist-item input');
    const completed = Array.from(checklistItems).filter(item => item.checked).length;
    const total = checklistItems.length;
    const percentage = Math.round((completed / total) * 100);

    console.log(`Build Plan Progress: ${completed}/${total} (${percentage}%)`);
}

// Export dashboard data
function exportDashboard() {
    const dashboardData = {
        projectName: 'D.N Express Logistics Web Platform',
        status: 'In Development',
        exportDate: new Date().toISOString(),
        phase: 2,
        progress: {
            completed: document.querySelectorAll('.checklist-item input:checked').length,
            total: document.querySelectorAll('.checklist-item input').length
        },
        contact: {
            phone1: '1876-333-2649',
            phone2: '1876-435-1438',
            email: 'dnexpresslogisticsja@gmail.com'
        }
    };

    console.log('Dashboard Data:', dashboardData);
    return dashboardData;
}

// Print dashboard
function printDashboard() {
    window.print();
}
