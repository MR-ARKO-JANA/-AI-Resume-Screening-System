// Dashboard JavaScript - Optimized for Performance

// Cache DOM elements to avoid repeated queries
let statCards = null;
let activityList = null;
let uploadArea = null;
let fileInput = null;
let uploadForm = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    // Cache DOM elements once
    cacheElements();

    // Load data
    loadDashboardStats();
    loadRecentActivity();
});

function cacheElements() {
    statCards = document.querySelectorAll('.stat-card');
    activityList = document.querySelector('.activity-list');
    uploadArea = document.querySelector('.upload-area');
    fileInput = document.getElementById('resumeFile');
    uploadForm = document.getElementById('uploadForm');

    // Setup event listeners
    setupEventListeners();
}

function setupEventListeners() {
    // File upload handling
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', (e) => {
            if (e.target.classList.contains('btn-browse') || e.target.closest('.btn-browse')) {
                fileInput.click();
            }
        });

        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('drag-over');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                fileInput.files = files;
                uploadArea.classList.add('file-selected');
                updateUploadAreaText(files[0].name);
            }
        });

        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                uploadArea.classList.add('file-selected');
                updateUploadAreaText(e.target.files[0].name);
            }
        });
    }

    // Form submission - Show loader
    if (uploadForm) {
        uploadForm.addEventListener('submit', function (e) {
            // Show loader
            const loader = document.getElementById('loader');
            if (loader) {
                loader.classList.add('active');
            }

            // Validate form
            const jobDesc = document.getElementById('jobDesc');
            if (jobDesc && jobDesc.value.trim() === '') {
                e.preventDefault();
                alert('Please enter a job description');
                if (loader) loader.classList.remove('active');
                return false;
            }

            if (!fileInput.files || fileInput.files.length === 0) {
                e.preventDefault();
                alert('Please select a resume file');
                if (loader) loader.classList.remove('active');
                return false;
            }

            // Form will submit normally to /resumedata
        });
    }

    // View History button
    const viewHistoryBtn = document.querySelector('.btn-secondary');
    if (viewHistoryBtn && viewHistoryBtn.textContent.includes('History')) {
        viewHistoryBtn.onclick = () => window.location.href = '/candidates';
    }

    // Settings navigation
    const logoutBtn = document.querySelector('.btn-logout') || document.querySelector('.fa-sign-out-alt')?.parentElement;
    if (logoutBtn) {
        logoutBtn.onclick = () => window.location.href = '/logout';
    }
}

async function loadDashboardStats() {
    try {
        const response = await fetch('/dashboard-stats');
        const data = await response.json();

        if (data.error) {
            console.error('Error loading stats:', data.error);
            return;
        }

        // Update all stats efficiently
        updateStatCard(0, data.totalResumes, data.trends.total, false);
        updateStatCard(1, data.shortlisted, data.trends.shortlisted, false);
        updateStatCard(2, data.pending, data.trends.pending, false);
        updateStatCard(3, data.avgMatchScore, null, true);

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

function updateStatCard(index, value, trend, isPercentage) {
    if (!statCards || !statCards[index]) return;

    const card = statCards[index];
    const valueElement = card.querySelector('.stat-value');
    const trendElement = card.querySelector('.stat-change');

    if (valueElement) {
        // Use faster direct update for small numbers
        if (value < 100) {
            animateValueFast(valueElement, value, isPercentage);
        } else {
            animateValue(valueElement, value, isPercentage);
        }
    }

    if (trendElement) {
        updateTrend(trendElement, trend, isPercentage);
    }
}

function animateValueFast(element, endValue, isPercentage) {
    // Faster animation for small numbers
    let current = 0;
    const duration = 800;
    const steps = 20;
    const increment = endValue / steps;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= endValue) {
            current = endValue;
            clearInterval(timer);
        }
        element.textContent = Math.round(current).toLocaleString() + (isPercentage ? '%' : '');
    }, stepTime);
}

