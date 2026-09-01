// Candidates Page - Candidate listing and management

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

    document.getElementById('totalCount').textContent = candidates.length + ' candidates';

    candidates.forEach((candidate, index) => {
        const row = document.createElement('tr');
        row.className = "hover:bg-[#F8FAFC] transition-colors group";

        const strokeColor = candidate.matchScore >= 75 ? 'text-score-high' :
            candidate.matchScore >= 50 ? 'text-warning-pending' : 'text-error-rejected';

        let statusClass = '';
        if (candidate.status === 'Shortlisted') statusClass = 'bg-[#D1FAE5] text-[#065F46]';
        else if (candidate.status === 'Pending') statusClass = 'bg-[#FEF3C7] text-[#92400E]';
        else if (candidate.status === 'Rejected') statusClass = 'bg-[#FEE2E2] text-[#991B1B]';

        let initials = candidate.candidateName ? candidate.candidateName.substring(0,2).toUpperCase() : 'NA';
        let strokeDash = Math.round(candidate.matchScore) + ', 100';

        row.innerHTML = `
            <td class="py-4 px-4"><input type="checkbox" class="candidate-checkbox rounded border-border-subtle" data-id="${candidate.id}"></td>
            <td class="py-4 px-4 text-on-surface-variant">${index + 1}</td>
            <td class="py-4 px-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-variant shrink-0 flex items-center justify-center">
                        <span class="font-title-lg text-on-surface-variant">${initials}</span>
                    </div>
                    <div>
                        <p class="font-title-lg text-body-md font-semibold text-primary">${escapeHtml(candidate.candidateName || candidate.fileName)}</p>
                        ${candidate.candidateName ? `<div class="flex items-center gap-1 mt-0.5"><small class="text-on-surface-variant text-[11px]">${escapeHtml(candidate.fileName)}</small></div>` : ''}
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <div class="flex items-center gap-2">
                    <div class="relative w-8 h-8 flex items-center justify-center">
                        <svg class="w-full h-full transform -rotate-90" viewbox="0 0 36 36">
                            <path class="text-surface-variant" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-width="3"></path>
                            <path class="${strokeColor}" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" stroke-dasharray="${strokeDash}" stroke-width="3"></path>
                        </svg>
                        <span class="absolute font-mono-data text-mono-data ${strokeColor} font-bold" style="font-size: 10px;">${Math.round(candidate.matchScore)}</span>
                    </div>
                </div>
            </td>
            <td class="py-4 px-4">
                <span class="inline-flex items-center px-2 py-1 rounded ${statusClass} font-label-md text-label-md">
                    ${candidate.status}
                </span>
            </td>
            <td class="py-4 px-4">
                <p class="font-body-md text-body-md text-on-surface">${escapeHtml(candidate.experience || 'N/A')}</p>
            </td>
            <td class="py-4 px-4 font-mono-data text-[12px] text-on-surface-variant">
                ${new Date(candidate.uploadDate).toLocaleDateString()}
            </td>
            <td class="py-4 px-4 text-right">
                <div class="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button class="p-1.5 text-slate-gray hover:text-[#2563EB] hover:bg-surface-container-low rounded" title="View Details" onclick="viewCandidate('${candidate.id}', '${escapeAttr(candidate.fileName)}')">
                        <span class="material-symbols-outlined" data-icon="visibility">visibility</span>
                    </button>
                </div>
            </td>
        `;

        tbody.appendChild(row);
    });
}

