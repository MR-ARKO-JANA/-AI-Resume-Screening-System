# Commit script - 30 meaningful commits

# 1. Add .editorconfig
@"
root = true

[*]
indent_style = space
indent_size = 2
end_of_line = lf
charset = utf-8
trim_trailing_whitespace = true
insert_final_newline = true
"@ | Out-File -Encoding utf8 ".editorconfig"
git add . ; git commit -m "chore: add .editorconfig for consistent code formatting"

# 2. Add .prettierrc
@"
{
  "semi": true,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5"
}
"@ | Out-File -Encoding utf8 ".prettierrc"
git add . ; git commit -m "chore: add .prettierrc configuration file"

# 3. Add .env.example
@"
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
GEMINI_API_KEY=your_gemini_api_key
"@ | Out-File -Encoding utf8 ".env.example"
git add . ; git commit -m "docs: add .env.example for environment variable reference"

# 4. Add SECURITY.md
@"
# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability, please report it responsibly via email.

## Supported Versions

| Version | Supported |
| ------- | --------- |
| 2.0.x   | Yes       |
| 1.0.x   | No        |
"@ | Out-File -Encoding utf8 "SECURITY.md"
git add . ; git commit -m "docs: add SECURITY.md for vulnerability reporting"

# 5. Add robots.txt
@"
User-agent: *
Allow: /
Sitemap: /sitemap.xml
"@ | Out-File -Encoding utf8 "frontend/robots.txt"
git add . ; git commit -m "seo: add robots.txt for search engine crawling"

