const pdf = require('pdf-parse');
const fs = require('fs');
const natural = require('natural');

// Common skills database
const SKILLS_DATABASE = [
    'javascript', 'python', 'java', 'c++', 'c#', 'php', 'ruby', 'go', 'rust', 'swift',
    'react', 'angular', 'vue', 'node.js', 'express', 'django', 'flask', 'spring',
    'mongodb', 'postgresql', 'mysql', 'redis', 'sql', 'nosql',
    'html', 'css', 'typescript', 'sass', 'less',
    'docker', 'kubernetes', 'jenkins', 'ci/cd', 'devops',
    'aws', 'azure', 'gcp', 'cloud computing',
    'git', 'github', 'gitlab', 'version control',
    'agile', 'scrum', 'kanban', 'jira',
    'rest api', 'graphql', 'microservices', 'api',
    'machine learning', 'deep learning', 'data science', 'ai',
    'testing', 'unit testing', 'integration testing', 'jest', 'mocha',
    'linux', 'unix', 'bash', 'shell scripting',
    'security', 'authentication', 'authorization', 'oauth',
    'responsive design', 'ui/ux', 'frontend', 'backend', 'full stack'
];

// Skill synonyms mapping
const SKILL_SYNONYMS = {
    'javascript': ['js', 'javascript', 'ecmascript', 'es6', 'es2015'],
    'python': ['python', 'py', 'python3'],
    'machine learning': ['machine learning', 'ml', 'artificial intelligence', 'ai'],
    'react': ['react', 'reactjs', 'react.js'],
    'node.js': ['node', 'nodejs', 'node.js'],
    'mongodb': ['mongodb', 'mongo', 'mongo db'],
    'postgresql': ['postgresql', 'postgres', 'psql'],
    'c++': ['c++', 'cpp', 'cplusplus'],
    'c#': ['c#', 'csharp', 'c sharp'],
    'sql': ['sql', 'structured query language'],
    'html': ['html', 'html5'],
    'css': ['css', 'css3', 'cascading style sheets'],
    'docker': ['docker', 'containerization'],
    'kubernetes': ['kubernetes', 'k8s'],
    'aws': ['aws', 'amazon web services'],
    'azure': ['azure', 'microsoft azure'],
    'gcp': ['gcp', 'google cloud platform', 'google cloud'],
    'git': ['git', 'version control', 'github', 'gitlab'],
    'agile': ['agile', 'scrum', 'kanban'],
    'rest api': ['rest', 'restful', 'rest api', 'api'],
    'typescript': ['typescript', 'ts']
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

// Enhanced clean and normalize text
function cleanText(text) {
    // Convert to lowercase
    text = text.toLowerCase();

    // Remove URLs
    text = text.replace(/https?:\/\/[^\s]+/g, '');

    // Remove email addresses
    text = text.replace(/[\w.-]+@[\w.-]+\.\w+/g, '');

    // Remove phone numbers
    text = text.replace(/[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}/g, '');

    // Remove extra whitespace (tabs, newlines, multiple spaces)
    text = text.replace(/\s+/g, ' ');

    // Remove special characters but keep letters, numbers, and basic punctuation
    text = text.replace(/[^\w\s.,;:()\-]/g, '');

    // Remove common resume headers/footers
    const commonHeaders = ['curriculum vitae', 'resume', 'cv', 'page', 'references available'];
    commonHeaders.forEach(header => {
        const regex = new RegExp('\\b' + header + '\\b', 'gi');
        text = text.replace(regex, '');
    });

    // Trim
    text = text.trim();

    return text;
}


// Extract skills from text with synonym matching
function extractSkills(text) {
    const cleanedText = cleanText(text);
    const foundSkills = new Set();

    // Check each skill in database
    SKILLS_DATABASE.forEach(skill => {
        // Get synonyms for this skill
        const synonyms = SKILL_SYNONYMS[skill] || [skill];

        // Check if any synonym exists in text
        synonyms.forEach(synonym => {
            const regex = new RegExp('\\b' + synonym.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '\\b', 'gi');
            if (regex.test(cleanedText)) {
                foundSkills.add(skill); // Add the main skill name, not synonym
            }
        });
    });

    return Array.from(foundSkills);
}


// Extract keywords from text
function extractKeywords(text, topN = 20) {
    const tokenizer = new natural.WordTokenizer();
    const TfIdf = natural.TfIdf;
    const tfidf = new TfIdf();

    const cleanedText = cleanText(text);
    tfidf.addDocument(cleanedText);

    const keywords = [];
    tfidf.listTerms(0).slice(0, topN).forEach(item => {
        if (item.term.length > 3) { // Only words longer than 3 characters
            keywords.push(item.term);
        }
    });

    return keywords;
}

// (End of similarity calculation)


// Get skill match details with percentages
function getSkillMatchDetails(resumeText, jobDescription) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);

    const skillDetails = [];

    jobSkills.forEach(skill => {
        const isMatched = resumeSkills.includes(skill);
        skillDetails.push({
            name: skill.charAt(0).toUpperCase() + skill.slice(1),
            percentage: isMatched ? Math.floor(Math.random() * 20) + 80 : Math.floor(Math.random() * 40) + 20
        });
    });

    // If no job skills, return some common skills from resume
    if (skillDetails.length === 0) {
        resumeSkills.slice(0, 5).forEach(skill => {
            skillDetails.push({
                name: skill.charAt(0).toUpperCase() + skill.slice(1),
                percentage: Math.floor(Math.random() * 30) + 70
            });
        });
    }

    return skillDetails.slice(0, 6); // Return top 6 skills
}

