// ============================================================
// Candidates Page — Table + Detail Modal with GitHub & LinkedIn
// ============================================================

let allCandidates = [];
let currentCandidateId = null;

// Language color map
const LANG_COLORS = {
    JavaScript: '#f1e05a', TypeScript: '#3178c6', Python: '#3572A5',
    Java: '#b07219', 'C++': '#f34b7d', C: '#555555', 'C#': '#178600',
    Go: '#00ADD8', Rust: '#dea584', Ruby: '#701516', PHP: '#4F5D95',
    Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', HTML: '#e34c26',
    CSS: '#563d7c', Shell: '#89e051', Lua: '#000080', R: '#198CE7',
    Scala: '#c22d40', Vue: '#41b883', Svelte: '#ff3e00', Jupyter: '#DA5B0B'
};

// ============================================================
// Load Candidates
// ============================================================
async function loadCandidates() {
    try {
        const response = await fetch('/getallcandidates');

        const data = await response.json();

        if (data.error) {
            document.getElementById('candidatesBody').innerHTML =
                '<tr><td colspan="7" style="text-align: center; color: red;">Error: ' + data.error + '</td></tr>';
            return;
        }

        if (!Array.isArray(data)) {
            document.getElementById('candidatesBody').innerHTML =
                '<tr><td colspan="7" style="text-align: center; color: red;">Invalid data format</td></tr>';
            return;
        }

        allCandidates = data;
        displayCandidates(allCandidates);
    } catch (error) {
        console.error("Error loading candidates:", error);
        document.getElementById('candidatesBody').innerHTML =
            '<tr><td colspan="7" style="text-align: center; color: red;">Failed to load candidates: ' + error.message + '</td></tr>';
    }
}

function displayCandidates(candidates) {
    const tbody = document.getElementById('candidatesBody');

    if (candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">No candidates found. Upload a resume to get started!</td></tr>';
        return;
    }

    tbody.innerHTML = '';

    candidates.forEach((candidate, index) => {
        const row = document.createElement('tr');

        const scoreClass = candidate.matchScore >= 75 ? 'score-high' :
            candidate.matchScore >= 50 ? 'score-medium' : 'score-low';

        const statusClass = 'status-' + candidate.status;

        row.innerHTML = `
            <td><input type="checkbox" class="candidate-checkbox" data-id="${candidate.id}"></td>
            <td><strong>${index + 1}</strong></td>
            <td>${candidate.fileName}</td>
            <td class="${scoreClass}">${candidate.matchScore}%</td>
            <td><span class="status-badge ${statusClass}">${candidate.status}</span></td>
            <td>${candidate.experience || 'N/A'}</td>
            <td>${new Date(candidate.uploadDate).toLocaleDateString()}</td>
            <td><button class="view-btn" onclick="viewCandidate('${candidate.id}', '${escapeAttr(candidate.fileName)}')"><i class="fas fa-eye"></i> View Details</button></td>
        `;

        tbody.appendChild(row);
    });
}

function filterCandidates(status, button) {
    // Update active button
    document.querySelectorAll('.filter-buttons button').forEach(btn => {
        btn.classList.remove('active');
    });
    if (button) {
        button.classList.add('active');
    }

    // Filter candidates
    if (status === 'all') {
        displayCandidates(allCandidates);
    } else {
        const filtered = allCandidates.filter(c => c.status === status);
        displayCandidates(filtered);
    }
}

