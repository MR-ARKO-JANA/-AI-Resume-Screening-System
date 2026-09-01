// ============================================================
// Profile Lookup — GitHub & LinkedIn Analysis
// ============================================================

let commitChartInstance = null;

// Language color map for visual styling
const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
    Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', HTML: '#e34c26',
    CSS: '#563d7c', Shell: '#89e051', Lua: '#000080', R: '#198CE7',
    Scala: '#c22d40', Vue: '#41b883', Svelte: '#ff3e00', Jupyter: '#DA5B0B'
};

// ============================================================
// Main: Check Profile
// ============================================================
async function checkProfile() {
    const githubUrl = document.getElementById('githubUrl').value.trim();
    const linkedinUrl = document.getElementById('linkedinUrl').value.trim();

    // Validate at least one input
    if (!githubUrl && !linkedinUrl) {
        showError('Please enter at least a GitHub or LinkedIn URL');
        return;
    }

    // Extract GitHub username
    let githubUsername = null;
    if (githubUrl) {
        githubUsername = extractGitHubUsername(githubUrl);
        if (!githubUsername) {
            showError('Invalid GitHub URL. Use format: https://github.com/username');
            return;
        }
    }

    // Hide previous results & show loading
    hideError();
    hideResults();
    showLoading();
    disableButton();

    try {
        const promises = [];

        // Fetch GitHub data
        if (githubUsername) {
            promises.push(fetchGitHubProfile(githubUsername));
        } else {
            promises.push(Promise.resolve(null));
        }

        // Analyze LinkedIn URL with AI
        if (linkedinUrl) {
            promises.push(analyzeLinkedIn(linkedinUrl));
        } else {
            promises.push(Promise.resolve(null));
        }

        const [githubData, linkedinData] = await Promise.all(promises);

        hideLoading();

        if (githubData) {
            renderGitHubResults(githubData);
        }

        if (linkedinData) {
            renderLinkedInResults(linkedinData);
        }

        showResults();

    } catch (error) {
        hideLoading();
        showError(error.message || 'Failed to fetch profile data');
    } finally {
        enableButton();
    }
}

