// Settings Page JavaScript

// Load user data on page load
window.addEventListener('DOMContentLoaded', loadUserData);

async function loadUserData() {
    try {
        const response = await fetch('/api/user-profile');
        const data = await response.json();

        if (!data.error) {
            document.getElementById('userName').value = data.name || '';
            document.getElementById('userEmail').value = data.email || '';
            document.getElementById('companyName').value = data.company || '';
            document.getElementById('jobTitle').value = data.jobTitle || '';
        }
    } catch (error) {
        // Error already handled or silent
    }
}

// Save Profile
async function saveProfile() {
    const name = document.getElementById('userName').value;
    const company = document.getElementById('companyName').value;
    const jobTitle = document.getElementById('jobTitle').value;

    if (!name) {
        showMessage('Please enter your name', 'error');
        return;
    }

    try {
        const response = await fetch('/api/update-profile', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, company, jobTitle })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Profile updated successfully!', 'success');
        } else {
            showMessage(data.error || 'Failed to update profile', 'error');
        }
    } catch (error) {
        showMessage('Error updating profile', 'error');
    }
}

// Change Password
async function changePassword() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (!currentPassword || !newPassword || !confirmPassword) {
        showMessage('Please fill all password fields', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showMessage('New password must be at least 6 characters', 'error');
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage('Passwords do not match', 'error');
        return;
    }

    try {
        const response = await fetch('/api/change-password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (data.success) {
            showMessage('Password changed successfully!', 'success');
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';
        } else {
            showMessage(data.error || 'Failed to change password', 'error');
        }
    } catch (error) {
        showMessage('Error changing password', 'error');
    }
}

// Save Preferences
function savePreferences() {
    const emailNotif = document.getElementById('emailNotif').checked;
    const autoArchive = document.getElementById('autoArchive').checked;
    const darkMode = document.getElementById('darkMode').checked;

    localStorage.setItem('preferences', JSON.stringify({
        emailNotif,
        autoArchive,
        darkMode
    }));

    // Fire event for theme.js to pick up
    window.dispatchEvent(new Event('preferencesUpdated'));

    showMessage('Preferences saved successfully!', 'success');
}

// Update Scoring Weights
function updateWeights() {
    const skillWeight = parseInt(document.getElementById('skillWeight').value);
    const keywordWeight = parseInt(document.getElementById('keywordWeight').value);
    const expWeight = parseInt(document.getElementById('expWeight').value);

    document.getElementById('skillWeightValue').textContent = skillWeight + '%';
    document.getElementById('keywordWeightValue').textContent = keywordWeight + '%';
    document.getElementById('expWeightValue').textContent = expWeight + '%';

    const total = skillWeight + keywordWeight + expWeight;
    document.getElementById('totalWeight').textContent = total + '%';

    // Update chart segments
    document.querySelector('.chart-segment.skills').style.width = skillWeight + '%';
    document.querySelector('.chart-segment.skills').textContent = skillWeight + '%';
    document.querySelector('.chart-segment.keywords').style.width = keywordWeight + '%';
    document.querySelector('.chart-segment.keywords').textContent = keywordWeight + '%';
    document.querySelector('.chart-segment.experience').style.width = expWeight + '%';
    document.querySelector('.chart-segment.experience').textContent = expWeight + '%';

    // Change color based on total
    const totalElement = document.getElementById('totalWeight');
    if (total === 100) {
        totalElement.style.color = '#10B981'; // Tailwind emerald-500
    } else {
        totalElement.style.color = '#EF4444'; // Tailwind red-500
    }
}

// Save Scoring Configuration
function saveScoring() {
    let skillWeight = parseInt(document.getElementById('skillWeight').value);
    let keywordWeight = parseInt(document.getElementById('keywordWeight').value);
    let expWeight = parseInt(document.getElementById('expWeight').value);

    let total = skillWeight + keywordWeight + expWeight;

    // Normalize to 100%
    if (total === 0) {
        skillWeight = 34; keywordWeight = 33; expWeight = 33;
    } else {
        skillWeight = Math.round((skillWeight / total) * 100);
        keywordWeight = Math.round((keywordWeight / total) * 100);
        expWeight = 100 - skillWeight - keywordWeight;
    }

    // Update UI with normalized values
    document.getElementById('skillWeight').value = skillWeight;
    document.getElementById('keywordWeight').value = keywordWeight;
    document.getElementById('expWeight').value = expWeight;
    updateWeights();

    localStorage.setItem('scoringWeights', JSON.stringify({
        skillWeight,
        keywordWeight,
        expWeight
    }));

    showMessage('Scoring configuration normalized and saved!', 'success');
}

