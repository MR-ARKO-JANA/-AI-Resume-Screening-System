const pdf = require('pdf-parse');
const mammoth = require('mammoth');
const fs = require('fs');
const path = require('path');

// Common skills database
const SKILLS_DATABASE = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
    'react', 'next.js', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring', 'fastapi',
    'mongodb', 'postgresql', 'mysql', 'redis', 'sql', 'nosql',
    'html', 'html5', 'css', 'css3', 'typescript', 'sass', 'tailwind css', 'bootstrap',
    'docker', 'kubernetes', 'jenkins', 'ci/cd', 'devops',
    'aws', 'azure', 'gcp', 'cloud computing',
    'git', 'github', 'gitlab', 'version control',
    'agile', 'scrum', 'kanban', 'jira',
    'rest api', 'graphql', 'microservices', 'api',
    'machine learning', 'deep learning', 'data science', 'ai', 'pandas', 'numpy', 'scikit-learn', 'pytorch', 'tensorflow',
    'testing', 'unit testing', 'integration testing', 'jest', 'mocha',
    'linux', 'unix', 'bash', 'shell scripting',
    'security', 'authentication', 'authorization', 'oauth', 'jwt',
    'responsive design', 'ui/ux', 'frontend', 'backend', 'full stack'
];

// Skill synonyms mapping
const SKILL_SYNONYMS = {
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015'],
    'python': ['python', 'py', 'python3'],
    'machine learning': ['machine learning', 'ml', 'artificial intelligence', 'ai'],
    'react': ['react', 'reactjs', 'react.js'],
    'next.js': ['next.js', 'nextjs', 'next'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'mongodb': ['mongodb', 'mongo', 'mongo db'],
    'postgresql': ['postgresql', 'postgres', 'psql'],
    'c++': ['c++', 'cpp', 'cplusplus'],
    'c#': ['c#', 'csharp', 'c sharp'],
    'sql': ['sql', 'structured query language'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3', 'cascading style sheets'],
    'tailwind css': ['tailwind', 'tailwindcss', 'tailwind css'],
    'docker': ['docker', 'containerization'],
    'kubernetes': ['kubernetes', 'k8s'],
    'aws': ['aws', 'amazon web services'],
    'azure': ['azure', 'microsoft azure'],
    'gcp': ['gcp', 'google cloud platform', 'google cloud'],
    'git': ['git', 'version control', 'github', 'gitlab'],
    'agile': ['agile', 'scrum', 'kanban'],
    'rest api': ['rest', 'restful', 'rest api', 'api'],
    'typescript': ['typescript', 'ts'],
    'jwt': ['jwt', 'jsonwebtoken', 'json web token']
};

// Parse PDF to text
async function parsePDF(filePath) {
    try {
        const dataBuffer = fs.readFileSync(filePath);
        const data = await pdf(dataBuffer);
        return data.text;
    } catch (error) {
        throw new Error('Error parsing PDF: ' + error.message);
    }
}

// Parse DOCX / DOC to text
async function parseDOCX(filePath) {
    try {
        const result = await mammoth.extractRawText({ path: filePath });
        return result.value || '';
    } catch (error) {
        console.warn('DOCX parse fallback to buffer read:', error.message);
        try {
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdf(dataBuffer);
            return data.text;
        } catch (e) {
            throw new Error('Error parsing Word document: ' + error.message);
        }
    }
}

// Universal Resume Parser (handles both PDF and DOCX)
async function parseResumeFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    if (ext === '.docx' || ext === '.doc') {
        return await parseDOCX(filePath);
    }
    return await parsePDF(filePath);
}

// Enhanced clean and normalize text
function cleanText(text) {
    if (!text) return '';
    text = text.toLowerCase();
    text = text.replace(/https?:\/\/[^\s]+/g, '');
    text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');
    text = text.replace(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/g, '');
    text = text.replace(/\s+/g, ' ');
    text = text.replace(/[^\w\s.,;:()\-]/g, '');

    const commonHeaders = ['curriculum vitae', 'resume', 'cv', 'page', 'references available'];
    commonHeaders.forEach(header => {
        const regex = new RegExp('\\b' + header + '\\b', 'gi');
        text = text.replace(regex, '');
    });

    return text.trim();
}

// Extract skills from text with synonym matching
function extractSkills(text) {
    const cleanedText = cleanText(text);
    const foundSkills = new Set();

    SKILLS_DATABASE.forEach(skill => {
        const synonyms = SKILL_SYNONYMS[skill] || [skill];
        synonyms.forEach(synonym => {
            const regex = new RegExp('\\b' + synonym.replace(/[.*+?^\$\{}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            if (regex.test(cleanedText)) {
                foundSkills.add(skill);
            }
        });
    });

    return Array.from(foundSkills);
}

// Extract keywords from text
function extractKeywords(text, topN = 20) {
    const cleanedText = cleanText(text);
    const words = cleanedText.split(/\s+/);
    const wordCounts = {};

    words.forEach(word => {
        if (word.length > 3) {
            wordCounts[word] = (wordCounts[word] || 0) + 1;
        }
    });

    return Object.keys(wordCounts)
        .sort((a, b) => wordCounts[b] - wordCounts[a])
        .slice(0, topN);
}

// Helper to count occurrences of a skill
function countSkillOccurrences(text, skill) {
    const synonyms = SKILL_SYNONYMS[skill] || [skill];
    let count = 0;
    const cleanedText = cleanText(text);

    synonyms.forEach(synonym => {
        try {
            const regex = new RegExp('\\b' + synonym.replace(/[.*+?^\$\{}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            const matches = cleanedText.match(regex);
            if (matches) {
                count += matches.length;
            }
        } catch (e) {}
    });
    return count;
}

// Get skill match details with percentages
function getSkillMatchDetails(resumeText, jobDescription) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);
    const skillDetails = [];

    jobSkills.forEach(skill => {
        const isMatched = resumeSkills.includes(skill);
        let percentage = 0;
        if (isMatched) {
            const occurrences = countSkillOccurrences(resumeText, skill);
            percentage = Math.min(70 + occurrences * 10, 100);
        }
        skillDetails.push({
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            percentage: percentage
        });
    });

    if (skillDetails.length === 0) {
        resumeSkills.slice(0, 6).forEach(skill => {
            const occurrences = countSkillOccurrences(resumeText, skill);
            skillDetails.push({
                name: skill.charAt(0).toUpperCase() + skill.slice(1),
                percentage: Math.min(70 + occurrences * 10, 100)
            });
        });
    }

    return skillDetails.slice(0, 8);
}

const { analyzeWithGemini } = require('./geminiService');

// Generate AI analysis
async function generateAnalysis(matchScore, matchedSkills, missingSkills, resumeText, jobDescription) {
    const geminiAnalysis = await analyzeWithGemini(resumeText, jobDescription);
    if (geminiAnalysis) {
        return geminiAnalysis;
    }

    let analysis = '';
    if (matchScore >= 75) {
        analysis = `Excellent match! Candidate possesses ${matchedSkills.length} key required skills. ` +
                   `Strong technical background with skills in ${matchedSkills.slice(0, 3).join(', ')}. ` +
                   `Highly recommended for interview.`;
    } else if (matchScore >= 50) {
        analysis = `Good match. Candidate has ${matchedSkills.length} required skills. ` +
                   `Shows potential with skills in ${matchedSkills.slice(0, 3).join(', ')}. ` +
                   (missingSkills.length > 0 ? `May need training in ${missingSkills.slice(0, 2).join(', ')}. ` : '') +
                   `Recommended for further evaluation.`;
    } else {
        analysis = `Partial match. Candidate has ${matchedSkills.length} matching skills. ` +
                   (matchedSkills.length > 0 ? `Has some relevant skills like ${matchedSkills.slice(0, 2).join(', ')}. ` : '') +
                   `Significant skill gap exists. Personalized learning roadmap is recommended to bridge missing proficiencies.`;
    }

    return analysis;
}

// Generate transparent scoring breakdown
function getTransparentScoring(resumeText, jobDescription) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);
    const resumeKeywords = extractKeywords(resumeText, 30);
    const jobKeywords = extractKeywords(jobDescription, 30);

    const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
    let skillScore = 0;
    let skillDetails = '';

    if (jobSkills.length > 0) {
        skillScore = (matchedSkills.length / jobSkills.length) * 60;
        skillDetails = `${matchedSkills.length} out of ${jobSkills.length} required skills found`;
    } else {
        skillScore = resumeSkills.length > 0 ? 35 : 0;
        skillDetails = `${resumeSkills.length} skills found in resume`;
    }

    const matchedKeywords = resumeKeywords.filter(kw => jobKeywords.includes(kw));
    const keywordScore = jobKeywords.length > 0
        ? (matchedKeywords.length / jobKeywords.length) * 30
        : 15;

    const experienceKeywords = ['year', 'years', 'experience', 'senior', 'lead', 'manager', 'expert', 'intern', 'projects'];
    const experienceCount = experienceKeywords.filter(kw =>
        resumeText.toLowerCase().includes(kw)
    ).length;
    const experienceScore = Math.min(experienceCount * 2, 10);

    const totalScore = Math.round(skillScore + keywordScore + experienceScore);

    return {
        totalScore: Math.min(totalScore, 100),
        breakdown: {
            skillMatch: {
                score: Math.round(skillScore),
                weight: '60%',
                matched: matchedSkills.length,
                required: jobSkills.length,
                details: skillDetails
            },
            keywordMatch: {
                score: Math.round(keywordScore),
                weight: '30%',
                matched: matchedKeywords.length,
                total: jobKeywords.length,
                details: `${matchedKeywords.length} relevant keywords matched`
            },
            experience: {
                score: Math.round(experienceScore),
                weight: '10%',
                indicators: experienceCount,
                details: `${experienceCount} experience indicators found`
            }
        },
        matchedSkills: matchedSkills,
        missingSkills: jobSkills.filter(skill => !resumeSkills.includes(skill)),
        explanation: `Score: Skills (${Math.round(skillScore)}/60) + Keywords (${Math.round(keywordScore)}/30) + Experience (${Math.round(experienceScore)}/10) = ${Math.min(totalScore, 100)}/100`
    };
}

// Extract Education details (Degree, School/University, Year, GPA)
function extractEducation(text) {
    if (!text) return [];
    const educationList = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    let inEduSection = false;
    let eduLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^(education|academic background|academics|qualifications)\b/i.test(line)) {
            inEduSection = true;
            continue;
        }

        if (inEduSection && /^(skills|technical skills|projects|experience|work experience|certifications|awards)\b/i.test(line)) {
            break;
        }

        if (inEduSection) {
            eduLines.push(line);
        }
    }

    const sourceLines = eduLines.length > 0 ? eduLines : lines;
    const degreeRegex = /(bachelor|master|b\.?s\.?|b\.?tech|b\.?e\.?|m\.?s\.?|m\.?tech|ph\.?d|associate|diploma|bca|mca)\b[^\n]*/i;
    const gpaRegex = /(?:gpa|cgpa)[:\s]*([0-9]\.?[0-9]*(?:\s*\/\s*[0-9]\.?[0-9]*)?)/i;
    const yearRegex = /\b(19\d{2}|20\d{2})(?:\s*[-–]\s*(?:19\d{2}|20\d{2}|present|expected|current))?\b/i;

    sourceLines.forEach((line, idx) => {
        const degreeMatch = line.match(degreeRegex);
        if (degreeMatch) {
            let degree = degreeMatch[0].trim().replace(/[|•,-]+$/, '');
            let school = '';
            let year = '';
            let gpa = '';

            if (line.includes('|')) {
                const parts = line.split('|').map(p => p.trim());
                degree = parts[0];
                school = parts[1] || '';
                if (parts[2]) {
                    const yMatch = parts[2].match(yearRegex);
                    if (yMatch) year = yMatch[0];
                }
            }

            for (let offset = -1; offset <= 2; offset++) {
                const checkIdx = idx + offset;
                if (checkIdx >= 0 && checkIdx < sourceLines.length && checkIdx !== idx) {
                    const nearby = sourceLines[checkIdx];
                    if (!school && /(university|institute|college|school|academy)/i.test(nearby)) {
                        school = nearby.replace(/[|•,-]+$/, '').trim();
                    }
                    if (!year) {
                        const yMatch = nearby.match(yearRegex);
                        if (yMatch) year = yMatch[0];
                    }
                    if (!gpa) {
                        const gMatch = nearby.match(gpaRegex);
                        if (gMatch) gpa = gMatch[1];
                    }
                }
            }

            const currentGpaMatch = line.match(gpaRegex);
            if (currentGpaMatch) gpa = currentGpaMatch[1];

            const currentYearMatch = line.match(yearRegex);
            if (!year && currentYearMatch) year = currentYearMatch[0];

            educationList.push({
                degree: degree || 'Higher Education Degree',
                school: school || 'Accredited University / Institute',
                year: year || 'Recent',
                gpa: gpa || ''
            });
        }
    });

    if (educationList.length === 0) {
        const fullMatch = text.match(degreeRegex);
        if (fullMatch) {
            educationList.push({
                degree: fullMatch[0].trim(),
                school: 'Higher Education Institute',
                year: 'Recent',
                gpa: ''
            });
        }
    }

    return educationList.slice(0, 3);
}

// Extract Projects details (Title, Tech Stack, Key Description)
function extractProjects(text) {
    if (!text) return [];
    const projects = [];
    const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    let inProjSection = false;
    let projLines = [];

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (/^(projects|academic projects|personal projects|key projects|featured projects|experience & projects)\b/i.test(line)) {
            inProjSection = true;
            continue;
        }

        if (inProjSection && /^(education|technical skills|skills|certifications|extracurricular|achievements|contact)\b/i.test(line)) {
            break;
        }

        if (inProjSection) {
            projLines.push(line);
        }
    }

    let currentProject = null;

    projLines.forEach(line => {
        const headingMatch = line.match(/^(?:[•\-\*]\s*)?([A-Za-z0-9\s&'\-]+)(?:\(([^)]+)\)|[-–]\s*([A-Za-z0-9\s,\/]+))?/);
        const hasTechParens = /\(([^)]+)\)/.test(line);
        const isNewItem = line.startsWith('•') || line.startsWith('-') || hasTechParens || (line.length < 70 && !line.endsWith('.'));

        if (isNewItem && headingMatch && headingMatch[1].length > 4 && !/^(developed|built|implemented|created|designed|managed|used)\b/i.test(headingMatch[1])) {
            if (currentProject) {
                projects.push(currentProject);
            }

            let title = headingMatch[1].trim();
            let rawTech = '';
            const parensMatch = line.match(/\(([^)]+)\)/);
            if (parensMatch) {
                rawTech = parensMatch[1];
            } else if (headingMatch[3]) {
                rawTech = headingMatch[3];
            }

            const techStack = rawTech
                ? rawTech.split(/[,|\/]/).map(t => t.trim()).filter(Boolean)
                : extractSkills(line);

            currentProject = {
                title: title,
                techStack: techStack.slice(0, 5),
                description: ''
            };
        } else if (currentProject) {
            const cleanDesc = line.replace(/^[•\-\*]\s*/, '').trim();
            if (cleanDesc) {
                currentProject.description += (currentProject.description ? ' ' : '') + cleanDesc;
            }
        }
    });

    if (currentProject) {
        projects.push(currentProject);
    }

    return projects.slice(0, 5);
}

module.exports = {
    parsePDF,
    parseDOCX,
    parseResumeFile,
    cleanText,
    extractSkills,
    extractKeywords,
    extractEducation,
    extractProjects,
    getSkillMatchDetails,
    generateAnalysis,
    getTransparentScoring
};