function filterCandidates(status, button) {
    // Filter candidates
    if (status === 'all') {
        displayCandidates(allCandidates);
    } else {
        const filtered = allCandidates.filter(c => c.status === status);
        displayCandidates(filtered);
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
    document.getElementById('detailOverlay').classList.remove('hidden');
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
    document.getElementById('detailOverlay').classList.add('hidden');
    document.body.style.overflow = '';
    currentCandidateId = null;
}

function resetModal() {
    // Reset tabs
    switchTab('lookup', document.getElementById('tabLookup'));

    // Find candidate in allCandidates array
    const candidate = allCandidates.find(c => c.id === currentCandidateId) || {};

    // Reset inputs
    document.getElementById('modalGithubUrl').value = candidate.githubUrl || '';
    document.getElementById('modalLinkedinUrl').value = candidate.linkedinUrl || '';

    // Hide results
    document.getElementById('githubResultsContent').style.display = 'none';
    document.getElementById('githubEmpty').style.display = 'flex';
    document.getElementById('linkedinResultsContent').style.display = 'none';
    document.getElementById('linkedinEmpty').style.display = 'flex';

    // Hide error/loading
    document.getElementById('modalError').classList.add('hidden');
    document.getElementById('modalLoading').classList.add('hidden');
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

    if (!githubUrl && !linkedinUrl) {
        showModalError('Please enter a GitHub or LinkedIn URL');
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
                githubUrl: githubUrl || '',
                linkedinUrl: linkedinUrl || ''
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
            <a class="block p-3 border border-border-subtle rounded-md hover:bg-surface transition-colors" href="${p.url}" target="_blank">
                <div class="flex justify-between items-center">
                    <span class="text-sm font-bold text-[#2563EB] flex items-center gap-2"><i class="fas fa-folder-open"></i> ${escapeHtml(p.name)}</span>
                    <span class="text-xs font-bold text-on-surface-variant opacity-50">#${i + 1}</span>
                </div>
                <p class="text-xs text-on-surface-variant mt-1 line-clamp-2">${escapeHtml(p.description)}</p>
                <div class="flex gap-4 mt-2 text-xs text-on-surface-variant font-medium">
                    <span class="flex items-center gap-1"><i class="fas fa-star text-amber-500"></i> ${p.stars}</span>
                    <span class="flex items-center gap-1"><i class="fas fa-code-branch text-[#2563EB]"></i> ${p.forks}</span>
                    ${p.language ? `<span class="px-2 py-0.5 rounded-sm bg-surface-variant text-[10px] uppercase">${escapeHtml(p.language)}</span>` : ''}
                </div>
            </a>
        `).join('');
    } else {
        projContainer.innerHTML = '<p class="text-sm text-on-surface-variant italic">No projects found</p>';
    }

    // Languages
    const langContainer = document.getElementById('modalLangGrid');
    if (languages && languages.length) {
        langContainer.innerHTML = languages.map(l => {
            const color = LANG_COLORS[l.name] || '#64748b';
            return `
                <div class="flex items-center justify-between p-2 border border-border-subtle rounded-md">
                    <div class="flex items-center gap-2">
                        <span class="w-3 h-3 rounded-full" style="background: ${color};"></span>
                        <span class="text-sm font-semibold text-primary">${escapeHtml(l.name)}</span>
                    </div>
                    <span class="text-xs font-mono-data text-on-surface-variant">${l.count} repos</span>
                </div>
            `;
        }).join('');
    } else {
        langContainer.innerHTML = '<p class="text-sm text-on-surface-variant italic">No language data</p>';
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
            <div class="flex gap-4 p-3 hover:bg-surface transition-colors rounded-md border border-transparent hover:border-border-subtle">
                <div class="mt-1 w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
                    <i class="fas fa-building text-on-surface-variant"></i>
                </div>
                <div>
                    <h5 class="font-bold text-sm text-primary">${escapeHtml(exp.title)}</h5>
                    <p class="text-sm font-semibold text-[#2563EB] mt-0.5">${escapeHtml(exp.company)}</p>
                    <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><i class="fas fa-calendar-alt opacity-70"></i> ${escapeHtml(exp.duration || 'N/A')}</p>
                    ${exp.description ? `<p class="text-xs text-on-surface-variant mt-2">${escapeHtml(exp.description)}</p>` : ''}
                </div>
            </div>
        `).join('');
    } else {
        expList.innerHTML = '<p class="text-sm text-on-surface-variant italic">No work experience data</p>';
    }

    // Education
    const eduList = document.getElementById('modalEduList');
    if (data.education && data.education.length) {
        eduList.innerHTML = data.education.map(edu => `
            <div class="flex gap-4 p-3 hover:bg-surface transition-colors rounded-md border border-transparent hover:border-border-subtle">
                <div class="mt-1 w-10 h-10 rounded-lg bg-surface-variant flex items-center justify-center shrink-0">
                    <i class="fas fa-graduation-cap text-on-surface-variant"></i>
                </div>
                <div>
                    <h5 class="font-bold text-sm text-primary">${escapeHtml(edu.degree)}</h5>
                    <p class="text-sm font-semibold text-[#2563EB] mt-0.5">${escapeHtml(edu.school)}</p>
                    <p class="text-xs text-on-surface-variant flex items-center gap-1 mt-1"><i class="fas fa-calendar-alt opacity-70"></i> ${escapeHtml(edu.year || '')}</p>
                </div>
            </div>
        `).join('');
    } else {
        eduList.innerHTML = '<p class="text-sm text-on-surface-variant italic">No education data</p>';
    }

    // Certifications
    const certGrid = document.getElementById('modalCertGrid');
    if (data.certifications && data.certifications.length) {
        certGrid.innerHTML = data.certifications.map(cert => `
            <div class="p-3 border border-border-subtle rounded-md bg-surface">
                <div class="flex items-center gap-2 mb-2">
                    <i class="fas fa-award text-emerald-500"></i>
                    <h5 class="font-bold text-sm text-primary line-clamp-1">${escapeHtml(cert.name)}</h5>
                </div>
                <p class="text-xs text-on-surface-variant font-medium">${escapeHtml(cert.issuer || '')}</p>
                <p class="text-xs text-on-surface-variant/70 mt-1">${escapeHtml(cert.date || '')}</p>
            </div>
        `).join('');
    } else {
        certGrid.innerHTML = '<p class="text-sm text-on-surface-variant italic">No certifications found</p>';
    }

    // Key Highlights
    const highlights = document.getElementById('modalHighlights');
    if (data.keyHighlights && data.keyHighlights.length) {
        highlights.innerHTML = data.keyHighlights.map(h => `
            <div class="flex items-start gap-2">
                <i class="fas fa-check text-emerald-500 mt-0.5"></i>
                <p>${escapeHtml(h)}</p>
            </div>
        `).join('');
    } else {
        highlights.innerHTML = '<p class="text-sm text-on-surface-variant italic">No highlights extracted</p>';
    }

    // Skills
    const skillsCloud = document.getElementById('modalSkillsCloud');
    if (data.skills && data.skills.length) {
        skillsCloud.innerHTML = data.skills.map(s => `<span class="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs rounded-md font-semibold">${escapeHtml(s)}</span>`).join('');
    } else {
        skillsCloud.innerHTML = '<p class="text-sm text-on-surface-variant italic">No skills data</p>';
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
    el.classList.remove('hidden');
}
function hideModalError() {
    document.getElementById('modalError').classList.add('hidden');
}
function showModalLoading() {
    document.getElementById('modalLoading').classList.remove('hidden');
}
function hideModalLoading() {
    document.getElementById('modalLoading').classList.add('hidden');
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
