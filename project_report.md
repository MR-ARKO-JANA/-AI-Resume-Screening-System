# AI Resume Screening & Evaluation Platform - Technical Architecture Report

## 1. System Overview
The AI Resume Screening System is a full-stack platform designed to streamline candidate evaluation for talent acquisition teams and job seekers. The backend processes uploaded resumes, performs semantic parsing and skill-matching algorithms against specific job profiles, and generates ranking metrics, ATS diagnostics, and candidate roadmaps.

---

## 2. Architecture & Data Flow
- **Server**: Node.js & Express.js REST API
- **Database**: PostgreSQL (hosted on Neon Serverless)
- **Document Processing**: `pdf-parse` for PDF binary stream extraction and `mammoth` for DOCX parsing.
- **Natural Language Parsing**: Tokenization and TF-IDF term frequency analysis via `natural` NLP library with contextual evaluation via Google Gemini.
- **Client Security**: HTTP-only JWT cookies, Helmet-based security headers, and endpoint rate-limiting.

---

## 3. Database Schema

### Users Table (`users`)
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR UNIQUE) - User authentication identifier
- `password` (VARCHAR) - Bcrypt password hash
- `company` (VARCHAR) - Recruiter organization
- `job_title` (VARCHAR) - Recruiter title
- `created_at` (TIMESTAMP)

### Jobs Table (`jobs`)
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `job_title` (VARCHAR)
- `job_description` (TEXT) - Target description for candidate scoring
- `company`, `location`, `source`, `salary`, `experience`
- `skills_required` (JSONB) - List of key technical skills
- `is_external`, `external_id` (VARCHAR) - External job tracking identifiers
- `created_date` (TIMESTAMP)

### Resumes Table (`resumes`)
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `file_name` (VARCHAR)
- `file_path` (TEXT)
- `upload_date` (TIMESTAMP)

### Scores Table (`scores`)
- `id` (SERIAL PRIMARY KEY)
- `user_id` (INTEGER REFERENCES users(id))
- `resume_id` (INTEGER REFERENCES resumes(id))
- `job_id` (INTEGER REFERENCES jobs(id))
- `match_score` (NUMERIC 0-100)
- `status` ('Shortlisted' | 'Pending' | 'Rejected')
- `ai_analysis` (TEXT)
- `ai_confidence` (NUMERIC)
- `experience` (VARCHAR)
- `skills` (JSONB) - Detailed skill match breakdown
- `scoring_breakdown` (JSONB)
- `candidate_name`, `github_url`, `linkedin_url`
- `education`, `projects` (JSONB)
- `learning_roadmap`, `resume_improvements`, `mock_questions` (JSONB)
- `created_date` (TIMESTAMP)

---

## 4. API Endpoints

### Authentication & Account (`/`)
- `POST /login`: Validates credentials and issues authentication token.
- `POST /register`: Registers a new recruiter or candidate account.
- `GET /logout`: Terminates the session.
- `GET /api/user-profile`: Fetches authenticated user information.
- `POST /api/update-profile`: Updates organization details.
- `POST /api/change-password`: Modifies security credentials.
- `POST /api/delete-all-data`: Resets candidate records for user.
- `POST /api/delete-account`: Deletes user account and data.

### Dashboard & Analytics (`/`)
- `GET /getallcandidates`: Returns all ranked candidate scores with related metadata.
- `GET /dashboard-stats`: Aggregates active candidate statistics, shortlisted ratios, and month-over-month trends.
- `GET /getcandidates/:status`: Queries candidates by application status.

### Job Listings (`/`)
- `GET /api/jobs`: Fetches job listings with multi-filter support.
- `POST /api/jobs/sync`: Syncs and updates job board feeds.
- `POST /api/jobs/apply/:jobId`: Handles direct candidate resume submission against a job.

### Candidate Profiling (`/`)
- `POST /api/profile/github`: Inspects repository statistics and commit timelines.
- `POST /api/profile/linkedin-analyze`: Extracts candidate work history and credentials.
- `GET /api/profile/candidate/:id`: Retrieves full profile data for a specific applicant.

### Resume Evaluation & Scoring (`/`)
- `POST /createjob`: Registers custom job postings.
- `POST /resumedata`: Processes single or batch resume uploads against job requirements.
- `GET /getlatestresult`: Fetches the most recent candidate evaluation details.
- `GET /export-csv`: Exports candidate evaluation dataset to CSV format.
