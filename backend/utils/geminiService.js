// Gemini AI Service - Handles AI API calls for resume analysis

const { GoogleGenerativeAI } = require("@google/generative-ai");

async function analyzeWithGemini(resumeText, jobDescription) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.warn("Gemini API Key missing. Falling back to rule-based analysis.");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
            You are an expert HR Recruitment AI. Analyze the following resume against the job description.
            
            JOB DESCRIPTION:
            ${jobDescription}
            
            RESUME TEXT:
            ${resumeText}
            
            Provide a concise (2-3 sentences) professional recommendation. 
            Focus on:
            1. Core technical alignment.
            2. Any unique strengths or glaring gaps.
            3. Final verdict (Shortlist/Review/Reject).
            
            Return ONLY the analysis text.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("Gemini Analysis Error:", error);
        return null;
    }
}

async function extractProfileFromResume(resumeText) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.warn("Gemini API Key missing for profile extraction.");
        return null;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        
        const prompt = `You are an expert resume parsing AI. Analyze the following resume text and extract candidate profile information.
Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "fullName": "Candidate's full name",
  "headline": "A professional headline (e.g. Senior Software Engineer)",
  "currentRole": "Current job title and company, or just title",
  "location": "Location or city/country",
  "githubUrl": "Extract GitHub URL if present in resume, otherwise empty string",
  "linkedinUrl": "Extract LinkedIn URL if present in resume, otherwise empty string",
  "summary": "A 2-3 sentence professional summary based on the resume",
  "workExperience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration or dates",
      "description": "Brief description of role or achievements"
    }
  ],
  "certifications": [
    {
      "name": "Certification Name",
      "issuer": "Issuing Organization",
      "date": "Date if available"
    }
  ],
  "education": [
    {
      "degree": "Degree Name",
      "school": "School Name",
      "year": "Year or duration"
    }
  ],
  "skills": ["skill1", "skill2", "skill3"],
  "keyHighlights": [
    "Notable achievement or project 1",
    "Notable achievement or project 2",
    "Notable achievement or project 3"
  ]
}

RESUME TEXT:
${resumeText}`;

        let responseText;
        try {
            console.log('Trying gemini-2.0-flash for resume profile extraction...');
            const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        } catch (err20) {
            console.warn('gemini-2.0-flash failed for resume profile extraction, trying gemini-1.5-flash fallback:', err20.message);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            const result = await model.generateContent(prompt);
            responseText = result.response.text();
        }

        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        return JSON.parse(cleanJson);
    } catch (error) {
        console.error("Gemini Profile Extraction Error:", error);
        return null;
    }
}

module.exports = { analyzeWithGemini, extractProfileFromResume };
