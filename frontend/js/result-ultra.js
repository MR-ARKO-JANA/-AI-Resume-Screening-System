// Result Page - EdTech Career Roadmap, Skill Gap Analysis & PDF Engine

let currentResultData = null;

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
    setupTabNavigation();
    loadResult();
});

// Tab Navigation
function setupTabNavigation() {
    const tabs = document.querySelectorAll('.tab-pill');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => {
                t.classList.remove('bg-white/10', 'text-white', 'border-white/30', 'bg-indigo-500/20', 'text-indigo-300', 'border-indigo-500/30');
                t.classList.add('text-gray-400', 'border-transparent');
            });
            tab.classList.add('bg-white/10', 'text-white', 'border-white/30');
            tab.classList.remove('text-gray-400', 'border-transparent');

            const targetId = tab.getAttribute('data-target');
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.add('hidden');
            });
            const targetContent = document.getElementById(targetId);
            if (targetContent) {
                targetContent.classList.remove('hidden');
            }
        });
    });
}

// Fetch and display result data
async function loadResult() {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const queryId = urlParams.get('id');
        const url = queryId ? `/getlatestresult?id=${encodeURIComponent(queryId)}` : '/getlatestresult';

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            showError(data.error || "No results found. Please upload a resume first.");
            return;
        }

        currentResultData = data;
        renderCandidateHeader(data);
        renderSummaryMetrics(data);
        renderMatchedAndMissingSkills(data);
        renderEducationAndProjects(data);
        renderLearningRoadmap(data);
        renderResumeImprovements(data);
        renderMockQuestions(data);
        renderScoringBreakdown(data);
        renderAiRecommendation(data);
        renderResumeFilePreview(data);

        // Attach PDF Export
        const downloadReportBtn = document.getElementById('downloadPDF');
        if (downloadReportBtn) {
            downloadReportBtn.onclick = () => generateComprehensivePDF(data);
        }

    } catch (error) {
        console.error("Error loading result:", error);
        showError("Failed to load evaluation results. Please try again.");
    }
}

// 1. Candidate Header & Badges
function renderCandidateHeader(data) {
    const nameHeader = document.getElementById('candidateNameHeader');
    if (nameHeader) {
        nameHeader.textContent = data.candidateName || data.fileName.split('.')[0].replace(/[_-]/g, ' ');
    }

    const roleBadge = document.getElementById('targetRoleBadge');
    if (roleBadge) {
        roleBadge.textContent = data.targetRole || 'Target Role';
    }

    const headlineBadge = document.getElementById('candidateHeadlineBadge');
    if (headlineBadge) {
        headlineBadge.textContent = data.experience ? `• ${data.experience}` : '• Candidate Profile';
    }
}

// 2. Summary Metrics (4 Cards)
function renderSummaryMetrics(data) {
    // Match Score
    const scoreCard = document.querySelector('.summary-card.score .card-content p');
    if (scoreCard) scoreCard.textContent = `${data.matchScore}%`;

    const trendElement = document.querySelector('.summary-card.score .card-trend');
    if (trendElement) {
        if (data.matchScore >= 75) {
            trendElement.innerHTML = '<i class="fas fa-check-circle text-emerald-400"></i> High Match';
        } else if (data.matchScore >= 50) {
            trendElement.innerHTML = '<i class="fas fa-adjust text-amber-400"></i> Moderate Match';
        } else {
            trendElement.innerHTML = '<i class="fas fa-exclamation-circle text-red-400"></i> Significant Gaps';
        }
    }

    // ATS Score
    const atsScoreVal = document.getElementById('atsScoreValue');
    if (atsScoreVal) atsScoreVal.textContent = `${data.atsScore || 75}%`;

    const atsRatingBadge = document.getElementById('atsRatingBadge');
    if (atsRatingBadge && data.atsBreakdown) {
        atsRatingBadge.textContent = data.atsBreakdown.rating || 'Good ATS Match';
    }

    // Skill Gaps Count
    const gapsCountEl = document.getElementById('skillGapsCount');
    const missingCount = data.missingSkills ? data.missingSkills.length : 0;
    const matchedCount = data.matchedSkills ? data.matchedSkills.length : 0;
    if (gapsCountEl) gapsCountEl.textContent = missingCount;

    const ratioBadge = document.getElementById('skillsRatioBadge');
    if (ratioBadge) {
        ratioBadge.textContent = `${matchedCount} matched / ${matchedCount + missingCount} required`;
    }

    // Roadmap Progress
    updateMilestoneProgressUI(data);
}

