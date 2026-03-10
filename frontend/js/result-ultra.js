// Fetch and display result data
async function loadResult() {
    try {
        const response = await fetch('/getlatestresult');
        const data = await response.json();

        if (data.error) {
            showError("No results found. Please upload a resume first.");
            return;
        }

        // Update match score with color based on percentage
        const scoreCard = document.querySelector('.summary-card.score .card-content p');
        if (scoreCard) {
            scoreCard.textContent = data.matchScore + '%';

            // Update trend indicator
            const trendElement = document.querySelector('.summary-card.score .card-trend');
            if (data.matchScore >= 75) {
                trendElement.innerHTML = '<i class="fas fa-arrow-up"></i> High Match';
                trendElement.classList.add('positive');
            } else if (data.matchScore >= 50) {
                trendElement.innerHTML = '<i class="fas fa-minus"></i> Medium Match';
                trendElement.classList.remove('positive');
            } else {
                trendElement.innerHTML = '<i class="fas fa-arrow-down"></i> Low Match';
                trendElement.classList.add('negative');
            }
        }

        // Update status with color
        const statusCard = document.querySelector('.summary-card.status .card-content p');
        if (statusCard) {
            statusCard.textContent = data.status;

            // Update trend indicator
            const statusTrend = document.querySelector('.summary-card.status .card-trend');
            if (data.status === 'Shortlisted') {
                statusTrend.innerHTML = '<i class="fas fa-star"></i> Recommended';
                statusTrend.classList.add('positive');
            } else if (data.status === 'Pending') {
                statusTrend.innerHTML = '<i class="fas fa-clock"></i> Under Review';
                statusTrend.classList.remove('positive');
            } else if (data.status === 'Rejected') {
                statusTrend.innerHTML = '<i class="fas fa-times"></i> Not Suitable';
                statusTrend.classList.add('negative');
            }
        }

        // Update experience
        const expCard = document.querySelector('.summary-card.experience .card-content p');
        if (expCard) {
            expCard.textContent = data.experience;

            const expTrend = document.querySelector('.summary-card.experience .card-trend');
            if (data.experience === 'Experienced') {
                expTrend.innerHTML = '<i class="fas fa-briefcase"></i> Professional';
            } else {
                expTrend.innerHTML = '<i class="fas fa-graduation-cap"></i> Entry Level';
            }
        }

        // Update AI confidence
        const confCard = document.querySelector('.summary-card.confidence .card-content p');
        if (confCard) {
            confCard.textContent = data.aiConfidence + '%';

            const confTrend = document.querySelector('.summary-card.confidence .card-trend');
            if (data.aiConfidence >= 90) {
                confTrend.innerHTML = '<i class="fas fa-bolt"></i> Very High';
                confTrend.classList.add('positive');
            } else if (data.aiConfidence >= 70) {
                confTrend.innerHTML = '<i class="fas fa-check"></i> High';
                confTrend.classList.add('positive');
            } else {
                confTrend.innerHTML = '<i class="fas fa-info"></i> Moderate';
            }
        }

        // Update resume file name and add view functionality
        const resumeFileName = data.fileName;
        const resumeFilePath = data.filePath;

        const fileNameElement = document.querySelector('.file-name');
        if (fileNameElement) {
            fileNameElement.textContent = resumeFileName;
        }

        // Add click handler to View Resume button
        const viewResumeBtn = document.querySelector('.btn-view');
        if (viewResumeBtn) {
            viewResumeBtn.onclick = function () {
                // Extract just the filename from the path
                const fileName = resumeFilePath.split('\\').pop().split('/').pop();
                // Open resume in new tab
                window.open(`/uploads/${fileName}`, '_blank');
            };
        }

        // Add download functionality
        const downloadBtn = document.querySelector('.btn-download');
        if (downloadBtn) {
            downloadBtn.onclick = function () {
                const fileName = resumeFilePath.split('\\').pop().split('/').pop();
                const link = document.createElement('a');
                link.href = `/uploads/${fileName}`;
                link.download = resumeFileName;
                link.click();
            };
        }

        // Update AI recommendation
        const recommendationText = document.querySelector('.recommendation p');
        if (recommendationText) {
            recommendationText.textContent = data.aiAnalysis;
        }

        // Update recommendation badge
        const recBadge = document.querySelector('.recommendation-badge');
        if (recBadge) {
            if (data.matchScore >= 75) {
                recBadge.innerHTML = '<i class="fas fa-thumbs-up"></i> Recommended';
                recBadge.classList.add('positive');
            } else if (data.matchScore >= 50) {
                recBadge.innerHTML = '<i class="fas fa-question-circle"></i> Review Required';
                recBadge.classList.remove('positive');
            } else {
                recBadge.innerHTML = '<i class="fas fa-thumbs-down"></i> Not Recommended';
                recBadge.classList.remove('positive');
            }
        }

        // Update skills with dynamic colors
        const skillsSection = document.querySelector('.skills');
        if (skillsSection && data.skills && data.skills.length > 0) {
            const skillsHeader = skillsSection.querySelector('.section-header');
            const skillCount = skillsSection.querySelector('.skill-count');
            if (skillCount) {
                skillCount.textContent = `${data.skills.length} skills found`;
            }

            // Remove old skills
            const oldSkills = skillsSection.querySelectorAll('.skill');
            oldSkills.forEach(skill => skill.remove());

            // Add new skills
            data.skills.forEach((skill, index) => {
                const skillDiv = document.createElement('div');
                skillDiv.className = 'skill';

                // Determine color based on percentage
                let barColor = '';
                if (skill.percentage >= 75) {
                    barColor = 'linear-gradient(135deg, #4CAF50, #8BC34A)'; // Green
                } else if (skill.percentage >= 50) {
                    barColor = 'linear-gradient(135deg, #FF9800, #FFB74D)'; // Orange
                } else {
                    barColor = 'linear-gradient(135deg, #f44336, #ef5350)'; // Red
                }

                skillDiv.innerHTML = `
                    <span>${skill.name}</span>
                    <div class="bar">
                        <div style="width:0%; background: ${barColor}"></div>
                    </div>
                `;
                skillsSection.appendChild(skillDiv);

                // Animate bar
                setTimeout(() => {
                    const bar = skillDiv.querySelector('.bar div');
                    bar.style.width = skill.percentage + '%';
                }, 100 + (index * 100));
            });
        }

        // Update scoring breakdown if available
        if (data.scoringBreakdown) {
            const breakdown = data.scoringBreakdown;

            // Skill Match (60% weight)
            const skillScore = Number(breakdown.skillMatch.score) || 0;
            const skillMatched = Number(breakdown.skillMatch.matched) || 0;
            const skillRequired = Number(breakdown.skillMatch.required) || 0;

            // Calculate actual match percentage
            const skillWidth = skillRequired > 0 ? (skillMatched / skillRequired) * 100 : (skillScore / 60) * 100;

            const skillBreakdown = document.getElementById('skillBreakdown');
            if (skillBreakdown) {
                skillBreakdown.textContent = breakdown.skillMatch.details;
            }

            const skillProgress = document.getElementById('skillProgress');
            if (skillProgress) {
                skillProgress.style.width = '0%';
                skillProgress.style.background = skillWidth >= 75 ?
                    'linear-gradient(90deg, #4CAF50, #8BC34A)' :
                    skillWidth >= 50 ?
                        'linear-gradient(90deg, #FF9800, #FFB74D)' :
                        'linear-gradient(90deg, #f44336, #ef5350)';
                setTimeout(() => {
                    skillProgress.style.width = Math.min(skillWidth, 100).toFixed(1) + '%';
                }, 100);
            }

            // Keyword Match (30% weight)
            const keywordScore = Number(breakdown.keywordMatch.score) || 0;
            const keywordMatched = Number(breakdown.keywordMatch.matched) || 0;
            const keywordTotal = Number(breakdown.keywordMatch.total) || 0;

            // Calculate actual match percentage
            const keywordWidth = keywordTotal > 0 ? (keywordMatched / keywordTotal) * 100 : (keywordScore / 30) * 100;

            const keywordBreakdown = document.getElementById('keywordBreakdown');
            if (keywordBreakdown) {
                keywordBreakdown.textContent = breakdown.keywordMatch.details;
            }

            const keywordProgress = document.getElementById('keywordProgress');
            if (keywordProgress) {
                keywordProgress.style.width = '0%';
                keywordProgress.style.background = keywordWidth >= 75 ?
                    'linear-gradient(90deg, #4CAF50, #8BC34A)' :
                    keywordWidth >= 50 ?
                        'linear-gradient(90deg, #FF9800, #FFB74D)' :
                        'linear-gradient(90deg, #f44336, #ef5350)';
                setTimeout(() => {
                    keywordProgress.style.width = Math.min(keywordWidth, 100).toFixed(1) + '%';
                }, 300);
            }

            // Experience (10% weight)
            const expScore = Number(breakdown.experience.score) || 0;

            // Experience is out of 10, so show as percentage of 10
            const expWidth = (expScore / 10) * 100;

            const experienceBreakdown = document.getElementById('experienceBreakdown');
            if (experienceBreakdown) {
                experienceBreakdown.textContent = breakdown.experience.details;
            }

            const experienceProgress = document.getElementById('experienceProgress');
            if (experienceProgress) {
                experienceProgress.style.width = '0%';
                experienceProgress.style.background = expWidth >= 75 ?
                    'linear-gradient(90deg, #4CAF50, #8BC34A)' :
                    expWidth >= 50 ?
                        'linear-gradient(90deg, #FF9800, #FFB74D)' :
                        'linear-gradient(90deg, #f44336, #ef5350)';
                setTimeout(() => {
                    experienceProgress.style.width = Math.min(expWidth, 100).toFixed(1) + '%';
                }, 500);
            }

            // Display explanation
            if (data.explanation) {
                const explanationElement = document.getElementById('scoringExplanation');
                if (explanationElement) {
                    explanationElement.textContent = data.explanation;
                }
            }
        }

        // Update action buttons based on score
        updateActionButtons(data.matchScore, data.status);

        // Attach PDF download
        const downloadReportBtn = document.getElementById('downloadPDF');
        if (downloadReportBtn) {
            downloadReportBtn.onclick = () => generatePDFReport(data);
        }

    } catch (error) {
        showError("Failed to load results. Please try again.");
    }
}

