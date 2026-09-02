# AI Resume Screening System - Detailed Project Report

This report outlines the architecture, database schema, and detailed functional logic (API endpoints) of the existing AI Resume Screening System. You can use this as a reference guide to ensure your new scratch-built frontend correctly implements the required API calls and data structures.

## 1. System Architecture Overview
- **Backend Framework**: Node.js with Express.js
- **Database**: MongoDB (using Mongoose ORM)
- **AI Integration**: Google Gemini API (`@google/generative-ai`) for natural language processing and candidate evaluation.
- **File Uploads**: `multer` for handling `multipart/form-data` and `pdf-parse` for extracting text from PDF resumes.
- **Authentication**: JSON Web Tokens (JWT) stored in HTTP-only cookies.
- **Frontend Serving**: The backend serves static HTML, CSS, and JS files from the `frontend/` directory.

---

## 2. Database Models (Schema)

The MongoDB database relies on the following collections/models:

### User Model (`usermodels.js`)
Stores recruiter/user accounts.
- `name` (String)
- `email` (String) - Unique identifier for login.
- `password` (String) - Hashed password.
- `company` (String) - Optional company name.
- `jobTitle` (String) - Optional job title.

### Job Model (`jobModel.js`)
Stores job listings that candidates will be evaluated against.
- `userId` (ObjectId) - References the User who created the job.
- `jobTitle` (String)
- `jobDescription` (String) - The core text used by AI to evaluate resumes.
- `company`, `location` (String)
- `source` (Enum: 'Naukri', 'Indeed', 'Unstop', 'Manual')
- `salary`, `experience` (String)
- `skillsRequired` (Array of Strings)

### Resume Model (`resumeModel.js`)
Tracks the actual PDF files uploaded.
- `userId` (ObjectId) - References the uploading User.
- `fileName` (String) - Original file name.
- `filePath` (String) - Local path in the `uploads/` folder.
- `uploadDate` (Date)

### Score Model (`scoreModel.js`)
The core data structure holding the AI's evaluation of a candidate.
- `userId` (ObjectId)
- `resumeId` (ObjectId) - References the Resume Model.
- `jobId` (ObjectId) - References the Job Model.
- `matchScore` (Number) - AI-generated score from 0 to 100.
- `status` (Enum: 'Shortlisted', 'Rejected', 'Pending')
- `aiAnalysis` (String) - Text feedback explaining the score.
- `aiConfidence` (Number) - 0 to 100.
- `experience` (String)
- `skills` (Array of objects: `{ name: String, percentage: Number }`)
- `candidateName`, `githubUrl`, `linkedinUrl` (Strings)
- `linkedinData`, `githubData` (Objects) - Data scraped or manually added from candidate profiles.

---

## 3. Detailed API Endpoints & Functions

Below is the complete list of REST API endpoints that your new frontend will need to interact with.

### Authentication & User Settings (`auth.routes.js`)
- `POST /login`: Accepts `{ email, password }`. Returns a JWT token in a cookie and success status. Rate limited to 10 requests per 15 minutes.
- `POST /register`: Accepts `{ name, email, password }`. Hashes the password and creates a new User.
- `GET /logout`: Clears the JWT authentication cookie.
- `GET /api/user-profile`: Returns the authenticated user's profile details.
- `POST /api/update-profile`: Accepts `{ company, jobTitle }` to update the user's profile.
- `POST /api/change-password`: Accepts `{ currentPassword, newPassword }` to update credentials.
- `POST /api/delete-all-data`: Wipes all jobs, resumes, and scores tied to the user's account.
- `POST /api/delete-account`: Deletes the user account and all associated data permanently.
- `POST /api/help/contact`: Accepts `{ name, email, subject, message }` to save a support ticket.

### Dashboard Analytics (`dashboard.routes.js`)
- `GET /getallcandidates`: Fetches every `Score` document for the logged-in user, populated with the associated `Resume` (for filename) and `Job` (for job title) data. Used to populate the main candidate tables.
- `GET /dashboard-stats`: Calculates and returns high-level metrics:
  - `totalCandidates`: Total number of resumes parsed.
  - `shortlisted`: Count of candidates with 'Shortlisted' status.
  - `rejected`: Count of candidates with 'Rejected' status.
  - `pending`: Count of candidates with 'Pending' status.
  - `averageScore`: The mean match score across all candidates.
- `GET /getcandidates/:status`: Returns candidates filtered by a specific status string in the URL parameter.

### Job Management (`job.routes.js`)
- `GET /api/jobs`: Returns a list of all jobs created by the current user.
- `POST /api/jobs/sync`: An endpoint meant to sync jobs from external sources (simulated in the current logic).
- `POST /api/jobs/apply/:jobId`: Accepts `multipart/form-data` with a single file field `doc`. Uploads the file and associates the application directly with the specified job.

### Profile Integration (`profile.routes.js`)
- `POST /api/profile/github`: Fetches and stores GitHub profile data for a candidate.
- `POST /api/profile/linkedin-analyze`: Fetches and stores LinkedIn profile data.
- `POST /api/profile/candidate-lookup`: Searches for digital footprints of a candidate based on name and details.
- `GET /api/profile/candidate/:id`: Retrieves the rich profile data (including GitHub/LinkedIn objects) for a specific candidate score ID.

### Core AI & Resume Processing (`resume.routes.js`)
- `POST /createjob`: Accepts job details (title, description, skills) to create a new `Job` document manually.
- `POST /resumedata`: **The most complex endpoint.** 
  - Accepts `multipart/form-data` with an array of files under the key `doc` (maximum 10 files).
  - Also expects `jobId` in the body to know which job description to evaluate against.
  - Flow: Uploads PDFs -> Extracts Text -> Prompts Google Gemini -> Parses JSON Response -> Saves `Resume` and `Score` models.
- `GET /getlatestresult`: Returns the most recently generated `Score` document for the user. Useful for redirecting the user immediately after a single resume upload to view results.
- `GET /export-csv`: Compiles all candidate scores into a CSV format and streams it to the client for download.

---

## 4. Frontend Routing (View Serving)

The current backend is a Monolith that serves HTML files directly via Express routes. If you build a new frontend (e.g., in React, Vue, or completely new HTML/CSS), you will either replace these views or decouple the frontend completely to run on a separate server (like Vite/Next.js).

Currently, the server handles these GET requests by returning static HTML:
- `/`, `/login`, `/register` -> `login_register.html`
- `/dashboard` -> `dashboard.html`
- `/candidates` -> `candidates.html`
- `/jobs` -> `jobs.html`
- `/profile-lookup` -> `profile-lookup.html`
- `/settings` -> `settings.html`
- `/help` -> `help.html`
- `/templates` -> `templates.html`
- `/result` -> `result.html` (Note: This route also sets a `resultData` cookie containing the latest score data before rendering the page, allowing the frontend JS to easily read and display the results without an extra API call).

## 5. Implementation Notes for the New UI/UX
- **Rate Limiting**: Be aware that login and registration endpoints have a rate limit of 10 requests per 15 minutes. General API routes are limited to 100 requests per 15 minutes. 
- **Error Handling**: The backend throws HTTP 400 for file upload issues (e.g., file too large > 5MB) and HTTP 503 if the MongoDB connection drops. Your new frontend should gracefully display these errors.
- **Cookies**: Ensure your HTTP requests include `credentials: 'include'` (if using fetch/axios) so that the JWT token cookie is automatically sent with every API call.