// Calculate and update milestone progress in UI
function updateMilestoneProgressUI(data) {
    if (!data.learningRoadmap || !data.learningRoadmap.roadmap) return;

    let totalMilestones = 0;
    let completedMilestones = 0;

    data.learningRoadmap.roadmap.forEach(week => {
        if (week.milestones) {
            week.milestones.forEach(m => {
                totalMilestones++;
                if (m.completed) completedMilestones++;
            });
        }
    });

    const pct = totalMilestones > 0 ? Math.round((completedMilestones / totalMilestones) * 100) : 0;

    const pctCard = document.getElementById('milestoneProgressPct');
    if (pctCard) pctCard.textContent = `${pct}%`;

    const ratioBadge = document.getElementById('milestoneRatioBadge');
    if (ratioBadge) ratioBadge.textContent = `${completedMilestones}/${totalMilestones} completed`;

    const overallPct = document.getElementById('roadmapOverallPct');
    if (overallPct) overallPct.textContent = `${pct}%`;

    const progBar = document.getElementById('roadmapProgressBar');
    if (progBar) progBar.style.width = `${pct}%`;
}

// 3. Matched vs Missing Skills Lists
function renderMatchedAndMissingSkills(data) {
    const matchedContainer = document.getElementById('matchedSkillsList');
    const matchedBadge = document.getElementById('matchedCountBadge');
    if (matchedContainer) {
        matchedContainer.innerHTML = '';
        const matched = data.matchedSkills || [];
        if (matchedBadge) matchedBadge.textContent = `${matched.length} verified`;

        if (matched.length === 0) {
            matchedContainer.innerHTML = '<span class="text-xs text-gray-400 italic">No direct skill matches detected.</span>';
        } else {
            matched.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'px-3 py-1 rounded-xl text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 inline-flex items-center gap-1.5';
                tag.innerHTML = `<i class="fas fa-check-circle text-emerald-400 text-[10px]"></i> ${capitalize(skill)}`;
                matchedContainer.appendChild(tag);
            });
        }
    }

    const missingContainer = document.getElementById('missingSkillsList');
    const missingBadge = document.getElementById('missingCountBadge');
    if (missingContainer) {
        missingContainer.innerHTML = '';
        const missing = data.missingSkills || [];
        if (missingBadge) missingBadge.textContent = `${missing.length} gaps`;

        if (missing.length === 0) {
            missingContainer.innerHTML = '<span class="text-xs text-emerald-400 font-semibold"><i class="fas fa-check-double mr-1"></i> Outstanding! Zero skill gaps found for this role.</span>';
        } else {
            missing.forEach(skill => {
                const tag = document.createElement('span');
                tag.className = 'px-3 py-1 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20 inline-flex items-center gap-1.5';
                tag.innerHTML = `<i class="fas fa-exclamation-triangle text-amber-400 text-[10px]"></i> ${capitalize(skill)}`;
                missingContainer.appendChild(tag);
            });
        }
    }
}

