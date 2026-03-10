let allCandidates = [];

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
            <td><strong>${index + 1}</strong></td>
            <td>${candidate.fileName}</td>
            <td class="${scoreClass}">${candidate.matchScore}%</td>
            <td><span class="status-badge ${statusClass}">${candidate.status}</span></td>
            <td>${candidate.experience || 'N/A'}</td>
            <td>${new Date(candidate.uploadDate).toLocaleDateString()}</td>
            <td><button class="view-btn" onclick="viewCandidate('${candidate.id}')">View Details</button></td>
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

function viewCandidate(id) {
    // For now, just go to result page
    // You can enhance this to show specific candidate details
    window.location.href = `/result`;
}

window.addEventListener('DOMContentLoaded', loadCandidates);
