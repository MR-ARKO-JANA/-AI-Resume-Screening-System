// EdTech Career & Learning Roadmap Engine
// Powers Skill Gap Analysis, Time-Bound Learning Roadmaps, Resume Improvements, and Mock Prep

const ROLE_CATALOG = {
    'frontend-developer': {
        title: 'Frontend Developer',
        category: 'Web Development',
        description: 'Builds interactive, performant, and accessible user interfaces and web applications.',
        requiredSkills: [
            'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'React', 'Next.js', 
            'Tailwind CSS', 'Redux', 'REST APIs', 'Git', 'Responsive Design', 'Jest'
        ],
        recommendedKeywords: [
            'React Hooks', 'Component Architecture', 'Client-side Routing', 'State Management',
            'Cross-browser Compatibility', 'Web Performance Optimization', 'Semantic HTML', 'Accessibility (a11y)'
        ]
    },
    'backend-developer': {
        title: 'Backend Developer',
        category: 'Software Engineering',
        description: 'Architects scalable APIs, business logic, microservices, and database systems.',
        requiredSkills: [
            'Node.js', 'Express', 'Python', 'FastAPI', 'PostgreSQL', 
            'MongoDB', 'Redis', 'REST APIs', 'GraphQL', 'Docker', 'Authentication', 'Git'
        ],
        recommendedKeywords: [
            'Microservices', 'Database Indexing & Query Optimization', 'API Rate Limiting', 'Connection Pooling',
            'Asynchronous Processing', 'Unit & Integration Testing', 'Security & Input Sanitization'
        ]
    },
    'fullstack-developer': {
        title: 'Full Stack Developer',
        category: 'Web Development',
        description: 'Designs end-to-end web applications combining robust backend services with polished frontends.',
        requiredSkills: [
            'JavaScript', 'TypeScript', 'React', 'Node.js', 'Express', 'MongoDB',
            'REST APIs', 'Tailwind CSS', 'Docker', 'Git', 'CI/CD Pipelines', 'Authentication'
        ],
        recommendedKeywords: [
            'Full Stack Architecture', 'RESTful API Design', 'State Hydration', 'End-to-End Testing',
            'Cloud Deployment (AWS/Vercel/Render)', 'Database Schema Design', 'Agile / Scrum'
        ]
    },
    'data-scientist': {
        title: 'Data Scientist / AI Engineer',
        category: 'Data Science & AI',
        description: 'Extracts actionable insights, builds predictive machine learning models, and works with large datasets.',
        requiredSkills: [
            'Python', 'Pandas', 'NumPy', 'Scikit-learn', 'SQL', 'Data Visualization',
            'Machine Learning', 'Deep Learning', 'Statistics', 'Git'
        ],
        recommendedKeywords: [
            'Feature Engineering', 'Cross-Validation & Hyperparameter Tuning', 'Exploratory Data Analysis (EDA)',
            'Supervised & Unsupervised Learning', 'Model Evaluation (ROC-AUC/F1)', 'Data Cleaning Pipelines'
        ]
    },
    'devops-cloud-engineer': {
        title: 'DevOps & Cloud Engineer',
        category: 'Cloud & Infrastructure',
        description: 'Automates software delivery pipelines, manages cloud infrastructure, and ensures system reliability.',
        requiredSkills: [
            'Linux', 'Docker', 'Kubernetes', 'AWS', 'CI/CD',
            'Terraform', 'Git', 'Networking', 'Monitoring'
        ],
        recommendedKeywords: [
            'Container Orchestration', 'Automated CI/CD Workflows', 'Cloud Infrastructure Provisioning',
            'High Availability & Disaster Recovery', 'Zero-Downtime Deployments', 'Secrets Management'
        ]
    }
};

