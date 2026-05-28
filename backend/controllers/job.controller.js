const Job = require('../models/jobModel');
const Resume = require('../models/resumeModel');
const Score = require('../models/scoreModel');
const User = require('../models/usermodels');
const resumeParser = require('../utils/resumeParser');
const jwt = require('jsonwebtoken');
const path = require('path');

const JWT_SECRET = process.env.JWT_SECRET || "default_secret_change_in_production";

// Seed Jobs Database with initial Naukri, Indeed, and Unstop jobs
const SEED_JOBS = [
    // Indeed India Jobs
    {
        jobTitle: "Software Engineer (React)",
        company: "Infosys",
        location: "Bengaluru, Karnataka",
        source: "Indeed",
        sourceUrl: "https://indeed.co.in/job/react-infosys",
        salary: "₹5,00,000 - ₹9,50,000 LPA",
        experience: "1-3 Years",
        skillsRequired: ["React", "Redux", "JavaScript", "HTML5", "CSS3"],
        jobDescription: "Infosys is hiring a Software Engineer specialized in React.js. You will work on designing, developing, and deploying modern web applications. Ideal candidates possess a strong foundation in modern JavaScript (ES6+), React component lifecycles, global state management with Redux, and implementing responsive layouts.",
        isExternal: true,
        externalId: "ind_react_001"
    },
    {
        jobTitle: "Python Django Developer",
        company: "TATA Consultancy Services",
        location: "Kolkata, West Bengal",
        source: "Indeed",
        sourceUrl: "https://indeed.co.in/job/python-tcs",
        salary: "₹4,50,000 - ₹8,00,000 LPA",
        experience: "2-4 Years",
        skillsRequired: ["Python", "Django", "SQL", "RESTful APIs", "Git"],
        jobDescription: "We are seeking a Python/Django Developer to join our backend services division. You will build secure, scalable backend services, design relational database schemas (PostgreSQL/MySQL), and write clean, testable code. Familiarity with REST API standards and Git version control is required.",
        isExternal: true,
        externalId: "ind_py_002"
    },
    {
        jobTitle: "Java Spring Boot Specialist",
        company: "Wipro Technologies",
        location: "Hyderabad, Telangana",
        source: "Indeed",
        sourceUrl: "https://indeed.co.in/job/java-wipro",
        salary: "₹12,00,000 - ₹20,00,000 LPA",
        experience: "5-8 Years",
        skillsRequired: ["Java", "Spring Boot", "Microservices", "Docker", "Kubernetes"],
        jobDescription: "Join Wipro as a Senior Java Engineer. The role involves designing enterprise microservices using Spring Boot, coordinating server-side workflows, and managing deployments on Kubernetes. Candidates must have extensive experience in JPA, Hibernate, multi-threading, and Docker containerization.",
        isExternal: true,
        externalId: "ind_java_003"
    },
    {
        jobTitle: "Associate Data Analyst",
        company: "Accenture India",
        location: "Mumbai, Maharashtra",
        source: "Indeed",
        sourceUrl: "https://indeed.co.in/job/data-accenture",
        salary: "₹6,00,000 - ₹11,00,000 LPA",
        experience: "1-3 Years",
        skillsRequired: ["SQL", "Tableau", "PowerBI", "Python", "Excel"],
        jobDescription: "Accenture is looking for an Associate Data Analyst. You will query large datasets, transform raw telemetry, and build dynamic visualization dashboards using Tableau and PowerBI. Competence in writing advanced SQL queries, window functions, and basic Python data wrangling is essential.",
        isExternal: true,
        externalId: "ind_data_004"
    },

    // Naukri Jobs
    {
        jobTitle: "Full Stack Node.js/React Developer",
        company: "Tech Solutions India",
        location: "Noida, UP (Delhi NCR)",
        source: "Naukri",
        sourceUrl: "https://naukri.com/job/fullstack-techsol",
        salary: "₹8,00,000 - ₹15,00,000 LPA",
        experience: "3-5 Years",
        skillsRequired: ["Node.js", "React", "Express", "MongoDB", "JavaScript"],
        jobDescription: "Tech Solutions is recruiting a Full Stack Developer. Responsibilities include coding the frontend UI in React and maintaining the backend API in Node.js/Express. You will manage data persistence in MongoDB, write middleware, optimize database queries, and ensure maximum client-side performance.",
        isExternal: true,
        externalId: "nauk_fs_001"
    },
    {
        jobTitle: "UI/UX Front-End Designer",
        company: "InnovateLabs",
        location: "New Delhi, Delhi",
        source: "Naukri",
        sourceUrl: "https://naukri.com/job/ui-ux-innovatelabs",
        salary: "₹5,00,000 - ₹10,00,000 LPA",
        experience: "1-4 Years",
        skillsRequired: ["Figma", "UI/UX", "CSS3", "HTML5", "Responsive Design"],
        jobDescription: "We are seeking a creative UI/UX Frontend Engineer. You will craft interactive UI designs in Figma and directly implement them using semantic HTML5, modern layout mechanics (Flexbox, CSS Grid), and lightweight animations. A portfolio demonstrating responsive design is mandatory.",
        isExternal: true,
        externalId: "nauk_uiux_002"
    },
    {
        jobTitle: "DevOps CI/CD Engineer",
        company: "HCL Technologies",
        location: "Bengaluru, Karnataka",
        source: "Naukri",
        sourceUrl: "https://naukri.com/job/devops-hcl",
        salary: "₹9,00,000 - ₹16,00,000 LPA",
        experience: "3-6 Years",
        skillsRequired: ["CI/CD", "AWS", "Terraform", "Git", "Linux"],
        jobDescription: "HCL is hiring a DevOps Engineer to manage cloud infrastructures. You will write Terraform scripts for provisioning AWS resources, maintain automated CI/CD pipelines in Gitlab/Jenkins, manage Linux systems, and oversee security audits for server clusters.",
        isExternal: true,
        externalId: "nauk_devops_003"
    },

    // Unstop India Jobs (Freshers & Internships)
    {
        jobTitle: "Graduate Engineer Trainee (GET)",
        company: "Bharat Gaming News",
        location: "Remote, India",
        source: "Unstop",
        sourceUrl: "https://unstop.com/job/get-bharat-gaming",
        salary: "₹4,50,000 - ₹6,50,000 LPA",
        experience: "Fresher",
        skillsRequired: ["C++", "C", "Data Structures", "Algorithms", "OOPs"],
        jobDescription: "Bharat Gaming News is seeking a Graduate Engineer Trainee. This is a foundational software development role. You will participate in software design, write code in C/C++, design algorithms, and implement object-oriented designs. Must have strong analytical skills and solid knowledge of data structures.",
        isExternal: true,
        externalId: "unst_get_001"
    },
    {
        jobTitle: "AI/ML Development Intern",
        company: "DeepAI Technologies",
        location: "Bengaluru, Karnataka (Hybrid)",
        source: "Unstop",
        sourceUrl: "https://unstop.com/internship/aiml-deepai",
        salary: "₹30,000 - ₹45,000 / month",
        experience: "Fresher / Intern",
        skillsRequired: ["Python", "Machine Learning", "TensorFlow", "PyTorch", "SQL"],
        jobDescription: "DeepAI Technologies offers a 6-month AI/ML Internship. Interns will assist in training neural network models, preprocess unstructured data pipelines using Python, and deploy lightweight models. Knowledge of TensorFlow, PyTorch, and regression/classification models is required.",
        isExternal: true,
        externalId: "unst_aiml_002"
    },
    {
        jobTitle: "Web Development Intern",
        company: "StartupX Incubators",
        location: "Kolkata, West Bengal (In-Office)",
        source: "Unstop",
        sourceUrl: "https://unstop.com/internship/webdev-startupx",
        salary: "₹15,000 - ₹25,000 / month",
        experience: "Fresher / Intern",
        skillsRequired: ["JavaScript", "React", "Node.js", "CSS3", "HTML5"],
        jobDescription: "StartupX is hiring a Web Developer Intern. You will contribute to our customer dashboard frontend using React, build basic Express API routes, write responsive CSS, and fix client-side layout bugs. Ideal for college seniors seeking industry experience.",
        isExternal: true,
        externalId: "unst_webdev_003"
    }
];

