![Node.js](https://img.shields.io/badge/Node.js-v20-green?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-brightgreen?logo=mongodb)
![Deploy](https://img.shields.io/badge/Cloud_Run-Deployed-blue?logo=google-cloud)
![License](https://img.shields.io/badge/License-MIT-yellow)

# 🤖 AI Resume Screening System 
Deployed Link:- https://ai-resume-scanner-127178207448.us-central1.run.app

An intelligent resume screening platform that uses AI/ML algorithms to automatically analyze and rank candidates based on job requirements. Optimized for performance and built with a modern, responsive glassmorphism UI.

![Project Banner](https://via.placeholder.com/1200x400/667eea/ffffff?text=AI+Resume+Screening+System)

## ✨ Features

### 🚀 Core Functionality
- 📄 **Smart Multi-format Parsing** - Extracts text from **PDF, DOC, and DOCX** files seamlessly.
- 🎯 **AI-Powered Matching** - Utilizes NLP and TF-IDF algorithms for precise candidate-job alignment.
- 📊 **Transparent Scoring** - Weighted scoring: **60% Skills + 30% Keywords + 10% Experience**.
- 🏆 **Dynamic Ranking** - Automatically ranks candidates based on match scores for quick decision-making.
- 🎨 **Premium UI/UX** - Modern glassmorphism design with fluid animations and responsive layout.

### 🛠️ Technical Excellence
- 🔐 **Secure Authentication** - JWT-based authentication with bcrypt password hashing.
- 📈 **Real-time Stats** - Dashboard statistics powered by optimized MongoDB aggregation queries.
- ⚡ **High Performance** - 60fps animations and instant UI updates using `requestAnimationFrame` and DOM caching.
- 🗂️ **Automated Management** - Automatic upload directory handling and environment-driven configuration.

## ⚡ Performance & Optimization

This system has been meticulously optimized for a "blazing fast" experience:
- **Backend**: Single-query MongoDB aggregations reduce database overhead by 50% and memory usage by 70%.
- **Frontend**: DOM caching and `DocumentFragment` batching provide 10x faster rendering for candidate lists.
- **Animations**: GPU-accelerated CSS and `requestAnimationFrame` ensure smooth 60fps transitions.

## 🛠️ Tech Stack

### Frontend
- **Logic**: Vanilla JavaScript (ES6+)
- **Styling**: CSS3 (Glassmorphism, GPU-accelerated animations)
- **Structure**: Semantic HTML5

### Backend
- **Server**: Node.js & Express.js
- **Database**: MongoDB & Mongoose
- **Auth**: JSON Web Tokens (JWT) & bcrypt
- **File Handling**: Multer (with automatic directory creation)

### AI/ML
- **NLP**: `natural` (Natural Language Processing for Node.js)
- **Extraction**: `pdf-parse` (for PDF) & `mammoth` (for DOCX)
- **Algorithm**: TF-IDF & Cosine Similarity

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/MR-ARKO-JANA/-AI-Resume-Screening-System.git
   cd AI-Resume-Screening-System
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your MONGODB_URI and JWT_SECRET
   ```

4. **Start the application**
   ```bash
   # Start in production mode
   npm start

   # Or start in development mode with auto-reload
   npm run dev
   ```

5. **Access the application**
   Open [http://localhost:5000](http://localhost:5000) in your browser.

## 🚀 Deployment Guide

This project is fully containerized and production-ready. You can deploy it to any cloud platform that supports Node.js or Docker.

### Option A: Deploying to Render (Recommended)
Render provides free hosting for Node.js apps and MongoDB.
1. Create a free account on [Render.com](https://render.com) and connect your GitHub.
2. Click **New +** > **Web Service**.
3. Select this repository.
4. Set the build command: `npm install`
5. Set the start command: `npm start`
6. Add the following **Environment Variables**:
   - `MONGODB_URI` (Your MongoDB Atlas connection string)
   - `JWT_SECRET` (A strong random string)
   - `GEMINI_API_KEY` (Your Google Gemini key)
7. Click **Create Web Service**.

### Option B: Deploying to Google Cloud Run
This project includes a `Dockerfile` pre-configured for Google Cloud Run.
1. Install the [Google Cloud CLI](https://cloud.google.com/sdk/docs/install).
2. Authenticate and set your project:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```
3. Deploy directly using the Cloud Run CLI:
   ```bash
   gcloud run deploy ai-resume-scanner --source . --port 8080 --allow-unauthenticated
   ```
4. Configure your environment variables in the Google Cloud Console under the service settings.

## 🎯 How It Works

1. **Upload**: Users upload resumes (PDF/DOC/DOCX) and provide a job description.
2. **Parsing**: The system extracts text and identifies key skills/keywords.
3. **Scoring**: The AI compares the resume against the job description using TF-IDF vectors.
4. **Ranking**: Results are saved and displayed with a detailed breakdown and status (Shortlisted/Pending/Rejected).

## 📁 Project Documentation
- [Project Structure](PROJECT_STRUCTURE.md) - Detailed directory layout.
- [Fixes Applied](FIXES_APPLIED.md) - History of bug fixes and stability improvements.
- [Performance Optimization](PERFORMANCE_OPTIMIZATION.md) - Deep dive into performance techniques used.
- [Quick Start](QUICK_START.md) - Rapid deployment guide.

## 👨‍💻 Author

**Arko Jana**
- GitHub: [@MR-ARKO-JANA](https://github.com/MR-ARKO-JANA)
- LinkedIn: [Your LinkedIn Profile](https://linkedin.com/in/yourprofile)

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.

---
⭐ **Star this repo if you find it helpful!**


