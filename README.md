# 🤖 AI Resume Screening System 
Deployed Link:- https://ai-resume-scanner-127178207448.us-central1.run.app

An intelligent resume screening platform that uses AI/ML algorithms to automatically analyze and rank candidates based on job requirements.

![Project Banner](https://via.placeholder.com/1200x400/667eea/ffffff?text=AI+Resume+Screening+System)

## ✨ Features

### Core Functionality
- 📄 **Smart Resume Parsing** - Extracts text from PDF/DOC files
- 🎯 **AI-Powered Matching** - Uses NLP and TF-IDF algorithms
- 📊 **Transparent Scoring** - 60% Skills + 30% Keywords + 10% Experience
- 🏆 **Candidate Ranking** - Automatically ranks by match score
- 🎨 **Beautiful UI/UX** - Modern glass morphism design with animations

### Technical Features
- 🔐 **Secure Authentication** - JWT-based auth with bcrypt
- 📈 **Real-time Analysis** - Instant resume screening results
- 🎨 **Dynamic Visualizations** - Animated progress bars with color coding
- 📱 **Responsive Design** - Works on all devices
- 🗂️ **Multi-user Support** - Each user has their own dashboard

## 🛠️ Tech Stack

### Frontend
- HTML5, CSS3, JavaScript (Vanilla)
- Glass Morphism UI Design
- Responsive Layout

### Backend
- Node.js & Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (File Upload)

### AI/ML Libraries
- `pdf-parse` - PDF text extraction
- `natural` - Natural Language Processing
- TF-IDF Algorithm
- Cosine Similarity

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Setup Steps

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/ai-resume-scanner.git
cd ai-resume-scanner
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

4. **Start MongoDB** (if using local)
```bash
mongod
```

5. **Run the application**
```bash
node backend/server.js
```

6. **Open in browser**
```
http://localhost:5000
```

## 🎯 How It Works

### 1. Upload Resume
Users upload a PDF/DOC resume along with a job description.

### 2. AI Analysis
The system:
- Extracts text from the resume
- Identifies skills using a comprehensive database
- Matches keywords using TF-IDF
- Analyzes experience indicators

### 3. Scoring Algorithm
```
Total Score = (Skill Match × 60%) + (Keyword Match × 30%) + (Experience × 10%)
```

### 4. Results
- Match score (0-100%)
- Status (Shortlisted/Pending/Rejected)
- Detailed breakdown
- AI recommendations

## 📸 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x500/667eea/ffffff?text=Dashboard)

### Results Page
![Results](https://via.placeholder.com/800x500/667eea/ffffff?text=Results)

### Candidates List
![Candidates](https://via.placeholder.com/800x500/667eea/ffffff?text=Candidates)

## 🚀 Future Enhancements

- [ ] Email notifications
- [ ] Bulk resume upload
- [ ] Export to CSV/PDF
- [ ] Advanced analytics dashboard
- [ ] Resume comparison feature
- [ ] Integration with job boards
- [ ] Mobile app

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Arko Jana**

- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

## 🙏 Acknowledgments

- Natural.js for NLP capabilities
- pdf-parse for PDF processing
- MongoDB for database
- Express.js for backend framework

---

⭐ Star this repo if you find it helpful!
