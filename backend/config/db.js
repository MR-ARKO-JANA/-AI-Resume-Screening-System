// Database Configuration - PostgreSQL / Neon Connection Setup
const { Pool } = require('pg');

let pool = null;
let isConnected = false;

const getConnectionString = () => {
    return process.env.DATABASE_URL ||
           process.env.NEON_DATABASE_URL ||
           process.env.POSTGRES_URL ||
           process.env.PGURI ||
           '';
};

const createTables = async (client) => {
    await client.query(`
        -- Users Table
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            company VARCHAR(255) DEFAULT '',
            job_title VARCHAR(255) DEFAULT '',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Jobs Table
        CREATE TABLE IF NOT EXISTS jobs (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
            job_title VARCHAR(255) NOT NULL,
            job_description TEXT NOT NULL,
            company VARCHAR(255) DEFAULT 'Unknown Company',
            location VARCHAR(255) DEFAULT 'India',
            source VARCHAR(50) DEFAULT 'Manual',
            source_url TEXT DEFAULT '',
            salary VARCHAR(100) DEFAULT 'Not Specified',
            experience VARCHAR(100) DEFAULT 'Not Specified',
            skills_required JSONB DEFAULT '[]'::jsonb,
            is_external BOOLEAN DEFAULT FALSE,
            external_id VARCHAR(255) UNIQUE,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Resumes Table
        CREATE TABLE IF NOT EXISTS resumes (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            file_name VARCHAR(255) NOT NULL,
            file_path TEXT NOT NULL,
            upload_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Scores Table
        CREATE TABLE IF NOT EXISTS scores (
            id SERIAL PRIMARY KEY,
            user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            resume_id INTEGER REFERENCES resumes(id) ON DELETE CASCADE,
            job_id INTEGER REFERENCES jobs(id) ON DELETE SET NULL,
            match_score NUMERIC DEFAULT 0,
            status VARCHAR(50) DEFAULT 'Pending',
            ai_analysis TEXT,
            ai_confidence NUMERIC DEFAULT 0,
            experience VARCHAR(100),
            skills JSONB DEFAULT '[]'::jsonb,
            scoring_breakdown JSONB DEFAULT '{}'::jsonb,
            candidate_name VARCHAR(255) DEFAULT '',
            github_url TEXT DEFAULT '',
            linkedin_url TEXT DEFAULT '',
            linkedin_data JSONB DEFAULT NULL,
            github_data JSONB DEFAULT NULL,
            education JSONB DEFAULT '[]'::jsonb,
            projects JSONB DEFAULT '[]'::jsonb,
            target_role VARCHAR(255) DEFAULT 'Frontend Developer',
            matched_skills JSONB DEFAULT '[]'::jsonb,
            missing_skills JSONB DEFAULT '[]'::jsonb,
            ats_score NUMERIC DEFAULT 75,
            ats_breakdown JSONB DEFAULT NULL,
            learning_roadmap JSONB DEFAULT NULL,
            resume_improvements JSONB DEFAULT NULL,
            mock_questions JSONB DEFAULT NULL,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Help Support Messages Table
        CREATE TABLE IF NOT EXISTS help_messages (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL,
            subject VARCHAR(255) NOT NULL,
            message TEXT NOT NULL,
            created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );

        -- Performance Indexes
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
        CREATE INDEX IF NOT EXISTS idx_jobs_user_id ON jobs(user_id);
        CREATE INDEX IF NOT EXISTS idx_jobs_is_external ON jobs(is_external);
        CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
        CREATE INDEX IF NOT EXISTS idx_scores_user_id ON scores(user_id);
        CREATE INDEX IF NOT EXISTS idx_scores_status ON scores(status);
        CREATE INDEX IF NOT EXISTS idx_scores_created_date ON scores(created_date DESC);
    `);
};

const connectDB = async () => {
    const connectionString = getConnectionString();

    if (!connectionString) {
        console.warn('⚠️ WARNING: No PostgreSQL/Neon DATABASE_URL found in environment variables.');
        console.warn('Set DATABASE_URL=postgresql://user:pass@ep-xyz.neon.tech/neondb?sslmode=require in .env');
        isConnected = false;
        return null;
    }

    const isLocalhost = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    let formattedConnectionString = connectionString;
    if (!formattedConnectionString.includes('uselibpqcompat=true') && formattedConnectionString.includes('sslmode=')) {
        formattedConnectionString += (formattedConnectionString.includes('?') ? '&' : '?') + 'uselibpqcompat=true';
    }

    pool = new Pool({
        connectionString: formattedConnectionString,
        ssl: isLocalhost ? false : { rejectUnauthorized: false },
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 8000
    });

    pool.on('error', (err) => {
        console.error('Unexpected error on idle PostgreSQL client', err);
    });

    try {
        const client = await pool.connect();
        try {
            const res = await client.query('SELECT NOW() as current_time, current_database() as db_name');
            console.log(`✅ Neon PostgreSQL connected successfully! DB: ${res.rows[0].db_name} (${res.rows[0].current_time})`);
            
            // Auto-initialize schema and tables if they don't exist
            await createTables(client);
            console.log('✅ PostgreSQL database tables verified/initialized.');
            isConnected = true;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('❌ PostgreSQL / Neon connection error:', err.message);
        isConnected = false;
    }

    return pool;
};

const getPool = () => pool;
const isDBConnected = () => isConnected;

const query = async (text, params) => {
    if (!pool) {
        throw new Error('Database pool not initialized. Please ensure DATABASE_URL is configured.');
    }
    return pool.query(text, params);
};

module.exports = {
    connectDB,
    getPool,
    isDBConnected,
    query
};
