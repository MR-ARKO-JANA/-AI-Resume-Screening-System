// Jobs Section Client Functionality
let currentJobId = null;
let currentSourceFilter = 'All';
let searchDebounceTimer = null;

// DOM Cache
let jobGrid = null;
let syncJobsBtn = null;
let jobSearchInput = null;
let jobLocationInput = null;
let tabButtons = [];
let jobDetailsModal = null;
let jobApplyModal = null;
let applyForm = null;
let applyResumeFileInput = null;
let applyDropZone = null;
let selectedFileNotice = null;
let selectedFileName = null;
let removeFileBtn = null;
let applyLoader = null;

// Initialize on DOM load
window.addEventListener('DOMContentLoaded', () => {
    cacheElements();
    setupEventListeners();
    fetchJobs();
});

function cacheElements() {
    jobGrid = document.getElementById('jobGrid');
    syncJobsBtn = document.getElementById('syncJobsBtn');
    jobSearchInput = document.getElementById('jobSearchInput');
    jobLocationInput = document.getElementById('jobLocationInput');
    tabButtons = document.querySelectorAll('.platform-tabs .tab-btn');
    
    // Modals
    jobDetailsModal = document.getElementById('jobDetailsModal');
    jobApplyModal = document.getElementById('jobApplyModal');
    
    // Forms & Inputs
    applyForm = document.getElementById('applyForm');
    applyResumeFileInput = document.getElementById('applyResumeFile');
    applyDropZone = document.getElementById('applyDropZone');
    selectedFileNotice = document.getElementById('selectedFileNotice');
    selectedFileName = document.getElementById('selectedFileName');
    removeFileBtn = document.getElementById('removeFileBtn');
    applyLoader = document.getElementById('applyLoader');
}

function setupEventListeners() {
    // 1. Platform Tabs click
    tabButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            tabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentSourceFilter = btn.getAttribute('data-source');
            fetchJobs();
        });
    });

    // 2. Search & Location Inputs (Debounced)
    [jobSearchInput, jobLocationInput].forEach(input => {
        if (input) {
            input.addEventListener('input', () => {
                clearTimeout(searchDebounceTimer);
                searchDebounceTimer = setTimeout(() => {
                    fetchJobs();
                }, 400); // 400ms debounce
            });
        }
    });

    // 3. Sync Jobs Button
    if (syncJobsBtn) {
        syncJobsBtn.addEventListener('click', async () => {
            const icon = syncJobsBtn.querySelector('i');
            syncJobsBtn.disabled = true;
            syncJobsBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Syncing...';
            
            try {
                const response = await fetch('/api/jobs/sync', { method: 'POST' });
                const data = await response.json();
                
                if (data.error) {
                    alert('Sync Error: ' + data.error);
                } else {
                    alert(data.message || 'Jobs synced successfully!');
                    fetchJobs();
                }
            } catch (err) {
                console.error('Error syncing jobs:', err);
                alert('Connection error during sync.');
            } finally {
                syncJobsBtn.disabled = false;
                syncJobsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Extract & Sync Jobs';
            }
        });
    }

    // 4. Close Modal buttons
    document.getElementById('closeDetailsBtn').addEventListener('click', () => {
        closeModal(jobDetailsModal);
    });
    document.getElementById('closeApplyBtn').addEventListener('click', () => {
        closeModal(jobApplyModal);
    });

    // Close modals on clicking overlay background
    window.addEventListener('click', (e) => {
        if (e.target === jobDetailsModal) closeModal(jobDetailsModal);
        if (e.target === jobApplyModal) closeModal(jobApplyModal);
    });

    // 5. Apply Modal - Resume upload drag-and-drop
    if (applyDropZone && applyResumeFileInput) {
        applyDropZone.addEventListener('click', (e) => {
            if (!e.target.classList.contains('btn-browse') && !e.target.closest('.btn-browse')) {
                applyResumeFileInput.click();
            }
        });

        applyDropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            applyDropZone.classList.add('drag-over');
        });

        applyDropZone.addEventListener('dragleave', () => {
            applyDropZone.classList.remove('drag-over');
        });

        applyDropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            applyDropZone.classList.remove('drag-over');
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].name.toLowerCase().endsWith('.pdf')) {
                applyResumeFileInput.files = files;
                handleFileSelected(files[0].name);
            } else {
                alert('Only PDF resumes are supported.');
            }
        });

        applyResumeFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                const file = e.target.files[0];
                if (file.name.toLowerCase().endsWith('.pdf')) {
                    handleFileSelected(file.name);
                } else {
                    alert('Only PDF resumes are supported.');
                    applyResumeFileInput.value = ''; // clear
                }
            }
        });
    }

    // Remove selected file
    if (removeFileBtn) {
        removeFileBtn.addEventListener('click', () => {
            applyResumeFileInput.value = '';
            selectedFileNotice.style.display = 'none';
            applyDropZone.style.display = 'block';
            applyDropZone.classList.remove('file-selected');
        });
    }

    // 6. Application Form Submit
    if (applyForm) {
        applyForm.addEventListener('submit', (e) => {
            if (!applyResumeFileInput.files || applyResumeFileInput.files.length === 0) {
                e.preventDefault();
                alert('Please upload a resume PDF file.');
                return false;
            }

            // Set action URL dynamically
            applyForm.action = `/api/jobs/apply/${currentJobId}`;
            
            // Show parsing loader overlay
            if (applyLoader) {
                applyLoader.classList.add('active');
            }
        });
    }

    // Trigger Apply from Details Modal
    const modalApplyBtn = document.getElementById('modalApplyBtn');
    if (modalApplyBtn) {
        modalApplyBtn.addEventListener('click', () => {
            closeModal(jobDetailsModal);
            openApplyModal(currentJobId, document.getElementById('modalTitle').textContent, document.getElementById('modalCompany').textContent);
        });
    }
}

