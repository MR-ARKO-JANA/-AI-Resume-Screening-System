/**
 * AI Resume Screening System - Production & Deployment Troubleshooter
 * Copyright 2026 AI Recruiter
 */

require('dotenv').config();
const { exec } = require('child_process');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Color helpers for terminal
const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    cyan: "\x1b[36m",
    blue: "\x1b[34m"
};

function logHeader(title) {
    console.log(`\n${colors.bright}${colors.cyan}================================================================${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}  ${title}${colors.reset}`);
    console.log(`${colors.bright}${colors.cyan}================================================================${colors.reset}`);
}

function runCmd(command) {
    return new Promise((resolve) => {
        exec(command, (error, stdout, stderr) => {
            resolve({
                success: !error,
                stdout: stdout ? stdout.trim() : '',
                stderr: stderr ? stderr.trim() : ''
            });
        });
    });
}

async function testLocalMongo() {
    console.log(`\n${colors.bright}[1/5] Checking Local MongoDB Connection...${colors.reset}`);
    const localURI = 'mongodb://localhost:27017/ai_resume_screening';
    try {
        const conn = await mongoose.createConnection(localURI, { serverSelectionTimeoutMS: 3000 }).asPromise();
        await conn.close();
        console.log(`  ${colors.green}✅ Local MongoDB is running and connected successfully!${colors.reset}`);
        return true;
    } catch (err) {
        console.log(`  ${colors.red}❌ Local MongoDB is NOT running or accessible.${colors.reset}`);
        console.log(`     Error details: ${err.message}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Run "mongod" in your command line to start MongoDB locally.${colors.reset}`);
        return false;
    }
}

async function testAtlasMongo() {
    console.log(`\n${colors.bright}[2/5] Checking Deployed MongoDB Atlas Connection...${colors.reset}`);
    
    // Retrieve Atlas URI from gcloud environment variables if not locally configured to Atlas
    let atlasURI = process.env.MONGODB_URI;
    
    console.log(`     Fetching MONGODB_URI from your live Cloud Run service configuration...`);
    const gcloudEnv = await runCmd('gcloud run services describe ai-resume-scanner --region us-central1 --format="value(spec.template.spec.containers[0].env)"');
    
    if (gcloudEnv.success && gcloudEnv.stdout) {
        // Parse the MONGODB_URI from gcloud output format
        const lines = gcloudEnv.stdout.split(';');
        for (const line of lines) {
            if (line.startsWith('MONGODB_URI=')) {
                atlasURI = line.substring('MONGODB_URI='.length);
                break;
            }
        }
    }
    
    if (!atlasURI || atlasURI.includes('localhost')) {
        // Fallback to searching inside command outputs
        const describeFull = await runCmd('gcloud run services describe ai-resume-scanner --region us-central1');
        const match = describeFull.stdout.match(/MONGODB_URI\s+(mongodb\+srv:\/\/[^\s]+)/);
        if (match && match[1]) {
            atlasURI = match[1];
        }
    }

    if (!atlasURI) {
        console.log(`  ${colors.yellow}⚠️  Could not retrieve MongoDB Atlas URI from Cloud Run config.${colors.reset}`);
        console.log(`     Using local/default fallback database connection for verification...`);
        atlasURI = process.env.MONGODB_URI;
    }

    if (!atlasURI || atlasURI.includes('localhost')) {
        console.log(`  ${colors.yellow}⚠️  No MongoDB Atlas URI configured. Skipping live database connection test.${colors.reset}`);
        return false;
    }

    const maskedURI = atlasURI.replace(/:([^@]+)@/, ':******@');
    console.log(`     Testing connection to: ${colors.cyan}${maskedURI}${colors.reset}`);

    try {
        const conn = await mongoose.createConnection(atlasURI, { serverSelectionTimeoutMS: 6000 }).asPromise();
        await conn.close();
        console.log(`  ${colors.green}✅ Connected to MongoDB Atlas successfully from this machine!${colors.reset}`);
        return true;
    } catch (err) {
        console.log(`  ${colors.red}❌ Failed to connect to MongoDB Atlas.${colors.reset}`);
        console.log(`     Error details: ${err.message}`);
        console.log(`     ${colors.yellow}👉 Recommendation: This could be due to IP Whitelisting restrictions in MongoDB Atlas.${colors.reset}`);
        console.log(`        1. Log into your MongoDB Atlas Console (https://cloud.mongodb.com).`);
        console.log(`        2. Go to "Network Access" under the Security section.`);
        console.log(`        3. Click "Add IP Address" and select "Allow Access from Anywhere" (adds 0.0.0.0/0).`);
        return false;
    }
}