// 4. Extracted Education & Projects
function renderEducationAndProjects(data) {
    const eduContainer = document.getElementById('educationListContainer');
    if (eduContainer) {
        eduContainer.innerHTML = '';
        const eduList = data.education && data.education.length > 0 ? data.education : [];

        if (eduList.length === 0) {
            eduContainer.innerHTML = `
                <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 italic">
                    <i class="fas fa-info-circle mr-1 text-indigo-400"></i> No formal degree section isolated. Make sure your resume has a clean "EDUCATION" heading.
                </div>
            `;
        } else {
            eduList.forEach(edu => {
                const card = document.createElement('div');
                card.className = 'p-3.5 rounded-xl bg-white/5 border border-white/10 flex items-start gap-3';
                card.innerHTML = `
                    <div class="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                        <i class="fas fa-university text-sm"></i>
                    </div>
                    <div class="flex-1">
                        <h4 class="text-xs font-bold text-white">${escapeHtml(edu.degree || 'Degree Program')}</h4>
                        <p class="text-[11px] text-gray-300">${escapeHtml(edu.school || 'University / College')}</p>
                        <div class="flex items-center gap-2 mt-1 text-[10px] text-gray-400">
                            ${edu.year ? `<span><i class="fas fa-calendar-alt mr-1"></i>${escapeHtml(edu.year)}</span>` : ''}
                            ${edu.gpa ? `<span class="text-emerald-400 font-semibold">• GPA: ${escapeHtml(edu.gpa)}</span>` : ''}
                        </div>
                    </div>
                `;
                eduContainer.appendChild(card);
            });
        }
    }

    const projContainer = document.getElementById('projectsListContainer');
    if (projContainer) {
        projContainer.innerHTML = '';
        const projList = data.projects && data.projects.length > 0 ? data.projects : [];

        if (projList.length === 0) {
            projContainer.innerHTML = `
                <div class="p-3 rounded-xl bg-white/5 border border-white/10 text-xs text-gray-400 italic">
                    <i class="fas fa-info-circle mr-1 text-purple-400"></i> No projects section isolated. Adding a "PROJECTS" section with tech stack tags significantly boosts recruiter interest.
                </div>
            `;
        } else {
            projList.forEach(proj => {
                const card = document.createElement('div');
                card.className = 'p-3.5 rounded-xl bg-white/5 border border-white/10';
                const techBadges = (proj.techStack || []).map(t =>
                    `<span class="px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[9px] font-semibold">${escapeHtml(t)}</span>`
                ).join(' ');

                card.innerHTML = `
                    <div class="flex items-center justify-between mb-1">
                        <h4 class="text-xs font-bold text-white flex items-center gap-1.5">
                            <i class="fas fa-laptop-code text-purple-400"></i> ${escapeHtml(proj.title)}
                        </h4>
                    </div>
                    ${techBadges ? `<div class="flex flex-wrap gap-1 mb-1.5">${techBadges}</div>` : ''}
                    ${proj.description ? `<p class="text-[11px] text-gray-300 leading-relaxed">${escapeHtml(proj.description)}</p>` : ''}
                `;
                projContainer.appendChild(card);
            });
        }
    }
}