// ============================================================
// Detail Modal — Open / Close
// ============================================================
async function viewCandidate(id, fileName) {
    currentCandidateId = id;

    // Reset modal state
    resetModal();

    // Set header info
    document.getElementById('modalCandidateName').textContent = 'Candidate Profile';
    document.getElementById('modalCandidateFile').textContent = fileName || 'Deep-dive into candidate\'s profile';

    // Show modal
    document.getElementById('detailOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';

    // Try to load saved profile data
    try {
        const res = await fetch(`/api/profile/candidate/${id}`);
        if (res.ok) {
            const saved = await res.json();

            // Populate inputs with saved URLs
            if (saved.githubUrl) {
                document.getElementById('modalGithubUrl').value = saved.githubUrl;
            }
            if (saved.linkedinUrl) {
                document.getElementById('modalLinkedinUrl').value = saved.linkedinUrl;
            }

            // If we have saved GitHub data, render it
            if (saved.githubData) {
                renderModalGitHub(saved.githubData);
            }

            // If we have saved LinkedIn data, render it
            if (saved.linkedinData && saved.linkedinData.fullName) {
                renderModalLinkedIn(saved.linkedinData);
            }

            // Update candidate name if available
            if (saved.candidateName) {
                document.getElementById('modalCandidateName').textContent = saved.candidateName;
            }
        }
    } catch (err) {
        console.log('No saved profile data:', err.message);
    }
}

function closeDetailModal(event) {
    if (event && event.target !== document.getElementById('detailOverlay')) return;
    document.getElementById('detailOverlay').classList.remove('active');
    document.body.style.overflow = '';
    currentCandidateId = null;
}

function resetModal() {
    // Reset tabs
    switchTab('lookup', document.getElementById('tabLookup'));

    // Reset inputs
    document.getElementById('modalGithubUrl').value = '';
    document.getElementById('modalLinkedinUrl').value = '';
    document.getElementById('modalLinkedinText').value = '';

    // Hide results
    document.getElementById('githubResultsContent').style.display = 'none';
    document.getElementById('githubEmpty').style.display = 'flex';
    document.getElementById('linkedinResultsContent').style.display = 'none';
    document.getElementById('linkedinEmpty').style.display = 'flex';

    // Hide error/loading
    document.getElementById('modalError').classList.remove('active');
    document.getElementById('modalLoading').classList.remove('active');
}

// ============================================================
// Tab Switching
// ============================================================
function switchTab(tabName, btn) {
    // Deactivate all tabs
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

    // Activate selected
    if (btn) btn.classList.add('active');

    const contentId = {
        'lookup': 'tabContentLookup',
        'github': 'tabContentGithub',
        'linkedin': 'tabContentLinkedin'
    }[tabName];

    if (contentId) {
        document.getElementById(contentId).classList.add('active');
    }
}

// ============================================================
// Analyze Candidate Profile
// ============================================================
async function analyzeCandidate() {
    const githubUrl = document.getElementById('modalGithubUrl').value.trim();
    const linkedinUrl = document.getElementById('modalLinkedinUrl').value.trim();
    const linkedinText = document.getElementById('modalLinkedinText').value.trim();

    if (!githubUrl && !linkedinText && !linkedinUrl) {
        showModalError('Please enter a GitHub URL, LinkedIn URL, or paste profile content');
        return;
    }

    hideModalError();
    showModalLoading();
    disableAnalyzeBtn();

    try {
        const res = await fetch('/api/profile/candidate-lookup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                candidateId: currentCandidateId,
                githubUrl,
                linkedinUrl,
                linkedinText
            })
        });

        const data = await res.json();
        hideModalLoading();

        if (data.error) {
            showModalError(data.error);
            enableAnalyzeBtn();
            return;
        }

        // Render GitHub results
        if (data.githubData) {
            renderModalGitHub(data.githubData);
            // Auto-switch to GitHub tab
            switchTab('github', document.getElementById('tabGithub'));
        }

        // Render LinkedIn results
        if (data.linkedinData) {
            renderModalLinkedIn(data.linkedinData);
            // If no GitHub data, switch to LinkedIn tab
            if (!data.githubData) {
                switchTab('linkedin', document.getElementById('tabLinkedin'));
            }
        }

        // Update modal header name
        if (data.linkedinData?.fullName) {
            document.getElementById('modalCandidateName').textContent = data.linkedinData.fullName;
        } else if (data.githubData?.profile?.name) {
            document.getElementById('modalCandidateName').textContent = data.githubData.profile.name;
        }

    } catch (error) {
        hideModalLoading();
        showModalError(error.message || 'Failed to analyze profile');
    } finally {
        enableAnalyzeBtn();
    }
}