// PDF Report Generation
function generatePDFReport(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Header
    doc.setFontSize(22);
    doc.setTextColor(99, 102, 241); // Primary color
    doc.text('AI Resume Screening Report', 20, 20);

    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);

    // Candidate Info
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('Candidate Overview', 20, 45);

    const overviewData = [
        ['File Name', data.fileName],
        ['Match Score', `${data.matchScore}%`],
        ['Status', data.status],
        ['Experience', data.experience],
        ['AI Confidence', `${data.aiConfidence}%`]
    ];

    doc.autoTable({
        startY: 50,
        head: [['Field', 'Details']],
        body: overviewData,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] }
    });

    // AI Analysis
    const finalY = doc.lastAutoTable.finalY + 15;
    doc.setFontSize(14);
    doc.text('AI Analysis & Recommendation', 20, finalY);

    doc.setFontSize(11);
    const splitAnalysis = doc.splitTextToSize(data.aiAnalysis, 170);
    doc.text(splitAnalysis, 20, finalY + 10);

    // Skill Match
    const skillY = finalY + 15 + (splitAnalysis.length * 7);
    doc.setFontSize(14);
    doc.text('Skill Match Details', 20, skillY);

    const skillData = data.skills.map(s => [s.name, `${s.percentage}%`]);
    doc.autoTable({
        startY: skillY + 5,
        head: [['Skill', 'Match %']],
        body: skillData,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] }
    });

    // Scoring Breakdown
    if (data.scoringBreakdown) {
        const breakY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text('Transparent Scoring Breakdown', 20, breakY);

        const b = data.scoringBreakdown;
        const breakData = [
            ['Skill Match (60%)', `${b.skillMatch.score}/60`, b.skillMatch.details],
            ['Keyword Match (30%)', `${b.keywordMatch.score}/30`, b.keywordMatch.details],
            ['Experience (10%)', `${b.experience.score}/10`, b.experience.details],
            ['Total Score', `${data.matchScore}/100`, data.explanation || '']
        ];

        doc.autoTable({
            startY: breakY + 5,
            head: [['Category', 'Score', 'Details']],
            body: breakData,
            theme: 'plain',
            headStyles: { fillColor: [79, 70, 229] }
        });
    }

    // Footer
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`AI Recruiter v2.0 Pro - Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
    }

    doc.save(`${data.fileName.split('.')[0]}_Report.pdf`);
}

// Function to update action buttons based on score
function updateActionButtons(matchScore, currentStatus) {
    const actionsSection = document.querySelector('.actions');
    if (!actionsSection) return;

    actionsSection.innerHTML = '';

    if (matchScore >= 75) {
        // High score - Show Shortlist prominently
        actionsSection.innerHTML = `
            <button class="btn-primary-action" onclick="updateStatus('Shortlisted')">
                <i class="fas fa-check"></i> Shortlist Candidate
            </button>
            <button class="btn-reject" onclick="updateStatus('Rejected')">
                <i class="fas fa-times"></i> Reject
            </button>
            <button class="btn-schedule">
                <i class="fas fa-calendar-alt"></i> Schedule Interview
            </button>
        `;
    } else if (matchScore >= 50) {
        // Medium score - Show all options
        actionsSection.innerHTML = `
            <button class="btn-primary-action" onclick="updateStatus('Shortlisted')">
                <i class="fas fa-check"></i> Shortlist Candidate
            </button>
            <button class="btn-reject" onclick="updateStatus('Rejected')">
                <i class="fas fa-times"></i> Reject
            </button>
            <button class="btn-schedule">
                <i class="fas fa-clock"></i> Keep Pending
            </button>
        `;
    } else {
        // Low score - Show Reject prominently
        actionsSection.innerHTML = `
            <button class="btn-reject" onclick="updateStatus('Rejected')">
                <i class="fas fa-times"></i> Reject Candidate
            </button>
            <button class="btn-schedule" onclick="updateStatus('Pending')">
                <i class="fas fa-clock"></i> Keep for Review
            </button>
            <button class="btn-primary-action" onclick="updateStatus('Shortlisted')">
                <i class="fas fa-check"></i> Shortlist Anyway
            </button>
        `;
    }
}

// Function to update candidate status
async function updateStatus(newStatus) {
    try {
        // Show loading state
        const buttons = document.querySelectorAll('.actions button');
        buttons.forEach(btn => btn.disabled = true);

        // Here you would make an API call to update the status
        // For now, just show a success message
        showSuccess(`Candidate status updated to: ${newStatus}`);

        // Re-enable buttons after a delay
        setTimeout(() => {
            buttons.forEach(btn => btn.disabled = false);
            // Optionally redirect to candidates page
            if (newStatus === 'Shortlisted') {
                setTimeout(() => {
                    window.location.href = '/candidates';
                }, 1500);
            }
        }, 1000);

    } catch (error) {
        console.error("Error updating status:", error);
        showError("Failed to update status. Please try again.");
    }
}

// Helper function to show success message
function showSuccess(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #10b981, #059669);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(16, 185, 129, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Helper function to show error message
function showError(message) {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #ef4444, #dc2626);
        color: white;
        padding: 16px 24px;
        border-radius: 12px;
        box-shadow: 0 8px 20px rgba(239, 68, 68, 0.3);
        z-index: 10000;
        font-weight: 600;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Load result when page loads
window.addEventListener('DOMContentLoaded', loadResult);