// 5. Week-by-Week Learning Roadmap & Progress Tracker
function renderLearningRoadmap(data) {
    const roleTitle = document.getElementById('roadmapRoleTitle');
    if (roleTitle) roleTitle.textContent = data.targetRole || 'Target Role';

    const hoursEst = document.getElementById('roadmapHoursEst');
    if (hoursEst && data.learningRoadmap) {
        hoursEst.textContent = `Est. ${data.learningRoadmap.estimatedHoursPerWeek || '8-12 hrs/week'}`;
    }

    const weeksContainer = document.getElementById('roadmapWeeksContainer');
    if (!weeksContainer) return;
    weeksContainer.innerHTML = '';

    const roadmapData = data.learningRoadmap?.roadmap || [];
    if (roadmapData.length === 0) {
        weeksContainer.innerHTML = '<p class="text-xs text-gray-400 italic">No roadmap items generated.</p>';
        return;
    }

    roadmapData.forEach(week => {
        const card = document.createElement('div');
        card.className = 'glass-card p-5 rounded-2xl border border-white/10 flex flex-col justify-between hover:border-white/40 transition-colors';

        // Skills focus badges
        const skillsBadges = (week.skillsFocus || []).map(s =>
            `<span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white border border-white/20">${capitalize(s)}</span>`
        ).join(' ');

        // Resources links
        const resourcesHtml = (week.freeResources || []).map(r => `
            <a href="${escapeHtml(r.url)}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white text-[11px] font-medium border border-white/10 flex items-center justify-between transition-colors">
                <span class="truncate pr-2"><i class="fas fa-external-link-alt text-[9px] text-zinc-300 mr-1.5"></i>${escapeHtml(r.name)}</span>
                <span class="text-[9px] text-gray-400 shrink-0 font-mono-data">${escapeHtml(r.type || 'Free')}</span>
            </a>
        `).join('');

        // Milestones checklist
        const milestonesHtml = (week.milestones || []).map(m => `
            <label class="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer select-none group">
                <input type="checkbox" class="milestone-checkbox mt-0.5 w-4 h-4 rounded text-white accent-white focus:ring-0 bg-gray-900 border-gray-600 transition-colors" data-score-id="${data.scoreId}" data-milestone-id="${m.id}" ${m.completed ? 'checked' : ''}>
                <span class="${m.completed ? 'line-through text-gray-500' : 'group-hover:text-white'} transition-colors leading-tight">${escapeHtml(m.task)}</span>
            </label>
        `).join('');

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-2">
                    <span class="text-xs font-bold font-mono-data text-white uppercase tracking-wider">Week ${week.week}</span>
                    <div class="flex flex-wrap gap-1">${skillsBadges}</div>
                </div>
                <h3 class="text-sm font-bold text-white font-outfit mb-1">${escapeHtml(week.title)}</h3>
                <p class="text-xs text-gray-400 leading-relaxed mb-3">${escapeHtml(week.goal)}</p>

                <!-- Free Resources -->
                <div class="mb-4">
                    <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1.5"><i class="fas fa-book-open mr-1 text-white"></i> Free Learning Resources:</span>
                    <div class="flex flex-col gap-1.5">${resourcesHtml || '<span class="text-[11px] text-gray-500 italic">Curated guides linked in syllabus.</span>'}</div>
                </div>
            </div>

            <!-- Milestones Tracker -->
            <div class="pt-3 border-t border-white/10">
                <span class="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-2"><i class="fas fa-check-square mr-1 text-emerald-400"></i> Weekly Action Milestones:</span>
                <div class="space-y-2 milestones-list">${milestonesHtml}</div>
            </div>
        `;

        weeksContainer.appendChild(card);
    });

    // Attach milestone change event listeners
    attachMilestoneListeners();

    // Render Suggested Projects
    renderSuggestedProjects(data.learningRoadmap?.suggestedProjects || []);
}

// Milestone Checkbox click handler
function attachMilestoneListeners() {
    document.querySelectorAll('.milestone-checkbox').forEach(cb => {
        cb.addEventListener('change', async (e) => {
            const scoreId = e.target.getAttribute('data-score-id');
            const milestoneId = e.target.getAttribute('data-milestone-id');
            const isChecked = e.target.checked;
            const textSpan = e.target.nextElementSibling;

            if (textSpan) {
                if (isChecked) {
                    textSpan.classList.add('line-through', 'text-gray-500');
                } else {
                    textSpan.classList.remove('line-through', 'text-gray-500');
                }
            }

            try {
                const res = await fetch('/api/edtech/roadmap/milestone', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ scoreId, milestoneId })
                });
                const result = await res.json();

                if (result.success && currentResultData?.learningRoadmap?.roadmap) {
                    // Update in-memory state
                    currentResultData.learningRoadmap.roadmap.forEach(w => {
                        if (w.milestones) {
                            w.milestones.forEach(m => {
                                if (m.id === milestoneId) m.completed = result.completed;
                            });
                        }
                    });
                    updateMilestoneProgressUI(currentResultData);
                    showSuccessToast(result.completed ? "Milestone marked complete! 🎉" : "Milestone reopened.");
                }
            } catch (err) {
                console.error("Milestone update error:", err);
                e.target.checked = !isChecked; // Revert on failure
            }
        });
    });
}

// Render Suggested Projects for target role
function renderSuggestedProjects(projects) {
    const container = document.getElementById('suggestedProjectsContainer');
    if (!container) return;
    container.innerHTML = '';

    if (!projects || projects.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 italic">No project templates available for this role.</p>';
        return;
    }

    projects.forEach(proj => {
        const card = document.createElement('div');
        card.className = 'p-4 rounded-xl bg-white/5 border border-white/10 flex flex-col justify-between';

        const skillsTags = (proj.skillsUsed || []).map(s =>
            `<span class="px-1.5 py-0.5 rounded bg-white/10 text-white border border-white/20 text-[9px] font-semibold">${escapeHtml(s)}</span>`
        ).join(' ');

        card.innerHTML = `
            <div>
                <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 border border-zinc-700">${escapeHtml(proj.difficulty || 'Intermediate')}</span>
                    <i class="fas fa-project-diagram text-gray-500 text-xs"></i>
                </div>
                <h4 class="text-xs font-bold text-white mb-1">${escapeHtml(proj.title)}</h4>
                <p class="text-[11px] text-gray-300 leading-relaxed mb-3">${escapeHtml(proj.description)}</p>
            </div>
            <div class="pt-2 border-t border-white/5 flex flex-wrap gap-1">
                ${skillsTags}
            </div>
        `;
        container.appendChild(card);
    });
}

// 6. Resume Improvement Suggestions
function renderResumeImprovements(data) {
    const improvements = data.resumeImprovements;
    if (!improvements) return;

    // Keywords to Add
    const keywordsContainer = document.getElementById('keywordsToAddList');
    if (keywordsContainer) {
        keywordsContainer.innerHTML = '';
        const keywords = improvements.keywordsToAdd || [];
        if (keywords.length === 0) {
            keywordsContainer.innerHTML = '<span class="text-xs text-emerald-400"><i class="fas fa-check-circle mr-1"></i> Excellent! No crucial role keywords missing.</span>';
        } else {
            keywords.forEach(kw => {
                const tag = document.createElement('span');
                tag.className = 'px-3 py-1 rounded-xl text-xs font-semibold bg-white/10 text-white border border-white/20 inline-flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-copy';
                tag.title = 'Click to copy';
                tag.innerHTML = `<i class="fas fa-plus text-[9px] text-white"></i> ${escapeHtml(kw)}`;
                tag.onclick = () => {
                    navigator.clipboard.writeText(kw);
                    showSuccessToast(`Copied "${kw}" to clipboard!`);
                };
                keywordsContainer.appendChild(tag);
            });
        }
    }

    // Formatting Tips
    const tipsList = document.getElementById('formattingTipsList');
    if (tipsList) {
        tipsList.innerHTML = '';
        const tips = improvements.formattingTips || [];
        tips.forEach(tip => {
            const li = document.createElement('li');
            li.className = 'flex items-start gap-2';
            li.innerHTML = `<i class="fas fa-check text-emerald-400 mt-1 text-xs shrink-0"></i> <span>${escapeHtml(tip)}</span>`;
            tipsList.appendChild(li);
        });
    }

    // Impact Statements (Google XYZ formula)
    const impactContainer = document.getElementById('impactStatementsContainer');
    if (impactContainer) {
        impactContainer.innerHTML = '';
        const statements = improvements.impactStatements || [];

        statements.forEach(stmt => {
            const card = document.createElement('div');
            card.className = 'p-4 rounded-xl bg-white/5 border border-white/10 space-y-2';
            card.innerHTML = `
                <div class="flex items-center justify-between mb-1">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-white">${escapeHtml(stmt.category || 'Impact Example')}</span>
                    <span class="text-[10px] text-gray-500 font-mono-data">Google XYZ Formula</span>
                </div>
                <div class="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-200">
                    <span class="font-bold text-red-400 mr-1.5"><i class="fas fa-times mr-1"></i>Before:</span> "${escapeHtml(stmt.original)}"
                </div>
                <div class="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-200">
                    <span class="font-bold text-emerald-400 mr-1.5"><i class="fas fa-arrow-right mr-1"></i>Improved:</span> "${escapeHtml(stmt.improved)}"
                </div>
                <p class="text-[11px] text-gray-400 italic pt-1"><i class="fas fa-lightbulb text-amber-400 mr-1"></i> Why it works: ${escapeHtml(stmt.reason)}</p>
            `;
            impactContainer.appendChild(card);
        });
    }
}

// 7. Mock Interview Questions
function renderMockQuestions(data) {
    const container = document.getElementById('mockQuestionsContainer');
    if (!container) return;
    container.innerHTML = '';

    const questions = data.mockQuestions?.questions || [];
    if (questions.length === 0) {
        container.innerHTML = '<p class="text-xs text-gray-400 italic">No mock questions generated.</p>';
        return;
    }

    questions.forEach((q, idx) => {
        const item = document.createElement('div');
        item.className = 'p-4 rounded-xl bg-white/5 border border-white/10';

        const focusPoints = (q.keyFocusPoints || []).map(pt =>
            `<li class="flex items-start gap-1.5 text-[11px] text-gray-300"><i class="fas fa-caret-right text-white mt-0.5"></i> ${escapeHtml(pt)}</li>`
        ).join('');

        item.innerHTML = `
            <div class="flex items-center justify-between mb-1.5">
                <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                    Question ${idx + 1} • ${escapeHtml(q.type || 'Technical Concept')}
                </span>
            </div>
            <h4 class="text-xs font-bold text-white mb-2 leading-relaxed">${escapeHtml(q.question)}</h4>
            ${focusPoints ? `
                <div class="pt-2 border-t border-white/5">
                    <span class="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Key Concepts to Mention:</span>
                    <ul class="space-y-1">${focusPoints}</ul>
                </div>
            ` : ''}
        `;
        container.appendChild(item);
    });
}

// 8. Transparent Scoring Breakdown
function renderScoringBreakdown(data) {
    if (!data.scoringBreakdown) return;
    const b = data.scoringBreakdown;

    const skillScore = Number(b.skillMatch?.score) || 0;
    const keywordScore = Number(b.keywordMatch?.score) || 0;
    const expScore = Number(b.experience?.score) || 0;

    const skillPct = document.getElementById('skillBreakdownPct');
    if (skillPct) skillPct.textContent = `${skillScore}/60 pts`;

    const skillProg = document.getElementById('skillProgress');
    if (skillProg) skillProg.style.width = `${Math.min((skillScore / 60) * 100, 100)}%`;

    const skillDesc = document.getElementById('skillBreakdown');
    if (skillDesc) skillDesc.textContent = b.skillMatch?.details || '';

    const kwPct = document.getElementById('keywordBreakdownPct');
    if (kwPct) kwPct.textContent = `${keywordScore}/30 pts`;

    const kwProg = document.getElementById('keywordProgress');
    if (kwProg) kwProg.style.width = `${Math.min((keywordScore / 30) * 100, 100)}%`;

    const kwDesc = document.getElementById('keywordBreakdown');
    if (kwDesc) kwDesc.textContent = b.keywordMatch?.details || '';

    const expPct = document.getElementById('experienceBreakdownPct');
    if (expPct) expPct.textContent = `${expScore}/10 pts`;

    const expProg = document.getElementById('experienceProgress');
    if (expProg) expProg.style.width = `${Math.min((expScore / 10) * 100, 100)}%`;

    const expDesc = document.getElementById('experienceBreakdown');
    if (expDesc) expDesc.textContent = b.experience?.details || '';

    const expSummary = document.getElementById('scoringExplanation');
    if (expSummary) expSummary.textContent = data.explanation || '';
}

// 9. AI Recommendation Card
function renderAiRecommendation(data) {
    const recText = document.querySelector('.recommendation p');
    if (recText) recText.textContent = data.aiAnalysis || 'Evaluation complete.';

    const recBadge = document.querySelector('.recommendation-badge');
    if (recBadge) {
        if (data.matchScore >= 75) {
            recBadge.className = 'recommendation-badge text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
            recBadge.textContent = 'Job-Ready Candidate';
        } else if (data.matchScore >= 50) {
            recBadge.className = 'recommendation-badge text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30';
            recBadge.textContent = 'Up-Skilling Recommended';
        } else {
            recBadge.className = 'recommendation-badge text-[10px] font-bold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30';
            recBadge.textContent = 'Guided Roadmap Required';
        }
    }
}

// 10. Original Resume File Preview & Download
function renderResumeFilePreview(data) {
    const nameEl = document.querySelector('.file-name');
    if (nameEl) nameEl.textContent = data.fileName || 'Resume Document';

    const viewBtn = document.querySelector('.btn-view');
    if (viewBtn && data.filePath) {
        viewBtn.onclick = () => {
            const fileName = data.filePath.split('\\').pop().split('/').pop();
            window.open(`/uploads/${fileName}`, '_blank');
        };
    }

    const downloadBtn = document.querySelector('.btn-download');
    if (downloadBtn && data.filePath) {
        downloadBtn.onclick = () => {
            const fileName = data.filePath.split('\\').pop().split('/').pop();
            const link = document.createElement('a');
            link.href = `/uploads/${fileName}`;
            link.download = data.fileName;
            link.click();
        };
    }
}

// 11. Comprehensive PDF Report & Learning Roadmap Generator
function generateComprehensivePDF(data) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // PAGE 1: Overview, ATS Diagnostics, & Skills Analysis
    doc.setFillColor(15, 23, 42); // Dark slate header
    doc.rect(0, 0, 210, 35, 'F');

    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text('EdTech Career Readiness & Learning Roadmap', 15, 18);

    doc.setFontSize(10);
    doc.setTextColor(148, 163, 184);
    doc.text(`Target Role: ${data.targetRole || 'Software Engineer'}  |  Candidate: ${data.candidateName || 'Student'}  |  Date: ${new Date().toLocaleDateString()}`, 15, 27);

    // Summary Metrics Table
    doc.setFontSize(12);
    doc.setTextColor(30, 41, 59);
    doc.text('Executive Summary & Scores', 15, 45);

    const summaryTable = [
        ['Target Role', data.targetRole || 'Software Engineer'],
        ['Candidate Name', data.candidateName || 'Student'],
        ['Skill Match Score', `${data.matchScore}% (${data.status})`],
        ['ATS Compatibility Score', `${data.atsScore || 75}% (${data.atsBreakdown?.rating || 'Passed'})`],
        ['Skills Matched', `${data.matchedSkills?.length || 0} skills verified`],
        ['Skill Gaps Identified', `${data.missingSkills?.length || 0} missing proficiencies`]
    ];

    doc.autoTable({
        startY: 50,
        head: [['Metric', 'Evaluation Details']],
        body: summaryTable,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 9 }
    });

    // Matched vs Missing Skills Table
    let currentY = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.text('Skill Gap Analysis (Matched vs Missing Skills)', 15, currentY);

    const matchedStr = (data.matchedSkills || []).map(s => capitalize(s)).join(', ') || 'None verified';
    const missingStr = (data.missingSkills || []).map(s => capitalize(s)).join(', ') || 'No critical gaps';

    const skillsComparison = [
        ['Matched Skills (Possessed)', matchedStr],
        ['Missing Skills (Skill Gaps)', missingStr]
    ];

    doc.autoTable({
        startY: currentY + 5,
        head: [['Category', 'Skills']],
        body: skillsComparison,
        theme: 'grid',
        headStyles: { fillColor: [139, 92, 246] },
        styles: { fontSize: 8.5 }
    });

    // AI Analysis Quote
    currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(71, 85, 105);
    const splitAi = doc.splitTextToSize(`AI Recommendation: ${data.aiAnalysis || ''}`, 180);
    doc.text(splitAi, 15, currentY);

    // PAGE 2: Week-by-Week Learning Roadmap & Resources
    doc.addPage();
    doc.setFillColor(99, 102, 241);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text(`6-Week Personalized Learning Roadmap: ${data.targetRole}`, 15, 16);

    const roadmapWeeks = data.learningRoadmap?.roadmap || [];
    const roadmapTableData = roadmapWeeks.map(w => {
        const skills = (w.skillsFocus || []).join(', ');
        const resources = (w.freeResources || []).map(r => `${r.name} (${r.url})`).join('\n');
        const milestones = (w.milestones || []).map(m => `[ ] ${m.task}`).join('\n');
        return [
            `Week ${w.week}: ${w.title}`,
            `Goal: ${w.goal}\nFocus: ${skills}`,
            resources,
            milestones
        ];
    });

    doc.autoTable({
        startY: 32,
        head: [['Week & Focus', 'Weekly Goal', 'Curated Free Resources', 'Action Milestones']],
        body: roadmapTableData,
        theme: 'grid',
        headStyles: { fillColor: [79, 70, 229] },
        styles: { fontSize: 7.5, cellPadding: 2.5 },
        columnStyles: {
            0: { cellWidth: 35 },
            1: { cellWidth: 50 },
            2: { cellWidth: 55 },
            3: { cellWidth: 40 }
        }
    });

    // PAGE 3: Resume Improvement Suggestions & Mock Questions
    doc.addPage();
    doc.setFillColor(16, 185, 129);
    doc.rect(0, 0, 210, 25, 'F');
    doc.setFontSize(16);
    doc.setTextColor(255, 255, 255);
    doc.text('Resume Enhancements & Mock Interview Preparation', 15, 16);

    // Keywords & Formatting
    doc.setFontSize(11);
    doc.setTextColor(30, 41, 59);
    doc.text('1. Keywords to Add & Formatting Advice', 15, 33);

    const kws = (data.resumeImprovements?.keywordsToAdd || []).join(', ') || 'No missing keywords.';
    const tips = (data.resumeImprovements?.formattingTips || []).map(t => `• ${t}`).join('\n');

    doc.autoTable({
        startY: 36,
        head: [['Improvement Area', 'Actionable Recommendations']],
        body: [
            ['Keywords to Add', kws],
            ['Formatting & ATS Tips', tips]
        ],
        theme: 'striped',
        headStyles: { fillColor: [5, 150, 105] },
        styles: { fontSize: 8.5 }
    });

    // Google XYZ Formula Table
    currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text('2. Google XYZ Impact Statement Rewrites', 15, currentY);

    const impactRows = (data.resumeImprovements?.impactStatements || []).map(s => [
        s.category,
        s.original,
        s.improved
    ]);

    doc.autoTable({
        startY: currentY + 4,
        head: [['Category', 'Original (Weak)', 'Improved (Google XYZ Formula)']],
        body: impactRows,
        theme: 'grid',
        headStyles: { fillColor: [245, 158, 11] },
        styles: { fontSize: 8 }
    });

    // Mock Questions Table
    currentY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(11);
    doc.text('3. Mock Interview Prep Questions', 15, currentY);

    const mockRows = (data.mockQuestions?.questions || []).map(q => [
        q.type,
        q.question,
        (q.keyFocusPoints || []).join('\n• ')
    ]);

    doc.autoTable({
        startY: currentY + 4,
        head: [['Question Type', 'Question', 'Key Discussion Points']],
        body: mockRows,
        theme: 'striped',
        headStyles: { fillColor: [99, 102, 241] },
        styles: { fontSize: 8 }
    });

    // Footer on all pages
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(148, 163, 184);
        doc.text(`RecruitAI EdTech Platform  |  Page ${i} of ${pageCount}`, 105, 290, { align: 'center' });
    }

    const safeName = (data.candidateName || 'Student').replace(/[^a-zA-Z0-9]/g, '_');
    doc.save(`${safeName}_Learning_Roadmap_Report.pdf`);
    showSuccessToast("Learning Roadmap PDF exported successfully! 📄");
}

// Helpers
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function showSuccessToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl z-[10000] text-xs font-bold flex items-center gap-2 border border-emerald-400/30';
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${escapeHtml(msg)}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

function showError(msg) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 right-5 bg-gradient-to-r from-red-600 to-rose-600 text-white px-5 py-3 rounded-xl shadow-2xl z-[10000] text-xs font-bold flex items-center gap-2 border border-red-400/30';
    toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${escapeHtml(msg)}`;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.4s ease';
        setTimeout(() => toast.remove(), 400);
    }, 4000);
}