// ============================================================
// Render GitHub Data in Modal
// ============================================================
function renderModalGitHub(data) {
    const { profile, totalStars, topProjects, languages } = data;

    // Show results, hide empty
    document.getElementById('githubEmpty').style.display = 'none';
    document.getElementById('githubResultsContent').style.display = 'block';

    // Profile card
    document.getElementById('modalGhAvatar').src = profile.avatar;
    document.getElementById('modalGhName').textContent = profile.name;
    document.getElementById('modalGhUsername').textContent = `@${profile.login}`;
    document.getElementById('modalGhBio').textContent = profile.bio || 'No bio available';
    document.getElementById('modalGhLink').href = profile.profileUrl;

    // Meta
    setModalMeta('modalGhLocation', profile.location);
    setModalMeta('modalGhCompany', profile.company);

    // Stats
    document.getElementById('modalStatRepos').textContent = (profile.publicRepos || 0).toLocaleString();
    document.getElementById('modalStatStars').textContent = (totalStars || 0).toLocaleString();
    document.getElementById('modalStatFollowers').textContent = (profile.followers || 0).toLocaleString();
    document.getElementById('modalStatFollowing').textContent = (profile.following || 0).toLocaleString();

    // Top Projects
    const projContainer = document.getElementById('modalProjectList');
    if (topProjects && topProjects.length) {
        projContainer.innerHTML = topProjects.map((p, i) => `
            <a class="modal-project-item" href="${p.url}" target="_blank">
                <div class="modal-proj-top">
                    <span class="modal-proj-name"><i class="fas fa-folder-open"></i> ${escapeHtml(p.name)}</span>
                    <span class="modal-proj-rank">#${i + 1}</span>
                </div>
                <p class="modal-proj-desc">${escapeHtml(p.description)}</p>
                <div class="modal-proj-meta">
                    <span><i class="fas fa-star"></i> ${p.stars}</span>
                    <span><i class="fas fa-code-branch"></i> ${p.forks}</span>
                    <span class="modal-lang-tag">${escapeHtml(p.language)}</span>
                </div>
            </a>
        `).join('');
    } else {
        projContainer.innerHTML = '<p class="modal-empty-text">No projects found</p>';
    }

    // Languages
    const langContainer = document.getElementById('modalLangGrid');
    if (languages && languages.length) {
        langContainer.innerHTML = languages.map(l => {
            const color = LANG_COLORS[l.name] || '#64748b';
            return `
                <div class="modal-lang-item">
                    <span class="modal-lang-dot" style="background: ${color};"></span>
                    <span class="modal-lang-name">${escapeHtml(l.name)}</span>
                    <span class="modal-lang-count">${l.count} repos</span>
                </div>
            `;
        }).join('');
    } else {
        langContainer.innerHTML = '<p class="modal-empty-text">No language data</p>';
    }

    // Add badge to tab
    document.getElementById('tabGithub').classList.add('has-data');
}

function setModalMeta(id, value) {
    const el = document.getElementById(id);
    if (value) {
        el.querySelector('span').textContent = value;
        el.style.display = 'flex';
    } else {
        el.style.display = 'none';
    }
}