const FREE_RESOURCE_DIRECTORY = {
    react: [
        { name: 'React Official Documentation (react.dev)', type: 'Docs & Tutorials', url: 'https://react.dev/learn' },
        { name: 'freeCodeCamp React Full Course (YouTube)', type: 'Video Course', url: 'https://www.youtube.com/watch?v=bMknfKXIFA8' },
        { name: 'Full Stack Open - University of Helsinki (Free)', type: 'Interactive Course', url: 'https://fullstackopen.com/en/' }
    ],
    'next.js': [
        { name: 'Next.js Official Interactive Tutorial', type: 'Official Interactive', url: 'https://nextjs.org/learn' },
        { name: 'Traversy Media Next.js Crash Course', type: 'Video Tutorial', url: 'https://www.youtube.com/watch?v=wm5gMKuwSYk' }
    ],
    typescript: [
        { name: 'TypeScript Handbook for JS Developers', type: 'Official Handbook', url: 'https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html' },
        { name: 'Total TypeScript Free Beginner Tutorial', type: 'Interactive Course', url: 'https://www.totaltypescript.com/tutorials/beginners-typescript' }
    ],
    javascript: [
        { name: 'MDN JavaScript Guide & Reference', type: 'Documentation', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide' },
        { name: 'JavaScript.info (Modern JS Tutorial)', type: 'Interactive Book', url: 'https://javascript.info/' },
        { name: 'freeCodeCamp JavaScript Algorithms & Data Structures', type: 'Certification Course', url: 'https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures-v8/' }
    ],
    'node.js': [
        { name: 'Node.js Official Getting Started Guide', type: 'Official Docs', url: 'https://nodejs.org/en/learn/getting-started/introduction-to-nodejs' },
        { name: 'The Odin Project NodeJS Path', type: 'Project-based Curriculum', url: 'https://www.theodinproject.com/paths/full-stack-javascript/courses/nodejs' }
    ],
    express: [
        { name: 'MDN Express Web Framework Guide', type: 'Tutorial Series', url: 'https://developer.mozilla.org/en-US/docs/Learn/Server-side/Express_Nodejs' },
        { name: 'Web Dev Simplified Express Tutorial', type: 'Video Tutorial', url: 'https://www.youtube.com/watch?v=SccSCuHhOw0' }
    ],
    mongodb: [
        { name: 'MongoDB University Free Developer Path', type: 'Official Free Course', url: 'https://learn.mongodb.com/' },
        { name: 'Mongoose Documentation & Guides', type: 'Official Docs', url: 'https://mongoosejs.com/docs/guide.html' }
    ],
    postgresql: [
        { name: 'PostgreSQL Tutorial for Beginners', type: 'Tutorial Series', url: 'https://www.postgresqltutorial.com/' },
        { name: 'SQLBolt - Learn SQL Interactively', type: 'Interactive Coding', url: 'https://sqlbolt.com/' }
    ],
    python: [
        { name: 'Python.org Official Beginners Guide', type: 'Official Guide', url: 'https://docs.python.org/3/tutorial/' },
        { name: 'Harvard CS50P - Introduction to Python (Free)', type: 'University Course', url: 'https://cs50.harvard.edu/python/' }
    ],
    docker: [
        { name: 'Docker 101 Tutorial & Play with Docker', type: 'Official Hands-on', url: 'https://www.docker.com/101-tutorial/' },
        { name: 'freeCodeCamp Docker Course for Beginners', type: 'Video Course', url: 'https://www.youtube.com/watch?v=fqMOX6JJhGo' }
    ],
    git: [
        { name: 'Git Official Pro Git Book (Free)', type: 'Free Book', url: 'https://git-scm.com/book/en/v2' },
        { name: 'Learn Git Branching (Visual Game)', type: 'Interactive Game', url: 'https://learngitbranching.js.org/' }
    ],
    'machine learning': [
        { name: 'Google Machine Learning Crash Course', type: 'Interactive Course', url: 'https://developers.google.com/machine-learning/crash-course' },
        { name: 'Scikit-Learn User Guide & Tutorials', type: 'Documentation', url: 'https://scikit-learn.org/stable/user_guide.html' },
        { name: 'Kaggle Learn - Hands-on Micro Courses', type: 'Hands-on Coding', url: 'https://www.kaggle.com/learn' }
    ],
    'deep learning': [
        { name: 'Deep Learning with PyTorch 60-min Blitz', type: 'Official Tutorial', url: 'https://pytorch.org/tutorials/beginner/deep_learning_60min_blitz.html' },
        { name: 'Fast.ai - Practical Deep Learning for Coders', type: 'Free Video Course', url: 'https://course.fast.ai/' }
    ],
    'tailwind css': [
        { name: 'Tailwind CSS Official Documentation', type: 'Official Docs', url: 'https://tailwindcss.com/docs/utility-first' }
    ],
    testing: [
        { name: 'Jest Official Getting Started Guide', type: 'Official Docs', url: 'https://jestjs.io/docs/getting-started' }
    ]
};

const GENERAL_DEV_RESOURCES = [
    { name: 'Roadmap.sh - Developer Learning Paths', type: 'Curriculum Roadmap', url: 'https://roadmap.sh' },
    { name: 'freeCodeCamp Free Certifications & Projects', type: 'Interactive Curriculum', url: 'https://www.freecodecamp.org' },
    { name: 'MDN Web Docs by Mozilla', type: 'Documentation & Reference', url: 'https://developer.mozilla.org' }
];

const PROJECT_IDEAS_DATABASE = {
    'frontend-developer': [
        {
            title: 'SaaS Analytics Dashboard with Live Charts',
            difficulty: 'Intermediate',
            skillsUsed: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js / Recharts', 'REST APIs'],
            description: 'Build a responsive dark-mode dashboard featuring KPI cards, filterable activity streams, data export, and simulated real-time WebSocket feeds.'
        },
        {
            title: 'Collaborative Kanban Task Management Tool',
            difficulty: 'Intermediate to Advanced',
            skillsUsed: ['React / Next.js', 'Drag-and-Drop (dnd-kit)', 'State Management', 'Local Persistence'],
            description: 'Implement a Trello-like workflow board with drag-and-drop column lanes, priority tags, markdown notes, and search/filter capability.'
        }
    ],
    'backend-developer': [
        {
            title: 'Scalable E-Commerce REST API with JWT & Role-Based Access Control',
            difficulty: 'Intermediate',
            skillsUsed: ['Node.js / Express', 'MongoDB / PostgreSQL', 'JWT Auth', 'Docker'],
            description: 'Design and deploy an enterprise-grade backend featuring product catalogs, paginated filtering, secure checkout tokens, and automated rate-limiting.'
        }
    ],
    'fullstack-developer': [
        {
            title: 'AI-Powered Resume Reviewer & Career Roadmap Platform',
            difficulty: 'Advanced',
            skillsUsed: ['React / Next.js', 'Node.js', 'Google Gemini / NLP', 'MongoDB', 'Tailwind CSS'],
            description: 'Create an end-to-end EdTech web app that extracts resume content, computes ATS readiness, and renders step-by-step learning schedules with milestone tracking.'
        }
    ],
    'data-scientist': [
        {
            title: 'Customer Churn Prediction & Model Explainer Web App',
            difficulty: 'Intermediate',
            skillsUsed: ['Python', 'Pandas', 'Scikit-learn', 'Streamlit / FastAPI', 'SHAP Analysis'],
            description: 'Train an ensemble classification pipeline on customer records, explain feature importance with SHAP, and deploy an interactive prediction UI.'
        }
    ]
};

const DEMO_PRESETS = [
    {
        id: 'demo-frontend-fresher',
        candidateName: 'Liam Evans',
        headline: 'Frontend Developer | React & Modern Web Specialist',
        targetRoleId: 'frontend-developer',
        targetRoleTitle: 'Frontend Developer',
        resumeFileName: 'frontend_developer_resume.pdf',
        resumeText: `LIAM EVANS
Frontend Developer | React & Modern Web Specialist
liam.evans@example.com | (555) 345-6789 | github.com/liamevans-dev | San Francisco, CA

PROFESSIONAL SUMMARY
Innovative Frontend Developer with 3+ years of experience building modern, responsive single-page web applications using React, JavaScript (ES6+), TypeScript, HTML5, CSS3, and Tailwind CSS. Proven track record in state management (Redux Toolkit), REST API integration, and Lighthouse optimization (95+ score).

TECHNICAL SKILLS
Frontend: React, JavaScript (ES6+), TypeScript, Next.js, HTML5, CSS3, Tailwind CSS, Redux Toolkit, Vue.js
Tools & UI: Git, GitHub, Webpack, Vite, Figma, Postman, Jest, React Testing Library, NPM

WORK EXPERIENCE
Frontend Engineer | TechSprint Solutions (2023 - Present)
- Engineered scalable customer dashboard in React and Tailwind CSS, increasing user engagement by 35%.
- Integrated RESTful APIs with Axios and implemented React Query for efficient data caching.
- Optimized core web vitals, reducing page load time by 45% and improving SEO rankings.

PROJECTS
E-Commerce Cloud Storefront (React, Redux Toolkit, Stripe API)
- Developed full-featured shopping cart with filterable catalog, real-time search, and checkout payment gateway.

EDUCATION
B.S. in Computer Science | University of California, Berkeley (2020 - 2024)`,
        summary: 'Experienced Frontend Engineer skilled in building modern single-page apps with React, TypeScript, Redux, and Tailwind CSS.'
    },
    {
        id: 'demo-fullstack-junior',
        candidateName: 'Marcus Hall',
        headline: 'Oracle Certified Full Stack Developer | Java, React, Python',
        targetRoleId: 'fullstack-developer',
        targetRoleTitle: 'Full Stack Developer',
        resumeFileName: 'New Resume (2).pdf',
        resumeText: `MARCUS HALL
Oracle Certified Full Stack Developer
(234)-253-6506 | github.io/danette.east | San Fransisco, CA

SUMMARY
Full Stack Developer with over 10 years of experience in Java/JS, Angular, Vue, React, Python, NumPy, SciPy, Scikit-learn. Led development of $500K research project which was deemed a "gold standard" by the client. Increased client's revenue 2-fold after fine-tuning AI/ML-based algorithms.

EXPERIENCE
Senior Full stack Developer | Boyle (2023 - 2025 San Fransisco, CA)
• Hired, trained and led an Agile team of 7 full-stack developers.
• Developed indexed database architecture using SQL procedures and triggers for 10 different applications.
• Worked with Core Java to develop automated solutions to include web interfaces using HTML, CSS, JavaScript and Web services.

Full Stack Developer | Lauzon (2019 - 2023 San Fransisco, CA)
• Simultaneously created & maintained scheduled jobs in SQL Server for space maintenance and daily backups of system and user databases for 10 clients.
• Increased company revenue by 30% within 2 months after developing and implementing business logic for over 20 features.
• Designed and Developed UI design for over 15 clients using CSS, HTML, ASP.NET, Vue, and React; websites scoring over 85 on Lighthouse.

Solution Architect | Keeling Group (2015 - 2019 Palo Alto, CA)
• Shortened project timeline by 14 months for company's largest customer by managing relationship with 3rd party vendors, saving over $800K.
• Performed Web Scraping over a catalog of 100K+ school supply products using mainly NodeJS and MongoDB; completed in 1 month.

PROJECTS
OpenFlow based Firewall (Python, NodeJS)
• Configured static rules using MD-SAL.
• Engineered proactive rule evaluation system at OSI layer 7 using POX controller.

SKILLS
Client-Side: HTML, CSS, JS, Angular, React, Vue, Redux, TypeScript, Bootstrap
Server-Side: Python, NumPy, SciPy, Scikit-learn, TensorFlow, MySQL, NodeJS, Redis, AWS, MongoDB
DevOps: JUnit, Jest, Scrum, Agile, GIT, Azure DevOps

EDUCATION
M.S. in Computer Science | Stanford University (GPA 3.9/4.0)`,
        summary: 'Seasoned Full Stack Developer with 10+ years across React, Java, Node.js, Python, and cloud infrastructure.'
    },
    {
        id: 'demo-datascience-student',
        candidateName: 'Sebastian Martin',
        headline: 'Aspiring Data Scientist | Data Analysis | Python & Tableau',
        targetRoleId: 'data-scientist',
        targetRoleTitle: 'Data Scientist / AI Engineer',
        resumeFileName: 'New Resume (2) (1).pdf',
        resumeText: `SEBASTIAN MARTIN
Aspiring Data Scientist | Data Analysis | Python
+1-(234)-555-1234 | linkedin.com | Dallas, Texas

SUMMARY
Eager data science enthusiast with a solid foundation in statistical analysis and data visualization. Proficient in Python and familiar with Tableau, ready to contribute to impactful analytical initiatives.

EXPERIENCE
Data Analyst Volunteer | Analytics for Non-Profits (01/2026 - Present Remote)
• Streamlined data analysis processes by introducing automated Python scripts, resulting in a 20% reduction in processing time.
• Collaborated with a team of analysts to develop data visualization dashboards using Tableau, enhancing donor engagement.
• Conducted statistical analysis on fundraising data, providing actionable insights to improve non-profit strategies significantly.

Research Assistant | Texas Advanced Computing Center (06/2026 - 12/2026 Austin, Texas)
• Assisted in the development of predictive modeling tools using R, contributing to a research project on climate projections.
• Engaged in data preprocessing and cleaning techniques, improving the accuracy of project datasets by 15%.
• Applied analytical skills to literature review on emerging data science trends.

SKILLS
Python, R, Statistical Analysis, Data Visualization, Tableau, Machine Learning, SQL

EDUCATION
Bachelor of Science in Data Science | University of Texas at Dallas (2022 - 2026)

TRAINING & CERTIFICATIONS
• Data Science Specialization (Coursera)
• Introduction to Machine Learning (edX)
• Advanced Data Visualization with Tableau (LinkedIn Learning)`,
        summary: 'Aspiring Data Scientist skilled in Python, R, Tableau dashboards, statistical modeling, and data analytics.'
    }
];

function generateLearningRoadmap(missingSkills, targetRoleKey = 'frontend-developer', totalWeeks = 6) {
    const roleInfo = ROLE_CATALOG[targetRoleKey] || ROLE_CATALOG['frontend-developer'];
    const roadmap = [];

    const effectiveMissing = missingSkills && missingSkills.length > 0
        ? missingSkills
        : ['Advanced Architecture', 'Testing & CI/CD', 'Performance Tuning'];

    const skillsPerWeek = Math.max(1, Math.ceil(effectiveMissing.length / totalWeeks));

    for (let w = 1; w <= totalWeeks; w++) {
        const startIndex = (w - 1) * skillsPerWeek;
        const weekSkills = effectiveMissing.slice(startIndex, startIndex + skillsPerWeek);

        let weekTitle = '';
        let weekGoal = '';
        let topics = [];
        let freeResources = [];

        if (weekSkills.length > 0) {
            const skillNames = weekSkills.join(' & ');
            weekTitle = 'Week ' + w + ': Mastering ' + skillNames;
            weekGoal = 'Gain foundational and practical working proficiency in ' + skillNames + ' through hands-on exercises.';

            weekSkills.forEach(s => {
                const sLower = s.toLowerCase();
                topics.push('Core architecture and fundamentals of ' + s);
                topics.push('Practical implementation and common design patterns in ' + s);
                topics.push('Debugging, performance, and best practices with ' + s);

                const matchingKey = Object.keys(FREE_RESOURCE_DIRECTORY).find(k => sLower.includes(k));
                if (matchingKey && FREE_RESOURCE_DIRECTORY[matchingKey]) {
                    freeResources.push(...FREE_RESOURCE_DIRECTORY[matchingKey]);
                }
            });
        } else {
            if (w === totalWeeks - 1) {
                weekTitle = 'Week ' + w + ': Full Portfolio Project Build';
                weekGoal = 'Consolidate all learned skills into an end-to-end production portfolio application.';
                topics = [
                    'Project scaffolding, database schema, and architecture design',
                    'Implementing core features with robust error handling',
                    'Writing unit and integration tests'
                ];
                freeResources.push(...GENERAL_DEV_RESOURCES);
            } else {
                weekTitle = 'Week ' + w + ': Deployment, CI/CD & Interview Readiness';
                weekGoal = 'Deploy your project live with automated pipelines and practice technical interview questions.';
                topics = [
                    'Deploying to free cloud hosting (Vercel, Render, GitHub Pages)',
                    'Writing a comprehensive README with architecture diagrams and live demos',
                    'Conducting mock technical interviews and refining resume bullet points'
                ];
                freeResources.push(...GENERAL_DEV_RESOURCES);
            }
        }

        if (freeResources.length === 0) {
            freeResources = [...GENERAL_DEV_RESOURCES];
        }

        const uniqueResources = [];
        const seenUrls = new Set();
        freeResources.forEach(res => {
            if (!seenUrls.has(res.url)) {
                seenUrls.add(res.url);
                uniqueResources.push(res);
            }
        });

        roadmap.push({
            week: w,
            title: weekTitle,
            goal: weekGoal,
            skillsFocus: weekSkills.length > 0 ? weekSkills : ['System Integration'],
            topics: topics.slice(0, 3),
            freeResources: uniqueResources.slice(0, 3),
            milestones: [
                { id: 'w' + w + '_m1', task: 'Complete introductory tutorial and docs for ' + (weekSkills[0] || 'core concepts'), completed: false },
                { id: 'w' + w + '_m2', task: 'Build a standalone mini-feature or component demonstrating practical application', completed: false },
                { id: 'w' + w + '_m3', task: 'Push code to GitHub with descriptive commit history and documentation', completed: false }
            ]
        });
    }

    const suggestedProjects = PROJECT_IDEAS_DATABASE[targetRoleKey] || PROJECT_IDEAS_DATABASE['frontend-developer'];

    return {
        targetRole: roleInfo.title,
        totalWeeks: totalWeeks,
        estimatedHoursPerWeek: '8-12 hours',
        roadmap: roadmap,
        suggestedProjects: suggestedProjects
    };
}

function generateResumeImprovements(resumeText, targetRoleKey = 'frontend-developer', missingSkills = []) {
    const roleInfo = ROLE_CATALOG[targetRoleKey] || ROLE_CATALOG['frontend-developer'];
    const lowerText = resumeText.toLowerCase();

    const keywordsToAdd = [];
    roleInfo.recommendedKeywords.forEach(kw => {
        if (!lowerText.includes(kw.toLowerCase())) {
            keywordsToAdd.push(kw);
        }
    });
    missingSkills.forEach(skill => {
        if (!keywordsToAdd.includes(skill) && !lowerText.includes(skill.toLowerCase())) {
            keywordsToAdd.push(skill);
        }
    });

    const formattingTips = [];
    if (!lowerText.includes('github.com')) {
        formattingTips.push('Add an active GitHub profile link prominently in the header section.');
    }
    if (!lowerText.includes('linkedin.com')) {
        formattingTips.push('Include a customized LinkedIn URL in your contact header.');
    }
    const metricsCount = (resumeText.match(/\d+[\s%|\$|\+]/g) || []).length;
    if (metricsCount < 3) {
        formattingTips.push('Quantify your achievements: Add numbers, percentages, and metrics (e.g., "Reduced latency by 35%", "Served 500+ users").');
    }
    if (!lowerText.includes('projects') && !lowerText.includes('project')) {
        formattingTips.push('Add a dedicated "Featured Projects" section with tech stack tags and live/GitHub links.');
    }
    formattingTips.push('Use single-column layout for ATS readability; avoid multi-column tables and non-standard fonts.');
    formattingTips.push('Keep resume strictly to 1 page for students and candidates with under 5 years of experience.');

    const impactStatements = [
        {
            category: 'Project Description',
            original: 'Built a web application using React and Node.js for managing student tasks.',
            improved: 'Architected and deployed a full-stack task manager (React, Node.js, MongoDB) that automated workflow tracking for 250+ active campus peers, reducing task turnaround by 30%.',
            reason: 'Specifies the full tech stack, quantifies real user impact, and applies active leadership verbs.'
        },
        {
            category: 'API & Performance',
            original: 'Worked on backend APIs and connected them to database queries.',
            improved: 'Engineered 12+ RESTful endpoints in Express with compound MongoDB indexing, decreasing average API response latency from 400ms to 110ms.',
            reason: 'Uses the Google XYZ formula: Accomplished [X] as measured by [Y] by doing [Z].'
        },
        {
            category: 'Frontend & UI Optimization',
            original: 'Made website pages responsive and fixed bugs.',
            improved: 'Revamped UI with Tailwind CSS and asynchronous image lazy-loading, achieving a 99/100 Google Lighthouse performance score and ensuring 100% mobile responsiveness.',
            reason: 'Substitutes generic bug fixing with measurable performance improvements and specific tooling.'
        }
    ];

    return {
        targetRole: roleInfo.title,
        keywordsToAdd: keywordsToAdd.slice(0, 8),
        formattingTips: formattingTips.slice(0, 5),
        impactStatements: impactStatements
    };
}

function calculateATSScore(resumeText) {
    const lower = resumeText.toLowerCase();
    let score = 50;
    const checks = [];

    const hasEmail = /[\w.-]+@[\w.-]+\.\w+/.test(resumeText);
    const hasPhone = /[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}/.test(resumeText);

    if (hasEmail && hasPhone) {
        score += 10;
        checks.push({ name: 'Contact Information', status: 'Passed', details: 'Clear email and contact number detected.' });
    } else {
        checks.push({ name: 'Contact Information', status: 'Warning', details: 'Ensure email, phone, and location are easily parsable in the header.' });
    }

    const standardSections = ['education', 'skills', 'experience', 'projects'];
    const foundSections = standardSections.filter(sec => lower.includes(sec));
    const sectionScore = Math.round((foundSections.length / standardSections.length) * 20);
    score += sectionScore;
    checks.push({
        name: 'Standard Section Headings',
        status: foundSections.length >= 3 ? 'Passed' : 'Warning',
        details: 'Found ' + foundSections.length + '/4 critical sections (' + foundSections.join(', ') + ').'
    });

    const metrics = resumeText.match(/\d+[\s%|\$|\+|x]/gi) || [];
    if (metrics.length >= 4) {
        score += 10;
        checks.push({ name: 'Quantifiable Metrics & Data', status: 'Passed', details: metrics.length + ' metric data points found to prove business impact.' });
    } else {
        checks.push({ name: 'Quantifiable Metrics & Data', status: 'Warning', details: 'Add numbers, percent increases, or scale to validate your achievements.' });
    }

    const actionVerbs = ['developed', 'engineered', 'built', 'architected', 'designed', 'optimized', 'implemented', 'deployed', 'spearheaded', 'managed'];
    const foundVerbs = actionVerbs.filter(v => lower.includes(v));
    if (foundVerbs.length >= 4) {
        score += 10;
        checks.push({ name: 'Strong Action Verbs', status: 'Passed', details: 'Found strong action verbs: ' + foundVerbs.slice(0, 4).join(', ') + '.' });
    } else {
        checks.push({ name: 'Strong Action Verbs', status: 'Warning', details: 'Begin each bullet point with decisive action verbs (e.g., "Engineered", "Implemented").' });
    }

    const totalATS = Math.min(Math.max(score, 45), 98);

    return {
        atsScore: totalATS,
        rating: totalATS >= 85 ? 'Excellent ATS Readiness' : totalATS >= 70 ? 'Good ATS Match' : 'Needs Optimization',
        checks: checks
    };
}

function generateMockQuestions(targetRoleKey = 'frontend-developer', missingSkills = []) {
    const roleInfo = ROLE_CATALOG[targetRoleKey] || ROLE_CATALOG['frontend-developer'];

    const questionsByRole = {
        'frontend-developer': [
            {
                type: 'Technical Concept',
                question: 'How does React\'s Virtual DOM and Reconciliation algorithm work, and when would you use useMemo or useCallback?',
                keyFocusPoints: [
                    'Explain diffing algorithm and fiber tree reconciliation',
                    'Avoid premature optimization: only memoize expensive calculations or stable prop references',
                    'Describe key prop importance in list rendering'
                ]
            },
            {
                type: 'Architecture & System Design',
                question: 'How would you structure client-side state management for an application with both local UI state and shared asynchronous server cache?',
                keyFocusPoints: [
                    'Differentiate between server state (React Query/SWR) and local UI state (useState/Zustand)',
                    'Discuss normalized data structures and optimistic UI updates'
                ]
            },
            {
                type: 'Behavioral & Problem Solving',
                question: 'Describe a challenging bug you encountered in a frontend project. How did you diagnose and solve it?',
                keyFocusPoints: [
                    'Use the STAR method (Situation, Task, Action, Result)',
                    'Mention browser developer tools, performance profiling, or network tab inspection'
                ]
            }
        ],
        'backend-developer': [
            {
                type: 'Technical Concept',
                question: 'How do you prevent SQL Injection and NoSQL Injection attacks in your API routes?',
                keyFocusPoints: [
                    'Use parameterized queries / ORM sanitization',
                    'Strict schema validation using middleware (Joi / Zod / express-validator)',
                    'Principle of least privilege on database credentials'
                ]
            },
            {
                type: 'System Design',
                question: 'Explain how you would design a rate-limiting middleware to protect sensitive endpoints like /login or /resumedata.',
                keyFocusPoints: [
                    'Token bucket or sliding window algorithm with Redis',
                    'Keying by IP address or user ID with HTTP 429 Retry-After headers'
                ]
            },
            {
                type: 'Behavioral',
                question: 'How do you handle breaking changes in a public REST API without disrupting existing client applications?',
                keyFocusPoints: [
                    'API Versioning (/api/v1 vs /api/v2 or header-based)',
                    'Deprecation notices, sunsetting schedules, and backward compatibility tests'
                ]
            }
        ],
        'fullstack-developer': [
            {
                type: 'Full Stack Integration',
                question: 'Explain the complete lifecycle of an authenticated request from a React client to an Express server and MongoDB database.',
                keyFocusPoints: [
                    'JWT issuance in HTTP-only cookie vs Authorization header',
                    'CORS preflight (OPTIONS) check and credentials handling',
                    'Middleware verification and Mongoose connection query lifecycle'
                ]
            },
            {
                type: 'Scalability',
                question: 'How would you handle heavy background processing (like PDF parsing and AI analysis) without blocking the Node.js event loop?',
                keyFocusPoints: [
                    'Offload to asynchronous job queues (BullMQ / Redis workers)',
                    'Use streaming responses or WebSockets / Polling to notify the client on completion'
                ]
            }
        ],
        'data-scientist': [
            {
                type: 'Machine Learning',
                question: 'How do you diagnose and resolve High Variance (Overfitting) vs High Bias (Underfitting) in a classification model?',
                keyFocusPoints: [
                    'Analyze training vs validation learning curves',
                    'Apply regularization (L1/L2, Dropout), cross-validation, or feature selection for overfitting'
                ]
            }
        ]
    };

    const questions = questionsByRole[targetRoleKey] || questionsByRole['frontend-developer'];

    if (missingSkills && missingSkills.length > 0) {
        const topMissing = missingSkills[0];
        questions.unshift({
            type: 'Skill Gap Focus: ' + topMissing,
            question: 'Explain the core purpose of ' + topMissing + ' and how you would apply it to build a scalable, modern feature.',
            keyFocusPoints: [
                'Define what problem ' + topMissing + ' solves compared to traditional alternatives',
                'Discuss a realistic use-case and error handling considerations'
            ]
        });
    }

    return {
        targetRole: roleInfo.title,
        questions: questions.slice(0, 5)
    };
}

module.exports = {
    ROLE_CATALOG,
    FREE_RESOURCE_DIRECTORY,
    PROJECT_IDEAS_DATABASE,
    DEMO_PRESETS,
    generateLearningRoadmap,
    generateResumeImprovements,
    calculateATSScore,
    generateMockQuestions
};