async function testGemini() {
    console.log(`\n${colors.bright}[3/5] Checking Google Gemini API Key...${colors.reset}`);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'your_gemini_api_key_here') {
        console.log(`  ${colors.red}❌ Gemini API key is missing or set to placeholder in .env file.${colors.reset}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Please add a valid "GEMINI_API_KEY" to your .env file.${colors.reset}`);
        return false;
    }

    try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent("Hello!");
        const response = await result.response;
        const text = response.text();
        if (text) {
            console.log(`  ${colors.green}✅ Gemini API Key is valid and responding! (Response preview: "${text.trim().substring(0, 30)}...")${colors.reset}`);
            return true;
        }
    } catch (err) {
        console.log(`  ${colors.red}❌ Gemini API check failed.${colors.reset}`);
        console.log(`     Error: ${err.message}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Your API key appears to be invalid or expired.`);
        console.log(`        Get a new free Gemini API key from Google AI Studio:`);
        console.log(`        https://aistudio.google.com/app/apikey${colors.reset}`);
    }
    return false;
}

async function checkCloudRunBilling() {
    console.log(`\n${colors.bright}[4/5] Checking Google Cloud Run Deployment & Billing status...${colors.reset}`);
    
    // Check if gcloud CLI is installed
    const gcloudVer = await runCmd('gcloud --version');
    if (!gcloudVer.success) {
        console.log(`  ${colors.red}❌ gcloud CLI is not installed or not in your system PATH.${colors.reset}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Install Google Cloud SDK: https://cloud.google.com/sdk/docs/install${colors.reset}`);
        return false;
    }
    console.log(`  ${colors.green}✅ gcloud CLI is installed.${colors.reset}`);

    // Check current active GCP project
    const activeProject = await runCmd('gcloud config get-value project');
    if (!activeProject.success || !activeProject.stdout) {
        console.log(`  ${colors.red}❌ No active Google Cloud project set.${colors.reset}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Run "gcloud config set project YOUR_PROJECT_ID"${colors.reset}`);
        return false;
    }
    const projectId = activeProject.stdout;
    console.log(`  ${colors.green}✅ Active Google Cloud Project:${colors.reset} ${colors.cyan}${projectId}${colors.reset}`);

    // Check Billing Status of the project
    console.log(`     Checking billing configuration for project ${colors.cyan}${projectId}${colors.reset}...`);
    const billingInfo = await runCmd(`gcloud billing projects describe ${projectId}`);
    
    if (billingInfo.success && billingInfo.stdout) {
        const billingEnabled = billingInfo.stdout.includes('billingEnabled: true');
        if (billingEnabled) {
            console.log(`  ${colors.green}✅ Billing is ENABLED for this project.${colors.reset}`);
            return true;
        } else {
            console.log(`  ${colors.red}❌ Billing is DISABLED for this project!${colors.reset}`);
            console.log(`     ${colors.yellow}👉 CRITICAL REQUIREMENT: Google Cloud Run requires an active billing account linked to the project.`);
            console.log(`        This is why your website is currently not live and returns a 503 error.`);
            console.log(`        Link a billing account here: https://console.cloud.google.com/billing/projects?project=${projectId}${colors.reset}`);
            return false;
        }
    } else {
        console.log(`  ${colors.red}❌ Failed to query billing status.${colors.reset}`);
        console.log(`     Error details: ${billingInfo.stderr}`);
        console.log(`     ${colors.yellow}👉 Recommendation: Ensure you are logged in by running "gcloud auth login" and have Billing Administrator rights.${colors.reset}`);
        return false;
    }
}