// Fetch and render jobs
async function fetchJobs() {
    if (!jobGrid) return;
    
    // Show spinner
    jobGrid.innerHTML = `
        <div class="jobs-loading">
            <i class="fas fa-spinner fa-spin"></i> Fetching active jobs...
        </div>
    `;

    try {
        const search = jobSearchInput.value.trim();
        const location = jobLocationInput.value.trim();
        
        let url = `/api/jobs?source=${currentSourceFilter}`;
        if (search) url += `&search=${encodeURIComponent(search)}`;
        if (location) url += `&location=${encodeURIComponent(location)}`;

        const response = await fetch(url);
        const jobs = await response.json();

        if (jobs.error) {
            jobGrid.innerHTML = `<div class="jobs-loading" style="color:red;"><i class="fas fa-exclamation-triangle"></i> Error: ${jobs.error}</div>`;
            return;
        }

        if (!Array.isArray(jobs) || jobs.length === 0) {
            jobGrid.innerHTML = `
                <div class="no-jobs-found">
                    <i class="fas fa-search"></i>
                    <h3>No Job Openings Found</h3>
                    <p>Try clearing filters or click "Extract & Sync Jobs" to fetch fresh listings.</p>
                </div>
            `;
            return;
        }

        jobGrid.innerHTML = '';
        jobs.forEach(job => {
            const card = createJobCard(job);
            jobGrid.appendChild(card);
        });

    } catch (err) {
        console.error('Error fetching jobs:', err);
        jobGrid.innerHTML = '<div class="jobs-loading" style="color:red;"><i class="fas fa-exclamation-triangle"></i> Failed to connect to server.</div>';
    }
}