function animateValue(element, endValue, isPercentage) {
    // Optimized animation using requestAnimationFrame
    const startTime = performance.now();
    const duration = 1000;

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(endValue * easeProgress);

        element.textContent = current.toLocaleString() + (isPercentage ? '%' : '');

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function updateTrend(element, trend, isAvgScore) {
    if (isAvgScore) {
        // For average score, show quality indicator
        const value = parseInt(element.previousElementSibling.textContent);
        let quality = 'Good';
        let qualityClass = 'positive';

        if (value >= 80) {
            quality = 'Excellent';
        } else if (value >= 60) {
            quality = 'Good';
        } else if (value >= 40) {
            quality = 'Fair';
            qualityClass = 'neutral';
        } else {
            quality = 'Needs Improvement';
            qualityClass = 'negative';
        }

        element.innerHTML = `<i class="fas fa-chart-line"></i> ${quality}`;
        element.className = `stat-change ${qualityClass}`;
    } else if (trend !== null && trend !== undefined) {
        const isPositive = trend >= 0;
        const icon = isPositive ? 'up' : 'down';
        const trendClass = isPositive ? 'positive' : 'negative';

        element.innerHTML = `<i class="fas fa-arrow-${icon}"></i> ${Math.abs(trend)}% from last month`;
        element.className = `stat-change ${trendClass}`;
    }
}

function updateUploadAreaText(fileName) {
    const uploadIcon = uploadArea.querySelector('.upload-icon');
    const uploadText = uploadArea.querySelector('h3');
    const uploadSubtext = uploadArea.querySelector('p');

    // Check if plural
    const files = fileInput.files;
    const count = files.length;

    if (uploadIcon) uploadIcon.innerHTML = '<i class="fas fa-check-circle"></i>';
    if (uploadText) uploadText.textContent = count > 1 ? `${count} Files Selected` : 'File Selected';
    if (uploadSubtext) uploadSubtext.textContent = count > 1 ? Array.from(files).map(f => f.name).join(', ') : fileName;
}

// Load recent activity - optimized
async function loadRecentActivity() {
    if (!activityList) return;

    try {
        const response = await fetch('/getallcandidates');
        const candidates = await response.json();

        if (candidates.error || !Array.isArray(candidates)) {
            console.error('Error loading activity:', candidates.error);
            return;
        }

        // Use DocumentFragment for better performance
        const fragment = document.createDocumentFragment();

        // Show last 5 activities only
        const recentCandidates = candidates.slice(0, 5);

        recentCandidates.forEach(candidate => {
            const item = createActivityItem(candidate);
            fragment.appendChild(item);
        });

        // Single DOM update
        activityList.innerHTML = '';
        activityList.appendChild(fragment);

    } catch (error) {
        console.error('Error loading recent activity:', error);
    }
}

function createActivityItem(candidate) {
    const item = document.createElement('div');
    item.className = 'activity-item';

    // Determine icon and color based on status
    let iconClass, iconColor, statusText;

    switch (candidate.status) {
        case 'Shortlisted':
            iconClass = 'fa-check-circle';
            iconColor = 'success';
            statusText = 'Candidate shortlisted';
            break;
        case 'Rejected':
            iconClass = 'fa-times-circle';
            iconColor = 'danger';
            statusText = 'Candidate rejected';
            break;
        case 'Pending':
            iconClass = 'fa-clock';
            iconColor = 'warning';
            statusText = 'Pending review';
            break;
        default:
            iconClass = 'fa-file-alt';
            iconColor = 'success';
            statusText = 'Resume screened';
    }

    // Format date efficiently
    const timeAgo = getTimeAgo(new Date(candidate.uploadDate));

    // Use template literal for better performance
    item.innerHTML = `
        <div class="activity-icon ${iconColor}">
            <i class="fas ${iconClass}"></i>
        </div>
        <div class="activity-content">
            <h4>${statusText}</h4>
            <p>${candidate.fileName} - Match: ${candidate.matchScore}%</p>
            <span class="activity-time">${timeAgo}</span>
        </div>
    `;

    return item;
}

function getTimeAgo(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return Math.floor(seconds / 60) + ' minutes ago';
    if (seconds < 86400) return Math.floor(seconds / 3600) + ' hours ago';
    if (seconds < 2592000) return Math.floor(seconds / 86400) + ' days ago';
    if (seconds < 31536000) return Math.floor(seconds / 2592000) + ' months ago';
    return Math.floor(seconds / 31536000) + ' years ago';
}