# 6. Add header comment to server.js
$serverContent = Get-Content "backend/server.js" -Raw
$header = "// AI Resume Screening System - Main Server Entry Point`r`n// Copyright 2024 AI Recruiter`r`n`r`n"
Set-Content "backend/server.js" -Value ($header + $serverContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to server.js"

# 7. Add header comment to dashboard.js
$dashContent = Get-Content "frontend/js/dashboard.js" -Raw
$header2 = "// Dashboard UI Logic - Handles drag-drop, file upload, and sidebar`r`n`r`n"
Set-Content "frontend/js/dashboard.js" -Value ($header2 + $dashContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to dashboard.js"

# 8. Add header comment to templates.js
$templContent = Get-Content "frontend/js/templates.js" -Raw
$header3 = "// Templates Library - Tab filtering and sidebar interactions`r`n`r`n"
Set-Content "frontend/js/templates.js" -Value ($header3 + $templContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to templates.js"

# 9. Add header comment to jobs.js
$jobsContent = Get-Content "frontend/js/jobs.js" -Raw
$header4 = "// Jobs Page - Job listing, syncing, and modal interactions`r`n`r`n"
Set-Content "frontend/js/jobs.js" -Value ($header4 + $jobsContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to jobs.js"

# 10. Add CSS header to templates.css
$cssContent = Get-Content "frontend/css/templates.css" -Raw
$cssHeader = "/* ===========================`r`n   Templates Library Styles`r`n   AI Recruiter v2.0`r`n   =========================== */`r`n`r`n"
Set-Content "frontend/css/templates.css" -Value ($cssHeader + $cssContent) -NoNewline
git add . ; git commit -m "style: add header comment block to templates.css"

# 11. Add header to result-ultra.js
$resultContent = Get-Content "frontend/js/result-ultra.js" -Raw
$header5 = "// Result Page - AI score display and candidate analysis`r`n`r`n"
Set-Content "frontend/js/result-ultra.js" -Value ($header5 + $resultContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to result-ultra.js"

# 12. Add header to candidates.js
$candContent = Get-Content "frontend/js/candidates.js" -Raw
$header6 = "// Candidates Page - Candidate listing and management`r`n`r`n"
Set-Content "frontend/js/candidates.js" -Value ($header6 + $candContent) -NoNewline
git add . ; git commit -m "docs: add module header comment to candidates.js"

# 13. Add header to auth controller
$authContent = Get-Content "backend/controllers/auth.controller.js" -Raw
$header7 = "// Auth Controller - Handles login, register, and JWT authentication`r`n`r`n"
Set-Content "backend/controllers/auth.controller.js" -Value ($header7 + $authContent) -NoNewline
git add . ; git commit -m "docs: add header comment to auth controller"

# 14. Add header to resume controller
$resumeContent = Get-Content "backend/controllers/resume.controller.js" -Raw
$header8 = "// Resume Controller - Handles file upload and AI screening logic`r`n`r`n"
Set-Content "backend/controllers/resume.controller.js" -Value ($header8 + $resumeContent) -NoNewline
git add . ; git commit -m "docs: add header comment to resume controller"

# 15. Add header to job controller
$jobCtrlContent = Get-Content "backend/controllers/job.controller.js" -Raw
$header9 = "// Job Controller - Handles job CRUD and sync operations`r`n`r`n"
Set-Content "backend/controllers/job.controller.js" -Value ($header9 + $jobCtrlContent) -NoNewline
git add . ; git commit -m "docs: add header comment to job controller"

# 16. Add header to dashboard controller
$dashCtrlContent = Get-Content "backend/controllers/dashboard.controller.js" -Raw
$header10 = "// Dashboard Controller - Handles dashboard data and statistics`r`n`r`n"
Set-Content "backend/controllers/dashboard.controller.js" -Value ($header10 + $dashCtrlContent) -NoNewline
git add . ; git commit -m "docs: add header comment to dashboard controller"

# 17. Add header to profile controller
$profContent = Get-Content "backend/controllers/profile.controller.js" -Raw
$header11 = "// Profile Controller - Handles profile lookup and candidate search`r`n`r`n"
Set-Content "backend/controllers/profile.controller.js" -Value ($header11 + $profContent) -NoNewline
git add . ; git commit -m "docs: add header comment to profile controller"

# 18. Add header to db config
$dbContent = Get-Content "backend/config/db.js" -Raw
$header12 = "// Database Configuration - MongoDB connection setup`r`n`r`n"
Set-Content "backend/config/db.js" -Value ($header12 + $dbContent) -NoNewline
git add . ; git commit -m "docs: add header comment to database config"

# 19. Add header to geminiService
$gemContent = Get-Content "backend/utils/geminiService.js" -Raw
$header13 = "// Gemini AI Service - Handles AI API calls for resume analysis`r`n`r`n"
Set-Content "backend/utils/geminiService.js" -Value ($header13 + $gemContent) -NoNewline
git add . ; git commit -m "docs: add header comment to gemini service utility"

# 20. Add header to securityHeaders middleware
$secContent = Get-Content "backend/middleware/securityHeaders.js" -Raw
$header14 = "// Security Headers Middleware - Sets HTTP security headers`r`n`r`n"
Set-Content "backend/middleware/securityHeaders.js" -Value ($header14 + $secContent) -NoNewline
git add . ; git commit -m "docs: add header comment to security middleware"

# 21. Add header to requestLogger middleware
$logContent = Get-Content "backend/middleware/requestLogger.js" -Raw
$header15 = "// Request Logger Middleware - Logs incoming HTTP requests`r`n`r`n"
Set-Content "backend/middleware/requestLogger.js" -Value ($header15 + $logContent) -NoNewline
git add . ; git commit -m "docs: add header comment to request logger middleware"

# 22. Add header to usermodels
$userContent = Get-Content "backend/models/usermodels.js" -Raw
$header16 = "// User Model - Mongoose schema for user accounts`r`n`r`n"
Set-Content "backend/models/usermodels.js" -Value ($header16 + $userContent) -NoNewline
git add . ; git commit -m "docs: add header comment to user model"

# 23. Add header to scoreModel
$scoreContent = Get-Content "backend/models/scoreModel.js" -Raw
$header17 = "// Score Model - Mongoose schema for resume screening scores`r`n`r`n"
Set-Content "backend/models/scoreModel.js" -Value ($header17 + $scoreContent) -NoNewline
git add . ; git commit -m "docs: add header comment to score model"

# 24. Add header to jobModel
$jobModelContent = Get-Content "backend/models/jobModel.js" -Raw
$header18 = "// Job Model - Mongoose schema for job listings`r`n`r`n"
Set-Content "backend/models/jobModel.js" -Value ($header18 + $jobModelContent) -NoNewline
git add . ; git commit -m "docs: add header comment to job model"

# 25. Add header to auth routes
$authRouteContent = Get-Content "backend/routes/auth.routes.js" -Raw
$header19 = "// Auth Routes - Login, register, and logout endpoints`r`n`r`n"
Set-Content "backend/routes/auth.routes.js" -Value ($header19 + $authRouteContent) -NoNewline
git add . ; git commit -m "docs: add header comment to auth routes"

# 26. Add header to resume routes
$resumeRouteContent = Get-Content "backend/routes/resume.routes.js" -Raw
$header20 = "// Resume Routes - Upload and screening endpoints`r`n`r`n"
Set-Content "backend/routes/resume.routes.js" -Value ($header20 + $resumeRouteContent) -NoNewline
git add . ; git commit -m "docs: add header comment to resume routes"

# 27. Add header to dashboard routes
$dashRouteContent = Get-Content "backend/routes/dashboard.routes.js" -Raw
$header21 = "// Dashboard Routes - Stats and analytics endpoints`r`n`r`n"
Set-Content "backend/routes/dashboard.routes.js" -Value ($header21 + $dashRouteContent) -NoNewline
git add . ; git commit -m "docs: add header comment to dashboard routes"

# 28. Add header to profile routes
$profRouteContent = Get-Content "backend/routes/profile.routes.js" -Raw
$header22 = "// Profile Routes - Candidate lookup and search endpoints`r`n`r`n"
Set-Content "backend/routes/profile.routes.js" -Value ($header22 + $profRouteContent) -NoNewline
git add . ; git commit -m "docs: add header comment to profile routes"

# 29. Add header to job routes
$jobRouteContent = Get-Content "backend/routes/job.routes.js" -Raw
$header23 = "// Job Routes - Job CRUD and sync endpoints`r`n`r`n"
Set-Content "backend/routes/job.routes.js" -Value ($header23 + $jobRouteContent) -NoNewline
git add . ; git commit -m "docs: add header comment to job routes"

# 30. Add header to dashboard-ultra.css
$dashCssContent = Get-Content "frontend/css/dashboard-ultra.css" -Raw
$cssHeader2 = "/* ===========================`r`n   Dashboard Ultra Styles`r`n   AI Recruiter v2.0`r`n   =========================== */`r`n`r`n"
Set-Content "frontend/css/dashboard-ultra.css" -Value ($cssHeader2 + $dashCssContent) -NoNewline
git add . ; git commit -m "style: add header comment block to dashboard-ultra.css"

Write-Host "`nAll 30 commits completed!"