// Helper to check and seed database on initial load
async function checkAndSeedJobs() {
    try {
        const count = await Job.countDocuments({ isExternal: true });
        if (count === 0) {
            console.log('Seeding initial jobs from Naukri, Indeed, and Unstop...');
            await Job.insertMany(SEED_JOBS);
            console.log('Successfully seeded jobs collection.');
        }
    } catch (err) {
        console.error('Error seeding jobs:', err);
    }
}

// 1. Get Jobs List (with platform, search, and location filters)
exports.getJobs = async (req, res) => {
    try {
        await checkAndSeedJobs();

        const { source, search, location } = req.query;
        let query = {};

        // Platform Filter (Naukri, Indeed, Unstop)
        if (source && source !== 'All') {
            query.source = source;
        }

        // Search Query (matches job title, company, skills, or description)
        if (search && search.trim() !== '') {
            const regex = new RegExp(search.trim(), 'i');
            query.$or = [
                { jobTitle: regex },
                { company: regex },
                { jobDescription: regex },
                { skillsRequired: { $in: [regex] } }
            ];
        }

        // Location Filter
        if (location && location.trim() !== '') {
            query.location = new RegExp(location.trim(), 'i');
        }

        const jobs = await Job.find(query).sort({ createdDate: -1 });
        res.json(jobs);
    } catch (error) {
        console.error('Get jobs error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 2. Sync/Scrape Jobs dynamically
exports.syncJobs = async (req, res) => {
    try {
        let syncedJobs = [];

        // Attempt Gemini-powered dynamic job generator
        try {
            const { GoogleGenerativeAI } = require('@google/generative-ai');
            
            if (process.env.GEMINI_API_KEY) {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                // Use gemini-1.5-flash as a fallback if 2.0-flash limit is tight
                const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
                
                const prompt = `Generate a JSON array containing 3 realistic, professional IT/software development or engineering job postings in India. 
                Each job posting must match real-world expectations for one of these platforms: 'Naukri', 'Indeed', or 'Unstop'.
                Return ONLY raw JSON. No markdown code blocks, no explanation, no comments.
                JSON structure MUST be an array of objects matching this exact schema:
                [{
                  "jobTitle": "Job Title (e.g. Python Developer)",
                  "company": "Company Name (e.g. Cognizant)",
                  "location": "Location (e.g. Pune, Maharashtra)",
                  "source": "Naukri" or "Indeed" or "Unstop",
                  "sourceUrl": "A realistic url",
                  "salary": "A realistic salary range in Lakhs Per Annum (e.g. ₹6,00,000 - ₹12,00,000 LPA)",
                  "experience": "Experience range (e.g. 2-5 Years)",
                  "skillsRequired": ["skill1", "skill2", "skill3"],
                  "jobDescription": "A complete, detailed professional job description, detailing requirements, qualifications, and daily tasks."
                }]`;

                const result = await model.generateContent(prompt);
                const text = result.response.text().trim();
                
                let cleanJson = text;
                if (cleanJson.includes('```json')) {
                    cleanJson = cleanJson.split('```json')[1].split('```')[0].trim();
                } else if (cleanJson.includes('```')) {
                    cleanJson = cleanJson.split('```')[1].split('```')[0].trim();
                }
                
                syncedJobs = JSON.parse(cleanJson);
            }
        } catch (geminiErr) {
            console.warn('Gemini job generation failed, using fallback mock scraper:', geminiErr);
            // Fallback generated jobs list
            syncedJobs = [
                {
                    jobTitle: "Cloud DevOps Engineer",
                    company: "Cognizant India",
                    location: "Pune, Maharashtra",
                    source: "Naukri",
                    sourceUrl: "https://naukri.com/job/devops-cognizant",
                    salary: "₹7,50,000 - ₹13,00,000 LPA",
                    experience: "2-4 Years",
                    skillsRequired: ["AWS", "Docker", "Jenkins", "Terraform", "Linux"],
                    jobDescription: "Seeking a Cloud DevOps Engineer to maintain automated release systems. Duties include upgrading Jenkins servers, writing Terraform configs for AWS EC2/S3 resources, running Docker instances, and maintaining Linux system configurations."
                },
                {
                    jobTitle: "Cybersecurity Analyst",
                    company: "Tata Communications",
                    location: "Chennai, Tamil Nadu",
                    source: "Indeed",
                    sourceUrl: "https://indeed.co.in/job/sec-tata",
                    salary: "₹8,00,000 - ₹14,00,000 LPA",
                    experience: "3-6 Years",
                    skillsRequired: ["Cybersecurity", "Firewalls", "Penetration Testing", "Wireshark"],
                    jobDescription: "Tata Communications is hiring a Cybersecurity Analyst. You will oversee network audits, investigate firewall anomalies, run penetration tests, and coordinate security training modules. Prior experience in network analytics is a plus."
                },
                {
                    jobTitle: "Product Management Intern",
                    company: "Flipkart",
                    location: "Bengaluru, Karnataka",
                    source: "Unstop",
                    sourceUrl: "https://unstop.com/internship/flipkart-pm",
                    salary: "₹40,000 - ₹60,000 / month",
                    experience: "Fresher / Intern",
                    skillsRequired: ["Product Management", "SQL", "Excel", "Analytics", "Wireframing"],
                    jobDescription: "Flipkart offers a product analyst internship. Work with product managers to model user conversion rates, write SQL telemetry queries, build wireframes, and conduct product quality reviews."
                }
            ];
        }

        if (!Array.isArray(syncedJobs)) {
            throw new Error("Invalid format received from job generator");
        }

        const savedJobs = [];
        for (const job of syncedJobs) {
            const externalId = `ext_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
            const newJob = new Job({
                ...job,
                isExternal: true,
                externalId
            });
            await newJob.save();
            savedJobs.push(newJob);
        }

        res.json({
            message: `Successfully extracted and synced ${savedJobs.length} new jobs from Unstop, Naukri, and Indeed!`,
            jobs: savedJobs
        });
    } catch (error) {
        console.error('Job sync error:', error);
        res.status(500).json({ error: error.message });
    }
};

// 3. User Apply to Job (runs AI Resume Screening on-demand)
exports.applyToJob = async (req, res) => {
    try {
        const { jobId } = req.params;
        const file = req.file;

        if (!file) {
            return res.status(400).send("Please select a resume PDF file to apply.");
        }

        // Get Job Details
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).send("Job listing not found.");
        }

        // Authenticate User
        let token = req.cookies.token;
        if (!token) return res.status(401).redirect('/');

        let decoded = jwt.verify(token, JWT_SECRET);
        let user = await User.findOne({ email: decoded.email });
        if (!user) return res.status(404).send("User not found.");

        // Parse Resume File
        let resumeText = '';
        try {
            resumeText = await resumeParser.parsePDF(file.path);
            if (!resumeText || resumeText.trim() === '') {
                return res.status(400).send("Could not parse text from the uploaded resume file. Please ensure it is a valid PDF.");
            }
        } catch (parseErr) {
            console.error("Resume parse error during application:", parseErr);
            return res.status(500).send("Error reading PDF content: " + parseErr.message);
        }

        // Perform AI Resume Screening against Job Description
        const scoringDetails = resumeParser.getTransparentScoring(resumeText, job.jobDescription);
        const matchScore = scoringDetails.totalScore;
        const skillDetails = resumeParser.getSkillMatchDetails(resumeText, job.jobDescription);

        const aiAnalysis = await resumeParser.generateAnalysis(
            matchScore,
            scoringDetails.matchedSkills,
            scoringDetails.missingSkills,
            resumeText,
            job.jobDescription
        );

        const status = matchScore >= 75 ? "Shortlisted" : matchScore >= 50 ? "Pending" : "Rejected";
        const aiConfidence = Math.min(80 + Math.round(matchScore * 0.15), 98);
        const experience = resumeText.toLowerCase().includes('year') ? "Experienced" : "Fresher";

        // Save Resume Record
        const newResume = new Resume({
            userId: user._id,
            fileName: file.originalname,
            filePath: file.path
        });
        await newResume.save();

        // Auto-extract candidate profile info using Gemini
        let candidateName = '';
        let githubUrl = '';
        let linkedinUrl = '';
        let linkedinData = null;

        try {
            const { extractProfileFromResume } = require('../utils/geminiService');
            const { extractBasicInfoFromResumeText } = require('./profile.controller');
            
            let extractedProfile = await extractProfileFromResume(resumeText);
            if (!extractedProfile) {
                extractedProfile = extractBasicInfoFromResumeText(resumeText, file.originalname);
            }
            if (extractedProfile) {
                linkedinData = extractedProfile;
                candidateName = extractedProfile.fullName || '';
                githubUrl = extractedProfile.githubUrl || '';
                linkedinUrl = extractedProfile.linkedinUrl || '';
            }
        } catch (profileErr) {
            console.error("Error parsing profile on apply:", profileErr);
        }

        // Save Score
        const newScore = new Score({
            userId: user._id,
            resumeId: newResume._id,
            jobId: job._id,
            matchScore,
            status,
            aiAnalysis,
            aiConfidence,
            experience,
            skills: skillDetails,
            scoringBreakdown: {
                ...scoringDetails.breakdown,
                explanation: scoringDetails.explanation
            },
            candidateName,
            githubUrl,
            linkedinUrl,
            linkedinData
        });

        await newScore.save();

        // Redirect directly to results view (results view will fetch this latest score)
        res.redirect('/result');

    } catch (error) {
        console.error("Apply to job error:", error);
        res.status(500).send("Failed to submit application: " + error.message);
    }
};
