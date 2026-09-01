// Jobs Page - Job listing, syncing, and modal interactions

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
                syncJobsBtn.innerHTML = '<i class="fas fa-sync-alt"></i> Sync Jobs';
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
                applyLoader.classList.remove('hidden');
                applyLoader.classList.add('flex', 'active');
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
    card.className = 'bg-surface-container-lowest rounded-xl border border-border-subtle p-6 flex flex-col hover:border-[#2563EB] hover:shadow-md transition-all group';

    const sourceClass = (job.source || 'manual').toLowerCase();
    const initial = (job.company || 'U').trim().charAt(0).toUpperCase();
    const skills = job.skillsRequired || [];
    const skillTags = skills.slice(0, 3).map(skill => `<span class="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded">${skill}</span>`).join('');
    const extraSkills = skills.length > 3 ? `<span class="px-2 py-1 bg-surface-variant text-on-surface-variant text-xs font-semibold rounded">+${skills.length - 3}</span>` : '';

    card.innerHTML = `
        <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 flex items-center justify-center font-bold text-xl shrink-0 shadow-sm border border-blue-200">
                ${initial}
            </div>
            <div>
                <h3 class="font-bold text-primary text-lg leading-tight group-hover:text-[#2563EB] transition-colors line-clamp-1">${job.jobTitle}</h3>
                <p class="text-sm font-semibold text-slate-gray mt-0.5 line-clamp-1">${job.company}</p>
            </div>
        </div>
        
        <div class="flex flex-col gap-2 text-sm text-on-surface-variant mb-4 font-medium">
            <span class="flex items-center gap-2"><i class="fas fa-map-marker-alt w-4 text-center opacity-70"></i> ${job.location || 'India'}</span>
            <span class="flex items-center gap-2"><i class="fas fa-briefcase w-4 text-center opacity-70"></i> ${job.experience || 'Not specified'}</span>
            <span class="flex items-center gap-2"><i class="fas fa-wallet w-4 text-center opacity-70"></i> ${job.salary || 'Not specified'}</span>
        </div>
        
        <div class="flex flex-wrap gap-2 mb-6">
            ${skillTags}
            ${extraSkills}
        </div>
        
        <div class="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-border-subtle">
            <button class="px-4 py-2 border border-border-subtle text-primary text-sm font-bold rounded hover:bg-surface-variant transition-colors text-center" onclick="openDetailsModal('${job._id}')">Details</button>
            <button class="px-4 py-2 bg-[#2563EB] text-white text-sm font-bold rounded hover:bg-opacity-90 transition-colors shadow-sm text-center" onclick="openApplyModal('${job._id}', '${job.jobTitle.replace(/'/g, "\\'")}', '${job.company.replace(/'/g, "\\'")}')">Apply</button>
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
    jobDetailsModal.classList.remove('hidden');

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
                    span.className = 'px-3 py-1.5 bg-surface-variant text-on-surface-variant text-sm font-semibold rounded-md';
                    span.textContent = skill;
                    skillsDiv.appendChild(span);
                });
            } else {
                skillsDiv.innerHTML = '<span class="text-sm text-on-surface-variant italic">No skills listed.</span>';
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
    
    jobApplyModal.classList.remove('hidden');
}

function handleFileSelected(fileName) {
    applyDropZone.style.display = 'none';
    selectedFileName.textContent = fileName;
    selectedFileNotice.style.display = 'flex';
}

function closeModal(modal) {
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Keyboard navigation: close modals with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modals = document.querySelectorAll('.modal-overlay.active');
        modals.forEach(m => m.classList.remove('active'));
    }
});
