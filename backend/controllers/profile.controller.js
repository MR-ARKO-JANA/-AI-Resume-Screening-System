const { GoogleGenerativeAI } = require('@google/generative-ai');

// ================================
// GitHub Profile Lookup
// ================================
exports.getGitHubProfile = async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) return res.status(400).json({ error: 'GitHub username is required' });

        const headers = { 'User-Agent': 'AI-Resume-Screener', 'Accept': 'application/vnd.github.v3+json' };
        if (process.env.GITHUB_TOKEN) {
            headers['Authorization'] = `token ${process.env.GITHUB_TOKEN}`;
        }

        // Fetch user profile, repos, and events in parallel
        const [userRes, reposRes, eventsRes] = await Promise.all([
            fetch(`https://api.github.com/users/${username}`, { headers }),
            fetch(`https://api.github.com/users/${username}/repos?sort=stars&per_page=100&direction=desc`, { headers }),
            fetch(`https://api.github.com/users/${username}/events/public?per_page=30`, { headers })
        ]);

        if (!userRes.ok) {
            return res.status(404).json({ error: 'GitHub user not found' });
        }

        const user = await userRes.json();
        const repos = await reposRes.json();
        const events = await eventsRes.json();

        // Top 5 projects by stars + forks
        const topProjects = (Array.isArray(repos) ? repos : [])
            .filter(r => !r.fork)
            .sort((a, b) => (b.stargazers_count + b.forks_count) - (a.stargazers_count + a.forks_count))
            .slice(0, 5)
            .map(r => ({
                name: r.name,
                description: r.description || 'No description',
                stars: r.stargazers_count,
                forks: r.forks_count,
                language: r.language || 'Unknown',
                url: r.html_url,
                updatedAt: r.updated_at
            }));

        // Language distribution
        const langMap = {};
        (Array.isArray(repos) ? repos : []).filter(r => !r.fork && r.language).forEach(r => {
            langMap[r.language] = (langMap[r.language] || 0) + 1;
        });
        const languages = Object.entries(langMap)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 8)
            .map(([name, count]) => ({ name, count }));

        // Commit activity from events (last 30 public events)
        const commitActivity = {};
        const now = new Date();
        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            commitActivity[key] = 0;
        }

        // Count push events per month
        (Array.isArray(events) ? events : []).forEach(e => {
            if (e.type === 'PushEvent') {
                const date = new Date(e.created_at);
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (commitActivity.hasOwnProperty(key)) {
                    commitActivity[key] += (e.payload?.commits?.length || 1);
                }
            }
        });

        // Recent activity timeline
        const recentActivity = (Array.isArray(events) ? events : [])
            .slice(0, 10)
            .map(e => ({
                type: e.type,
                repo: e.repo?.name || '',
                date: e.created_at,
                message: getEventMessage(e)
            }));

        // Total stars across all repos
        const totalStars = (Array.isArray(repos) ? repos : [])
            .reduce((sum, r) => sum + (r.stargazers_count || 0), 0);

        res.json({
            profile: {
                name: user.name || user.login,
                login: user.login,
                avatar: user.avatar_url,
                bio: user.bio || '',
                location: user.location || '',
                company: user.company || '',
                blog: user.blog || '',
                publicRepos: user.public_repos,
                followers: user.followers,
                following: user.following,
                createdAt: user.created_at,
                profileUrl: user.html_url
            },
            totalStars,
            topProjects,
            languages,
            commitActivity,
            recentActivity
        });

    } catch (error) {
        console.error('GitHub profile error:', error);
        res.status(500).json({ error: error.message });
    }
};

// Helper to get human-readable event messages
function getEventMessage(event) {
    switch (event.type) {
        case 'PushEvent':
            const commits = event.payload?.commits?.length || 0;
            return `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${event.repo?.name}`;
        case 'CreateEvent':
            return `Created ${event.payload?.ref_type} ${event.payload?.ref || ''} in ${event.repo?.name}`;
        case 'PullRequestEvent':
            return `${event.payload?.action} pull request in ${event.repo?.name}`;
        case 'IssuesEvent':
            return `${event.payload?.action} issue in ${event.repo?.name}`;
        case 'WatchEvent':
            return `Starred ${event.repo?.name}`;
        case 'ForkEvent':
            return `Forked ${event.repo?.name}`;
        case 'IssueCommentEvent':
            return `Commented on issue in ${event.repo?.name}`;
        case 'DeleteEvent':
            return `Deleted ${event.payload?.ref_type} in ${event.repo?.name}`;
        default:
            return `${event.type.replace('Event', '')} on ${event.repo?.name}`;
    }
}

// ================================
// LinkedIn Text Analysis via Gemini AI
// ================================
exports.analyzeLinkedIn = async (req, res) => {
    try {
        const { linkedinText } = req.body;
        if (!linkedinText || linkedinText.trim().length < 50) {
            return res.status(400).json({ error: 'Please paste more LinkedIn profile content (at least 50 characters)' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: 'Gemini API key not configured' });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

        const prompt = `Analyze this LinkedIn profile text and extract structured information. Return ONLY valid JSON (no markdown, no code blocks) in this exact format:
{
  "fullName": "Person's full name",
  "headline": "Their professional headline",
  "currentRole": "Current job title and company",
  "location": "Their location",
  "summary": "A 2-3 sentence professional summary",
  "workExperience": [
    {
      "title": "Job Title",
      "company": "Company Name",
      "duration": "Duration or dates",
      "description": "Brief description of role"
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
    "Notable achievement or point 1",
    "Notable achievement or point 2",
    "Notable achievement or point 3"
  ]
}

LinkedIn Profile Text:
${linkedinText}`;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        // Clean the response - remove markdown code blocks if present
        let cleanJson = responseText.trim();
        if (cleanJson.startsWith('```')) {
            cleanJson = cleanJson.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
        }

        const parsed = JSON.parse(cleanJson);
        res.json({ linkedinData: parsed });

    } catch (error) {
        console.error('LinkedIn analysis error:', error);
        if (error instanceof SyntaxError) {
            res.status(500).json({ error: 'Failed to parse AI response. Please try again.' });
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