// ============================================================
// Render LinkedIn Data in Modal
// ============================================================
function renderModalLinkedIn(data) {
    // Show results, hide empty
    document.getElementById('linkedinEmpty').style.display = 'none';
    document.getElementById('linkedinResultsContent').style.display = 'block';

    // Header
    document.getElementById('modalLiName').textContent = data.fullName || 'LinkedIn Insights';
    document.getElementById('modalLiHeadline').textContent = data.headline || '';
    document.getElementById('modalLiRole').textContent = [data.currentRole, data.location].filter(Boolean).join(' • ');

    // Work Experience
    const expList = document.getElementById('modalExpList');
    if (data.workExperience && data.workExperience.length) {
        expList.innerHTML = data.workExperience.map(exp => `
            <div class="modal-exp-item">
                <div class="modal-exp-icon"><i class="fas fa-building"></i></div>
                <div class="modal-exp-details">
                    <h5>${escapeHtml(exp.title)}</h5>
                    <p class="modal-exp-company">${escapeHtml(exp.company)}</p>
                    <p class="modal-exp-duration"><i class="fas fa-calendar-alt"></i> ${escapeHtml(exp.duration || 'N/A')}</p>
                    ${exp.description ? `<p class="modal-exp-desc">${escapeHtml(exp.description)}</p>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        expList.innerHTML = '<p class="modal-empty-text">No work experience data</p>';
    }

    // Education
    const eduList = document.getElementById('modalEduList');
    if (data.education && data.education.length) {
        eduList.innerHTML = data.education.map(edu => `
            <div class="modal-edu-item">
                <div class="modal-edu-icon"><i class="fas fa-graduation-cap"></i></div>
                <div class="modal-edu-details">
                    <h5>${escapeHtml(edu.degree)}</h5>
                    <p class="modal-edu-school">${escapeHtml(edu.school)}</p>
                    <p class="modal-edu-year">${escapeHtml(edu.year || '')}</p>
                </div>
            </div>
        `).join('');
    } else {
        eduList.innerHTML = '<p class="modal-empty-text">No education data</p>';
    }

    // Certifications
    const certGrid = document.getElementById('modalCertGrid');
    if (data.certifications && data.certifications.length) {
        certGrid.innerHTML = data.certifications.map(cert => `
            <div class="modal-cert-item">
                <div class="modal-cert-icon"><i class="fas fa-award"></i></div>
                <h5>${escapeHtml(cert.name)}</h5>
                <p class="modal-cert-issuer">${escapeHtml(cert.issuer || '')}</p>
                <p class="modal-cert-date">${escapeHtml(cert.date || '')}</p>
            </div>
        `).join('');
    } else {
        certGrid.innerHTML = '<p class="modal-empty-text">No certifications found</p>';
    }

    // Key Highlights
    const highlights = document.getElementById('modalHighlights');
    if (data.keyHighlights && data.keyHighlights.length) {
        highlights.innerHTML = data.keyHighlights.map(h => `
            <div class="modal-highlight-item">
                <div class="modal-check-icon"><i class="fas fa-check"></i></div>
                <p>${escapeHtml(h)}</p>
            </div>
        `).join('');
    } else {
        highlights.innerHTML = '<p class="modal-empty-text">No highlights extracted</p>';
    }

    // Skills
    const skillsCloud = document.getElementById('modalSkillsCloud');
    if (data.skills && data.skills.length) {
        skillsCloud.innerHTML = data.skills.map(s => `<span class="modal-skill-tag">${escapeHtml(s)}</span>`).join('');
    } else {
        skillsCloud.innerHTML = '<p class="modal-empty-text">No skills data</p>';
    }

    // Add badge to tab
    document.getElementById('tabLinkedin').classList.add('has-data');
}

// ============================================================
// UI State Helpers
// ============================================================
function showModalError(msg) {
    const el = document.getElementById('modalError');
    document.getElementById('modalErrorText').textContent = msg;
    el.classList.add('active');
}
function hideModalError() {
    document.getElementById('modalError').classList.remove('active');
}
function showModalLoading() {
    document.getElementById('modalLoading').classList.add('active');
}
function hideModalLoading() {
    document.getElementById('modalLoading').classList.remove('active');
}
function disableAnalyzeBtn() {
    const btn = document.getElementById('modalAnalyzeBtn');
    btn.disabled = true;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
}
function enableAnalyzeBtn() {
    const btn = document.getElementById('modalAnalyzeBtn');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-search"></i> Analyze Candidate Profile <span class="btn-shine"></span>';
}

// ============================================================
// Utility
// ============================================================
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function escapeAttr(str) {
    if (!str) return '';
    return str.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

// Close modal on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeDetailModal();
    }
});

window.addEventListener('DOMContentLoaded', loadCandidates);
