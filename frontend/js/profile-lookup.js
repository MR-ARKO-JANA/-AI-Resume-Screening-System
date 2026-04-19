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
    const linkedinText = document.getElementById('linkedinText').value.trim();

    // Validate at least one URL
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

        // Analyze LinkedIn text with AI
        if (linkedinText && linkedinText.length >= 50) {
            promises.push(analyzeLinkedIn(linkedinText));
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

        // Show LinkedIn link if URL provided but no text analysis
        if (linkedinUrl && !linkedinData) {
            showLinkedInLink(linkedinUrl);
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

async function analyzeLinkedIn(text) {
    const res = await fetch('/api/profile/linkedin-analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkedinText: text })
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
        <a class="project-item" href="${p.url}" target="_blank">
            <div class="project-top">
                <span class="project-name"><i class="fas fa-folder-open"></i> ${escapeHtml(p.name)}</span>
                <span class="project-rank">#${i + 1}</span>
            </div>
            <p class="project-desc">${escapeHtml(p.description)}</p>
            <div class="project-meta">
                <span><i class="fas fa-star"></i> ${p.stars}</span>
                <span><i class="fas fa-code-branch"></i> ${p.forks}</span>
                <span class="lang-tag">${escapeHtml(p.language)}</span>
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
            <div class="lang-item">
                <span class="lang-dot" style="background: ${color};"></span>
                <span class="lang-name">${escapeHtml(l.name)}</span>
                <span class="lang-count">${l.count} repos</span>
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
            <div class="timeline-item">
                <div class="timeline-icon ${iconClass}">
                    <i class="fas fa-${icon}"></i>
                </div>
                <div class="timeline-content">
                    <p>${escapeHtml(e.message)}</p>
                    <span class="time">${timeAgo}</span>
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
            <div class="experience-item">
                <h4>${escapeHtml(exp.title)}</h4>
                <p class="company">${escapeHtml(exp.company)}</p>
                <p class="duration"><i class="fas fa-calendar-alt"></i> ${escapeHtml(exp.duration || 'N/A')}</p>
                ${exp.description ? `<p class="exp-desc">${escapeHtml(exp.description)}</p>` : ''}
            </div>
        `).join('');
    } else {
        expList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No work experience data</p>';
    }

    // Certifications
    const certGrid = document.getElementById('certGrid');
    if (data.certifications && data.certifications.length) {
        certGrid.innerHTML = data.certifications.map(cert => `
            <div class="cert-item">
                <div class="cert-icon"><i class="fas fa-award"></i></div>
                <h4>${escapeHtml(cert.name)}</h4>
                <p class="issuer">${escapeHtml(cert.issuer || '')}</p>
                <p class="cert-date">${escapeHtml(cert.date || '')}</p>
            </div>
        `).join('');
    } else {
        certGrid.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px; grid-column: 1/-1;">No certifications found</p>';
    }

    // Education
    const eduList = document.getElementById('educationList');
    if (data.education && data.education.length) {
        eduList.innerHTML = data.education.map(edu => `
            <div class="education-item">
                <div class="edu-icon"><i class="fas fa-graduation-cap"></i></div>
                <div>
                    <h4>${escapeHtml(edu.degree)}</h4>
                    <p class="school">${escapeHtml(edu.school)}</p>
                    <p class="edu-year">${escapeHtml(edu.year || '')}</p>
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
            <div class="highlight-item">
                <div class="check-icon"><i class="fas fa-check"></i></div>
                <p>${escapeHtml(h)}</p>
            </div>
        `).join('');
    } else {
        highlightsList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 20px;">No highlights extracted</p>';
    }

    // Skills
    const skillsCloud = document.getElementById('skillsCloud');
    if (data.skills && data.skills.length) {
        skillsCloud.innerHTML = data.skills.map(s => `<span class="skill-tag">${escapeHtml(s)}</span>`).join('');
    } else {
        skillsCloud.innerHTML = '<p style="color: #94a3b8;">No skills data</p>';
    }

    container.classList.add('active');
}

// ============================================================
// LinkedIn Link Card
// ============================================================
function showLinkedInLink(url) {
    const card = document.getElementById('linkedinLinkCard');
    const link = document.getElementById('linkedinDirectLink');
    link.href = url;
    card.style.display = 'block';
}

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
function showLoading() { document.getElementById('loadingState').classList.add('active'); }
function hideLoading() { document.getElementById('loadingState').classList.remove('active'); }
function showResults() { document.getElementById('profileResults').classList.add('active'); }
function hideResults() {
    document.getElementById('profileResults').classList.remove('active');
    document.getElementById('linkedinResults').classList.remove('active');
    document.getElementById('linkedinLinkCard').style.display = 'none';
}
function showError(msg) {
    const el = document.getElementById('errorMessage');
    document.getElementById('errorText').textContent = msg;
    el.classList.add('active');
}
function hideError() { document.getElementById('errorMessage').classList.remove('active'); }
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
