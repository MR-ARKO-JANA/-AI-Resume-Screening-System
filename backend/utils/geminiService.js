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

module.exports = { analyzeWithGemini };