// ============================================================
// API Calls
// ============================================================
async function fetchGitHubProfile(username) {
    const res = await fetch('/api/profile/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
}

async function analyzeLinkedIn(url) {
    const res = await fetch('/api/profile/linkedin-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinUrl: url })
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data.linkedinData;
}

// ============================================================
// Render GitHub Results
// ============================================================
function renderGitHubResults(data) {
    const { profile, totalStars, topProjects, languages, commitActivity, recentActivity } = data;

    // Profile card
    document.getElementById('profileAvatar').src = profile.avatar;
    document.getElementById('profileName').textContent = profile.name;
    document.getElementById('profileUsername').textContent = `@${profile.login}`;
    document.getElementById('profileBio').textContent = profile.bio || 'No bio available';
    document.getElementById('profileLink').href = profile.profileUrl;

    // Meta
    setMetaField('profileLocation', profile.location);
    setMetaField('profileCompany', profile.company);
    const joinDate = new Date(profile.createdAt);
    document.getElementById('profileJoined').querySelector('span').textContent = `Joined ${joinDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;

    // Stats with counter animation
    animateCounter('statRepos', profile.publicRepos);
    animateCounter('statStars', totalStars);
    animateCounter('statFollowers', profile.followers);
    animateCounter('statFollowing', profile.following);

    // Top Projects
    renderProjects(topProjects);

    // Commit Activity Chart
    renderCommitChart(commitActivity);

    // Languages
    renderLanguages(languages);

    // Recent Activity
    renderActivity(recentActivity);
}

function setMetaField(id, value) {
    const el = document.getElementById(id);
    if (value) {
        el.querySelector('span').textContent = value;
        el.style.display = 'flex';
    } else {
        el.style.display = 'none';
    }
}

// Animated counter from 0 to target
function animateCounter(id, target) {
    const el = document.getElementById(id);
    const duration = 1200;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out quad
        const ease = 1 - (1 - progress) * (1 - progress);
        const current = Math.floor(ease * target);
        el.textContent = current.toLocaleString();
        if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
}

// ============================================================
// Top Projects
// ============================================================
function renderProjects(projects) {
    const container = document.getElementById('projectList');
    if (!projects.length) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No projects found</p>';
        return;
    }

    container.innerHTML = projects.map((p, i) => `
        <a class="flex flex-col gap-2 p-3 bg-surface hover:bg-surface-variant transition-colors rounded-lg border border-border-subtle" href="${p.url}" target="_blank">
            <div class="flex items-center justify-between">
                <span class="font-bold text-primary flex items-center gap-2"><i class="fas fa-folder-open text-[#2563EB]"></i> ${escapeHtml(p.name)}</span>
                <span class="text-xs font-bold px-2 py-1 bg-blue-100 text-[#2563EB] rounded">#${i + 1}</span>
            </div>
            <p class="text-sm text-on-surface-variant line-clamp-2">${escapeHtml(p.description)}</p>
            <div class="flex items-center gap-4 text-xs font-semibold text-slate-gray mt-1">
                <span class="flex items-center gap-1"><i class="fas fa-star text-amber-500"></i> ${p.stars}</span>
                <span class="flex items-center gap-1"><i class="fas fa-code-branch"></i> ${p.forks}</span>
                <span class="px-2 py-0.5 bg-surface-container-high rounded-full">${escapeHtml(p.language)}</span>
            </div>
        </a>
    `).join('');
}

// ============================================================
// Commit Activity Chart
// ============================================================
function renderCommitChart(commitActivity) {
    const ctx = document.getElementById('commitChart').getContext('2d');

    // Destroy old chart
    if (commitChartInstance) {
        commitChartInstance.destroy();
    }

    const labels = Object.keys(commitActivity).map(key => {
        const [y, m] = key.split('-');
        const date = new Date(y, m - 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    });
    const values = Object.values(commitActivity);

    commitChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels,
            datasets: [{
                label: 'Commits',
                data: values,
                backgroundColor: (ctx) => {
                    const chart = ctx.chart;
                    const { ctx: context, chartArea } = chart;
                    if (!chartArea) return '#6366f1';
                    const gradient = context.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
                    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.3)');
                    gradient.addColorStop(1, 'rgba(139, 92, 246, 0.9)');
                    return gradient;
                },
                borderRadius: 8,
                borderSkipped: false,
                barPercentage: 0.6,
                categoryPercentage: 0.8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#1e293b',
                    titleColor: '#fff',
                    bodyColor: '#e2e8f0',
                    borderColor: '#334155',
                    borderWidth: 1,
                    cornerRadius: 10,
                    padding: 12,
                    callbacks: {
                        label: (ctx) => `${ctx.parsed.y} commits`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 11 },
                        stepSize: Math.max(1, Math.ceil(Math.max(...values) / 5))
                    },
                    grid: {
                        color: 'rgba(226, 232, 240, 0.5)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: '#94a3b8',
                        font: { family: 'Inter', size: 11 },
                        maxRotation: 45
                    },
                    grid: { display: false }
                }
            },
            animation: {
                duration: 1200,
                easing: 'easeOutQuart'
            }
        }
    });
}

// ============================================================
// Languages
// ============================================================
function renderLanguages(languages) {
    const container = document.getElementById('langGrid');
    if (!languages.length) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px; grid-column: 1/-1;">No language data</p>';
        return;
    }

    container.innerHTML = languages.map(l => {
        const color = LANG_COLORS[l.name] || '#64748b';
        return `
            <div class="flex items-center justify-between p-2 bg-surface rounded-lg border border-border-subtle w-full max-w-[48%] flex-grow sm:flex-grow-0 sm:w-auto sm:min-w-[140px]">
                <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full" style="background: ${color};"></span>
                    <span class="font-bold text-sm text-primary">${escapeHtml(l.name)}</span>
                </div>
                <span class="text-xs text-on-surface-variant font-semibold">${l.count} repos</span>
            </div>
        `;
    }).join('');
}

// ============================================================
// Recent Activity
// ============================================================
function renderActivity(events) {
    const container = document.getElementById('activityTimeline');
    if (!events.length) {
        container.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No recent activity</p>';
        return;
    }

    container.innerHTML = events.map(e => {
        const iconClass = getEventIconClass(e.type);
        const icon = getEventIcon(e.type);
        const timeAgo = getTimeAgo(new Date(e.date));

        return `
            <div class="flex gap-4 relative z-10">
                <div class="w-8 h-8 rounded-full bg-surface-variant border-2 border-surface-container-lowest flex items-center justify-center text-slate-gray shrink-0 mt-0.5 shadow-sm">
                    <i class="fas fa-${icon} text-sm"></i>
                </div>
                <div class="flex-1 pb-4">
                    <p class="text-sm font-semibold text-primary mb-1">${escapeHtml(e.message)}</p>
                    <span class="text-xs text-on-surface-variant">${timeAgo}</span>
                </div>
            </div>
        `;
    }).join('');
}

function getEventIconClass(type) {
    const map = {
        PushEvent: 'push', CreateEvent: 'create', PullRequestEvent: 'pr',
        IssuesEvent: 'issue', WatchEvent: 'star', ForkEvent: 'fork',
        IssueCommentEvent: 'issue'
    };
    return map[type] || 'other';
}

function getEventIcon(type) {
    const map = {
        PushEvent: 'code-commit', CreateEvent: 'plus', PullRequestEvent: 'code-pull-request',
        IssuesEvent: 'circle-exclamation', WatchEvent: 'star', ForkEvent: 'code-branch',
        IssueCommentEvent: 'comment', DeleteEvent: 'trash'
    };
    return map[type] || 'circle';
}

// ============================================================
// Render LinkedIn Results
// ============================================================
function renderLinkedInResults(data) {
    const container = document.getElementById('linkedinResults');

    // Header
    document.getElementById('linkedinName').textContent = data.fullName || 'LinkedIn Insights';
    document.getElementById('linkedinHeadline').textContent = data.headline || '';
    document.getElementById('linkedinRole').textContent = [data.currentRole, data.location].filter(Boolean).join(' • ');

    // Work Experience
    const expList = document.getElementById('experienceList');
    if (data.workExperience && data.workExperience.length) {
        expList.innerHTML = data.workExperience.map(exp => `
            <div class="flex flex-col gap-1 relative pl-6 border-l-2 border-[#2563EB]/30 pb-4 last:border-transparent last:pb-0">
                <div class="absolute left-[-5px] top-1.5 w-2 h-2 rounded-full bg-[#2563EB]"></div>
                <h4 class="font-bold text-primary">${escapeHtml(exp.title)}</h4>
                <p class="text-sm font-semibold text-[#2563EB]">${escapeHtml(exp.company)}</p>
                <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5"><i class="fas fa-calendar-alt opacity-70"></i> ${escapeHtml(exp.duration || 'N/A')}</p>
                ${exp.description ? `<p class="text-sm text-on-surface-variant mt-2 leading-relaxed">${escapeHtml(exp.description)}</p>` : ''}
            </div>
        `).join('');
    } else {
        expList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No work experience data</p>';
    }

    // Certifications
    const certGrid = document.getElementById('certGrid');
    if (data.certifications && data.certifications.length) {
        certGrid.innerHTML = data.certifications.map(cert => `
            <div class="flex items-start gap-3 p-3 bg-surface border border-border-subtle rounded-lg">
                <div class="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                    <i class="fas fa-award"></i>
                </div>
                <div>
                    <h4 class="font-bold text-sm text-primary leading-tight mb-1">${escapeHtml(cert.name)}</h4>
                    <p class="text-xs font-semibold text-slate-gray">${escapeHtml(cert.issuer || '')}</p>
                    <p class="text-[10px] text-on-surface-variant mt-1">${escapeHtml(cert.date || '')}</p>
                </div>
            </div>
        `).join('');
    } else {
        certGrid.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px; grid-column: 1/-1;">No certifications found</p>';
    }

    // Education
    const eduList = document.getElementById('educationList');
    if (data.education && data.education.length) {
        eduList.innerHTML = data.education.map(edu => `
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded bg-[#2563EB]/10 text-[#2563EB] flex items-center justify-center text-lg shrink-0">
                    <i class="fas fa-graduation-cap"></i>
                </div>
                <div class="flex-1">
                    <h4 class="font-bold text-primary">${escapeHtml(edu.degree)}</h4>
                    <p class="text-sm font-semibold text-slate-gray mt-0.5">${escapeHtml(edu.school)}</p>
                    <p class="text-xs text-on-surface-variant mt-1">${escapeHtml(edu.year || '')}</p>
                </div>
            </div>
        `).join('');
    } else {
        eduList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No education data</p>';
    }

    // Key Highlights
    const highlightsList = document.getElementById('highlightsList');
    if (data.keyHighlights && data.keyHighlights.length) {
        highlightsList.innerHTML = data.keyHighlights.map(h => `
            <div class="flex items-start gap-3 p-3 bg-amber-50/50 border border-amber-100 rounded-lg">
                <div class="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 text-xs">
                    <i class="fas fa-check"></i>
                </div>
                <p class="text-sm font-medium text-amber-900">${escapeHtml(h)}</p>
            </div>
        `).join('');
    } else {
        highlightsList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No highlights extracted</p>';
    }

    // Skills
    const skillsCloud = document.getElementById('skillsCloud');
    if (data.skills && data.skills.length) {
        skillsCloud.innerHTML = data.skills.map(s => `<span class="px-3 py-1 bg-surface-variant text-on-surface-variant text-xs font-bold rounded-full">${escapeHtml(s)}</span>`).join('');
    } else {
        skillsCloud.innerHTML = '<p style="color: #94a3b8;">No skills data</p>';
    }

    container.classList.remove('hidden');
    container.classList.add('flex');
}

// Removed LinkedIn Link Card logic

// ============================================================
// Utility Functions
// ============================================================
function extractGitHubUsername(url) {
    // Handle both formats: https://github.com/user and just "user"
    if (!url.includes('/') && !url.includes('.')) return url; // Plain username
    try {
        const parsed = new URL(url.startsWith('http') ? url : 'https://' + url);
        const parts = parsed.pathname.split('/').filter(Boolean);
        return parts[0] || null;
    } catch {
        return null;
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getTimeAgo(date) {
    const seconds = Math.floor((new Date() - date) / 1000);
    const intervals = [
        { label: 'year', seconds: 31536000 },
        { label: 'month', seconds: 2592000 },
        { label: 'week', seconds: 604800 },
        { label: 'day', seconds: 86400 },
        { label: 'hour', seconds: 3600 },
        { label: 'minute', seconds: 60 }
    ];
    for (const interval of intervals) {
        const count = Math.floor(seconds / interval.seconds);
        if (count >= 1) return `${count} ${interval.label}${count > 1 ? 's' : ''} ago`;
    }
    return 'Just now';
}

// UI State Helpers
function showLoading() { 
    const loader = document.getElementById('loadingState');
    loader.classList.remove('hidden');
    loader.classList.add('flex');
}
function hideLoading() { 
    document.getElementById('loadingState').classList.add('hidden'); 
    document.getElementById('loadingState').classList.remove('flex');
}
function showResults() { 
    const results = document.getElementById('profileResults');
    results.classList.remove('hidden'); 
    results.classList.add('flex');
}
function hideResults() {
    document.getElementById('profileResults').classList.add('hidden');
    document.getElementById('profileResults').classList.remove('flex');
    document.getElementById('linkedinResults').classList.add('hidden');
    document.getElementById('linkedinResults').classList.remove('flex');
}
function showError(msg) {
    const el = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = msg;
    el.classList.remove('hidden');
    el.classList.add('flex');
}
function hideError() { 
    document.getElementById('errorMessage').classList.add('hidden'); 
    document.getElementById('errorMessage').classList.remove('flex');
}
function disableButton() {
    const btn = document.getElementById('checkBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Checking...';
}
function enableButton() {
    const btn = document.getElementById('checkBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Check Candidate Profile <span class="btn-shine"></span>';
}

// Allow pressing Enter to check
document.addEventListener('DOMContentLoaded', () => {
    ['githubUrl', 'linkedinUrl'].forEach(id => {
        document.getElementById(id).addEventListener('keypress', (e) => {
            if (e.key === 'Enter') checkProfile();
        });
    });
});