// Delete All Data
async function deleteAllData() {
    if (confirm('⚠️ Are you sure? This will permanently delete all resumes and candidates. This action cannot be undone!')) {
        if (confirm('⚠️ FINAL WARNING: All your data will be lost forever. Continue?')) {
            try {
                const response = await fetch('/api/delete-all-data', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    showMessage('All data deleted successfully!', 'success');
                    // Reset stats display if on dashboard, but we're on settings
                } else {
                    showMessage(data.error || 'Failed to delete data', 'error');
                }
            } catch (error) {
                showMessage('Error deleting data', 'error');
            }
        }
    }
}

// Delete Account
async function deleteAccount() {
    if (confirm('⚠️ Are you sure you want to delete your account? This action cannot be undone!')) {
        const confirmation = prompt('Type "DELETE" to confirm account deletion:');
        if (confirmation === 'DELETE') {
            try {
                const response = await fetch('/api/delete-account', { method: 'POST' });
                const data = await response.json();

                if (data.success) {
                    alert('Account deleted successfully. You will be redirected.');
                    window.location.href = '/';
                } else {
                    showMessage(data.error || 'Failed to delete account', 'error');
                }
            } catch (error) {
                showMessage('Error deleting account', 'error');
            }
        } else {
            showMessage('Account deletion cancelled', 'success');
        }
    }
}

// Show Message
function showMessage(message, type) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white font-bold shadow-lg z-50 transition-all duration-300 transform translate-y-0 opacity-100';
    messageDiv.textContent = message;

    if (type === 'error') {
        messageDiv.classList.add('bg-red-600');
    } else {
        messageDiv.classList.add('bg-emerald-500');
    }

    document.body.appendChild(messageDiv);

    setTimeout(() => {
        messageDiv.classList.add('translate-y-4', 'opacity-0');
        setTimeout(() => {
            if (messageDiv.parentNode) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// Load saved preferences on page load
window.addEventListener('DOMContentLoaded', () => {
    const savedPrefs = localStorage.getItem('preferences');
    if (savedPrefs) {
        const prefs = JSON.parse(savedPrefs);
        document.getElementById('emailNotif').checked = prefs.emailNotif;
        document.getElementById('autoArchive').checked = prefs.autoArchive;
        if (document.getElementById('darkMode')) {
            document.getElementById('darkMode').checked = prefs.darkMode !== false;
        }
    } else {
        // Defaults
        if (document.getElementById('darkMode')) {
            document.getElementById('darkMode').checked = true;
        }
    }

    const savedWeights = localStorage.getItem('scoringWeights');
    if (savedWeights) {
        const weights = JSON.parse(savedWeights);
        document.getElementById('skillWeight').value = weights.skillWeight;
        document.getElementById('keywordWeight').value = weights.keywordWeight;
        document.getElementById('expWeight').value = weights.expWeight;
        updateWeights();
    }

    // Load saved profile image
    const savedImg = localStorage.getItem('userProfileImage');
    if (savedImg) {
        updateAllAvatars(savedImg);
    }
});

// Profile Image Upload Handlers
document.getElementById('profileImageInput')?.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            showMessage('Image must be less than 2MB', 'error');
            return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
            const base64Str = event.target.result;
            localStorage.setItem('userProfileImage', base64Str);
            updateAllAvatars(base64Str);
            showMessage('Profile photo updated', 'success');
        };
        reader.readAsDataURL(file);
    }
});

function removeProfileImage() {
    localStorage.removeItem('userProfileImage');
    const defaultImg = '../images/user_img.webp';
    updateAllAvatars(defaultImg);
    showMessage('Profile photo removed', 'success');
}

function updateAllAvatars(src) {
    // Update preview if it exists on page
    const preview = document.getElementById('profilePreview');
    if (preview) preview.src = src;
    
    // Update all header avatars
    document.querySelectorAll('img[alt="User Avatar"]').forEach(img => {
        img.src = src;
    });
}

