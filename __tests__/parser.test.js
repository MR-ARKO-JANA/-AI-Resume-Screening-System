const resumeParser = require('../backend/utils/resumeParser');

describe('Resume Parser & NLP Algorithm Tests', () => {

    describe('cleanText function', () => {
        it('should lowercase text and remove special characters', () => {
            const rawText = 'Hello! This is a TEST email@domain.com and +1-800-123-4567';
            const clean = resumeParser.cleanText(rawText);
            
            // Should be lowercased
            expect(clean).toBe(clean.toLowerCase());
            // Should not contain emails
            expect(clean).not.toMatch(/email@domain.com/);
            // Should not contain phone numbers
            expect(clean).not.toMatch(/1-800-123-4567/);
        });

        it('should remove resume headers', () => {
            const rawText = 'Curriculum Vitae\nJohn Doe Resume\nSkills:\nJavaScript';
            const clean = resumeParser.cleanText(rawText);
            
            expect(clean).not.toMatch(/curriculum vitae/);
            expect(clean).not.toMatch(/\bresume\b/);
            expect(clean).toMatch(/javascript/);
        });
    });

    describe('extractSkills function', () => {
        it('should correctly identify exact skill matches', () => {
            const text = 'I am proficient in JavaScript, node.js, and MongoDB.';
            const skills = resumeParser.extractSkills(text);
            
            expect(skills).toContain('javascript');
            expect(skills).toContain('node.js');
            expect(skills).toContain('mongodb');
        });

        it('should correctly identify skill synonyms', () => {
            // "js", "react.js", "postgres"
            const text = 'I write js and react.js connected to a postgres database.';
            const skills = resumeParser.extractSkills(text);
            
            expect(skills).toContain('javascript');
            expect(skills).toContain('react');
            expect(skills).toContain('postgresql');
        });

        it('should not false positive on partial words', () => {
            // "jason" contains "js" if we aren't using boundaries, "automation" contains "auto"
            const text = 'My friend Jason works in automation.';
            const skills = resumeParser.extractSkills(text);
            
            expect(skills).not.toContain('javascript');
        });
    });

    describe('Scoring Algorithm (getTransparentScoring)', () => {
        const jobDesc = 'Looking for a Senior Software Engineer with 5 years experience in JavaScript, React, Node.js, and MongoDB. Must know Agile and Git.';
        
        it('should yield a high score for a closely matched resume', () => {
            const resumeText = 'Senior Full Stack Developer. 6 years experience. Skills: JavaScript, React, Node.js, Express, MongoDB, Git, Agile methodology. I am great at software engineering.';
            
            const result = resumeParser.getTransparentScoring(resumeText, jobDesc);
            
            expect(result.totalScore).toBeGreaterThan(80);
            expect(result.breakdown.skillMatch.matched).toBeGreaterThanOrEqual(6);
            expect(result.matchedSkills).toContain('javascript');
            expect(result.matchedSkills).toContain('react');
        });

        it('should yield a low score for a totally irrelevant resume', () => {
            const resumeText = 'Marketing Manager with 2 years of experience. Expert in SEO, content creation, social media, and Google Analytics.';
            
            const result = resumeParser.getTransparentScoring(resumeText, jobDesc);
            
            expect(result.totalScore).toBeLessThan(40);
            expect(result.matchedSkills.length).toBe(0);
        });

        it('should identify missing skills', () => {
            const resumeText = 'Junior developer knowing JavaScript and React.';
            const jobReq = 'Requirements: JavaScript, React, Docker, Kubernetes';
            
            const result = resumeParser.getTransparentScoring(resumeText, jobReq);
            
            expect(result.missingSkills).toContain('docker');
            expect(result.missingSkills).toContain('kubernetes');
            expect(result.matchedSkills).toContain('javascript');
            expect(result.matchedSkills).toContain('react');
        });
    });
});
