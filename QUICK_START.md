# 🚀 Quick Start Guide - AI Resume Scanner (10/10 Pro)

## ✅ Pro Features Added!

Your application is now at a **10/10** rating with these professional features:
1.  ✅ **Bulk Resume Upload**: Upload up to 10 resumes at once.
2.  ✅ **Professional PDF Export**: Download AI analysis reports in PDF format.
3.  ✅ **AI Power-Up (Gemini)**: Contextual AI analysis using Google Gemini.

---

## 🎯 How to Run Your Application

### Step 1: Start MongoDB
Make sure MongoDB is running on your system.
```bash
mongod
```

### Step 2: Install Pro Dependencies
Install the newly added libraries for PDF generation and Gemini AI.
```bash
npm install
```

### Step 3: Configure Gemini AI (Optional but Recommended)
To enable the "AI Brain", add your API key to the `.env` file:
1.  Get a key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2.  Open your `.env` file
3.  Add this line: `GEMINI_API_KEY=your_actual_key_here`

### Step 4: Start Your Server
```bash
# Development mode (auto-reload)
npm run dev
```

### Step 5: Open Browser
Go to: **http://localhost:5000**

---

## 📝 Testing the Pro Features

### 1. Bulk Upload
- Select **multiple** PDF/DOC files (up to 10) in the dashboard.
- Enter a job description.
- The system will process all of them and redirect you to the "Candidates" list.

### 2. PDF Export
- Go to any result page (e.g., after a single upload).
- Click the **"Export Report"** button.
- A professionally formatted PDF will be generated.

### 3. Gemini AI Analysis
- If you added the `GEMINI_API_KEY`, look at the **AI Recommendation** section.
- You will see deep, contextual analysis instead of simple keyword matching.

---

## 📁 Updated File Structure
- `backend/utils/geminiService.js`: Handles Google Gemini integration.
- `frontend/js/result.js`: Handles PDF generation logic.
- `backend/server.js`: Now supports multiple file processing.

---

**Congratulations!** Your 10/10 AI Resume Screening System is ready for action. 🚀