async function checkCloudRunLogs() {
    console.log(`\n${colors.bright}[5/5] Fetching Live Cloud Run Errors...${colors.reset}`);
    const logs = await runCmd('gcloud logging read "resource.type=cloud_run_revision AND severity>=WARNING" --limit=5 --format="value(textPayload)"');
    
    if (logs.success && logs.stdout) {
        console.log(`  ${colors.yellow}⚠️  Recent warnings/errors found in your deployed service logs:${colors.reset}`);
        console.log(`----------------------------------------------------------------`);
        console.log(colors.yellow + logs.stdout.split('\n').map(l => '     ' + l).join('\n') + colors.reset);
        console.log(`----------------------------------------------------------------`);
    } else {
        console.log(`  ${colors.green}✅ No recent warnings/errors retrieved from Google Cloud Run logs.${colors.reset}`);
    }
}

async function run() {
    logHeader("AI RESUME SCANNER - SYSTEM DIAGNOSTIC & TROUBLESHOOTER");
    
    const localMongoOk = await testLocalMongo();
    const atlasMongoOk = await testAtlasMongo();
    const geminiOk = await testGemini();
    const billingOk = await checkCloudRunBilling();
    if (billingOk) {
        await checkCloudRunLogs();
    }

    logHeader("DIAGNOSTIC SUMMARY & ACTIONS REQUIRED");
    
    let actionsNeeded = false;
    
    if (!billingOk) {
        actionsNeeded = true;
        console.log(`${colors.bright}${colors.red}[ACTION 1] ENABLE GCP BILLING${colors.reset}`);
        console.log(`  - Your Cloud Run instance is suspended because your Google Cloud Project billing is disabled.`);
        console.log(`  - ${colors.bright}How to fix:${colors.reset} Click this link to link a billing account:`);
        console.log(`    ${colors.blue}https://console.cloud.google.com/billing/projects?project=skilled-fulcrum-479219-g6${colors.reset}\n`);
    }
    
    if (!geminiOk) {
        actionsNeeded = true;
        console.log(`${colors.bright}${colors.red}[ACTION 2] UPDATE GEMINI API KEY${colors.reset}`);
        console.log(`  - Your Gemini AI API Key is invalid or has expired.`);
        console.log(`  - ${colors.bright}How to fix:${colors.reset} Get a new free key from Google AI Studio:`);
        console.log(`    ${colors.blue}https://aistudio.google.com/app/apikey${colors.reset}`);
        console.log(`    And update it in your local .env file and in your Cloud Run environment variables.\n`);
    }

    if (!atlasMongoOk) {
        actionsNeeded = true;
        console.log(`${colors.bright}${colors.red}[ACTION 3] ENABLE MONGO ATLAS IP ACCESS${colors.reset}`);
        console.log(`  - The database connection could not be established.`);
        console.log(`  - ${colors.bright}How to fix:${colors.reset} Log in to MongoDB Atlas (https://cloud.mongodb.com), go to Network Access,`);
        console.log(`    and add '0.0.0.0/0' to allow connections from Cloud Run's dynamic IPs.\n`);
    }

    if (!localMongoOk) {
        actionsNeeded = true;
        console.log(`${colors.bright}${colors.yellow}[ACTION 4] START LOCAL MONGO FOR LOCAL DEVELOPMENT${colors.reset}`);
        console.log(`  - To run and test the app locally, run the "mongod" command to start your local database server.\n`);
    }

    if (!actionsNeeded) {
        console.log(`${colors.bright}${colors.green}🎉 All checks passed! Your configuration is healthy and ready to serve.${colors.reset}`);
        console.log(`   - Live site: https://ai-resume-scanner-127178207448.us-central1.run.app`);
        console.log(`   - Local development server: http://localhost:5000`);
    } else {
        console.log(`${colors.bright}${colors.yellow}Please resolve the actions listed above to bring your website live.${colors.reset}`);
        console.log(`Once resolved, redeploy with:`);
        console.log(`  ${colors.bright}gcloud run deploy ai-resume-scanner --source . --port 8080 --allow-unauthenticated --region us-central1${colors.reset}`);
    }
    
    console.log(`\n${colors.bright}${colors.cyan}================================================================${colors.reset}\n`);
    process.exit(0);
}

run();