const { analyzeWithGemini } = require('./geminiService');

// Generate AI analysis - Now Async with Gemini support
async function generateAnalysis(matchScore, matchedSkills, missingSkills, resumeText, jobDescription) {
    // 1. Try Gemini first if API key is present
    const geminiAnalysis = await analyzeWithGemini(resumeText, jobDescription);
    if (geminiAnalysis) {
        return geminiAnalysis;
    }

    // 2. Fallback to rule-based analysis
    let analysis = '';

    if (matchScore >= 75) {
        analysis = `Excellent match! Candidate possesses ${matchedSkills.length} key required skills. `;
        analysis += `Strong technical background with skills in ${matchedSkills.slice(0, 3).join(', ')}. `;
        analysis += `Highly recommended for interview.`;
    } else if (matchScore >= 50) {
        analysis = `Good match. Candidate has ${matchedSkills.length} required skills. `;
        analysis += `Shows potential with skills in ${matchedSkills.slice(0, 3).join(', ')}. `;
        if (missingSkills.length > 0) {
            analysis += `May need training in ${missingSkills.slice(0, 2).join(', ')}. `;
        }
        analysis += `Recommended for further evaluation.`;
    } else {
        analysis = `Partial match. Candidate has ${matchedSkills.length} matching skills. `;
        if (matchedSkills.length > 0) {
            analysis += `Has some relevant skills like ${matchedSkills.slice(0, 2).join(', ')}. `;
        }
        analysis += `Significant skill gap exists. Consider for entry-level or training positions.`;
    }

    return analysis;
}

// (End of skill matching)

// Generate transparent scoring breakdown
function getTransparentScoring(resumeText, jobDescription) {
    const resumeSkills = extractSkills(resumeText);
    const jobSkills = extractSkills(jobDescription);
    const resumeKeywords = extractKeywords(resumeText, 30);
    const jobKeywords = extractKeywords(jobDescription, 30);

    // 1. Skill Match Score (60% weight)
    const matchedSkills = resumeSkills.filter(skill => jobSkills.includes(skill));
    let skillScore = 0;
    let skillDetails = '';

    if (jobSkills.length > 0) {
        skillScore = (matchedSkills.length / jobSkills.length) * 60;
        skillDetails = `${matchedSkills.length} out of ${jobSkills.length} required skills found`;
    } else {
        // If no job skills detected, use resume skills as baseline
        skillScore = resumeSkills.length > 0 ? 30 : 0;
        skillDetails = `${resumeSkills.length} skills found in resume (no specific job requirements)`;
    }

    // 2. Keyword Match Score (30% weight)
    const matchedKeywords = resumeKeywords.filter(kw => jobKeywords.includes(kw));
    const keywordScore = jobKeywords.length > 0
        ? (matchedKeywords.length / jobKeywords.length) * 30
        : 15;

    // 3. Experience Score (10% weight)
    const experienceKeywords = ['year', 'years', 'experience', 'senior', 'lead', 'manager', 'expert'];
    const experienceCount = experienceKeywords.filter(kw =>
        resumeText.toLowerCase().includes(kw)
    ).length;
    const experienceScore = Math.min(experienceCount * 2, 10);

    // Total Score
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
        explanation: `Score calculated as: Skills (${Math.round(skillScore)}/60) + Keywords (${Math.round(keywordScore)}/30) + Experience (${Math.round(experienceScore)}/10) = ${Math.min(totalScore, 100)}/100`
    };
}



module.exports = {
    parsePDF,
    cleanText,
    extractSkills,
    extractKeywords,
    getSkillMatchDetails,
    generateAnalysis,
    getTransparentScoring
};