function createJobCard(job) {
    const card = document.createElement('div');
    card.className = 'job-card';

    // Source Class for badge styling
    const sourceClass = (job.source || 'manual').toLowerCase();
    
    // Initial letter for logo
    const initial = (job.company || 'U').trim().charAt(0).toUpperCase();

    // Limit skill tags in card
    const skills = job.skillsRequired || [];
    const skillTags = skills.slice(0, 3).map(skill => `<span class="skill-tag">${skill}</span>`).join('');
    const extraSkills = skills.length > 3 ? `<span class="skill-tag">+${skills.length - 3} more</span>` : '';

    card.innerHTML = `
        <div class="job-card-header">
            <div class="company-logo-placeholder">${initial}</div>
            <span class="source-badge ${sourceClass}">${job.source || 'Manual'}</span>
        </div>
        <div class="job-card-info">
            <h3>${job.jobTitle}</h3>
            <div class="company-name">${job.company}</div>
            <div class="job-meta-details">
                <span><i class="fas fa-map-marker-alt"></i> ${job.location || 'India'}</span>
                <span><i class="fas fa-briefcase"></i> ${job.experience || 'Not specified'}</span>
                <span><i class="fas fa-wallet"></i> ${job.salary || 'Not specified'}</span>
            </div>
            <div class="job-skills-tags">
                ${skillTags}
                ${extraSkills}
            </div>
        </div>
        <div class="job-card-actions">
            <button class="btn-details" onclick="openDetailsModal('${job._id}')">View Details</button>
            <button class="btn-apply-now" onclick="openApplyModal('${job._id}', '${job.jobTitle.replace(/'/g, "\\'")}', '${job.company.replace(/'/g, "\\'")}')">Apply Now</button>
        </div>
    `;

    return card;
}

// Open Job Details
async function openDetailsModal(jobId) {
    currentJobId = jobId;
    
    // Clear modal details
    document.getElementById('modalTitle').textContent = 'Loading...';
    document.getElementById('modalCompany').textContent = '';
    document.getElementById('modalLocation').textContent = '';
    document.getElementById('modalExperience').textContent = '';
    document.getElementById('modalSalary').textContent = '';
    document.getElementById('modalDescription').textContent = '';
    document.getElementById('modalSkills').innerHTML = '';
    
    // Open Modal
    jobDetailsModal.classList.add('active');

    try {
        // Find job info from page data or fetch (here we fetch the specific list)
        const response = await fetch(`/api/jobs`);
        const jobs = await response.json();
        const job = jobs.find(j => j._id === jobId);

        if (job) {
            document.getElementById('modalTitle').textContent = job.jobTitle;
            document.getElementById('modalCompany').textContent = job.company;
            document.getElementById('modalLocation').textContent = job.location || 'India';
            document.getElementById('modalExperience').textContent = job.experience || 'Not specified';
            document.getElementById('modalSalary').textContent = job.salary || 'Not specified';
            document.getElementById('modalDescription').textContent = job.jobDescription || 'No description provided.';
            
            // Set source badge
            const badge = document.getElementById('modalSource');
            badge.textContent = job.source || 'Manual';
            badge.className = 'source-badge ' + (job.source || 'manual').toLowerCase();
            
            // Set external URL
            const urlLink = document.getElementById('modalOriginalLink');
            if (job.sourceUrl) {
                urlLink.href = job.sourceUrl;
                urlLink.style.display = 'inline-block';
            } else {
                urlLink.style.display = 'none';
            }

            // Skills
            const skillsDiv = document.getElementById('modalSkills');
            skillsDiv.innerHTML = '';
            if (job.skillsRequired && job.skillsRequired.length > 0) {
                job.skillsRequired.forEach(skill => {
                    const span = document.createElement('span');
                    span.textContent = skill;
                    skillsDiv.appendChild(span);
                });
            } else {
                skillsDiv.innerHTML = '<span style="background:transparent; color:#94a3b8; padding:0;">No skills listed.</span>';
            }
        } else {
            document.getElementById('modalTitle').textContent = 'Job Not Found';
        }
    } catch (err) {
        console.error('Error fetching job details:', err);
        document.getElementById('modalTitle').textContent = 'Failed to Load Details';
    }
}

// Open Apply Resume Modal
function openApplyModal(jobId, jobTitle, companyName) {
    currentJobId = jobId;
    document.getElementById('applyJobTitle').textContent = jobTitle;
    document.getElementById('applyJobCompany').textContent = companyName;
    
    // Clear upload state
    applyResumeFileInput.value = '';
    selectedFileNotice.style.display = 'none';
    applyDropZone.style.display = 'block';
    applyDropZone.classList.remove('file-selected');
    
    jobApplyModal.classList.add('active');
}

function handleFileSelected(fileName) {
    applyDropZone.style.display = 'none';
    selectedFileName.textContent = fileName;
    selectedFileNotice.style.display = 'flex';
}

function closeModal(modal) {
    if (modal) {
        modal.classList.remove('active');
    }
}

// Keyboard navigation: close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(m => m.classList.remove('active'));
    }
});
