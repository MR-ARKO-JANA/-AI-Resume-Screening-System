# AI-Powered Resume Screening & Recruitment System

A modern full-stack web application designed to automate resume screening, candidate ranking, skill gap analysis, and candidate profile evaluation.

![Dashboard Preview](./dashboard.png)

---

## 📌 Features

- **Multi-Format Resume Parsing**: Fast text extraction from PDF and Word documents (`.pdf`, `.doc`, `.docx`).
- **Smart Candidate Evaluation**: Scores and ranks candidates according to specific job descriptions with match confidence.
- **Skill Gap & Career Roadmap**: Identifies matched and missing technical skills with structured learning paths and interview preparation questions.
- **Job Board Aggregation & Sync**: Built-in job feeds with filters for platform, title, and location.
- **Candidate Footprint Inspector**: Deep GitHub and LinkedIn technical profiling.
- **Export & Analytics**: Recruiter metrics and CSV candidate data export.
- **Secure Authentication**: Session security via JWT and bcrypt encryption.

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: PostgreSQL (Neon Cloud / Local)
- **Natural Language Processing**: Natural NLP, PDF-Parse, Mammoth
- **AI Engine**: Google Gemini API
- **Authentication**: JSON Web Tokens (JWT) & HTTP-Only Secure Cookies
- **Communication**: Nodemailer SMTP

### Frontend
- **Interface**: HTML5, Vanilla JavaScript, CSS3, Tailwind utility styling
- **Icons & Visuals**: FontAwesome, Chart.js, Canvas Confetti

---

## 📁 Project Structure

```text
├── backend/
│   ├── config/          # Database connection pool & multer config
│   ├── controllers/     # Auth, Dashboard, EdTech, Job, Profile, and Resume logic
│   ├── middleware/      # Auth verification, rate limiting, and security headers
│   ├── models/          # PostgreSQL Data Access Layer (Users, Jobs, Resumes, Scores)
│   ├── routes/          # Express API route definitions
│   ├── utils/           # Resume parser, NLP analyzers, and PDF exports
│   └── server.js        # Main server entry point
├── frontend/
│   ├── css/             # Stylesheets & animations
│   ├── html/            # Application views (Dashboard, Jobs, Results, Settings)
│   └── js/              # Frontend state management and API handlers
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- PostgreSQL connection string (Neon or Local)
- Google Gemini API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MR-ARKO-JANA/-AI-Resume-Screening-System.git
   cd "Coding Section"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL=your_postgresql_neon_connection_string
   JWT_SECRET=your_jwt_secret_key
   GEMINI_API_KEY=your_gemini_api_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Open in your browser:**
   ```
   http://localhost:5000
   ```

---

## 📄 License
This project is licensed under the MIT License.
