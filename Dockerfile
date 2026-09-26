# ─────────────────────────────────────────────────────────────
#  Dockerfile — AI Resume Screening System
#  Multi-stage build: lean production image
# ─────────────────────────────────────────────────────────────

# ── Stage 1: Install dependencies ────────────────────────────
FROM node:20-alpine AS deps

# Install native build tools needed for bcrypt, canvas, etc.
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files first for better layer caching
COPY package.json package-lock.json ./

# Install production dependencies only
RUN npm ci --omit=dev --ignore-scripts && \
    npm rebuild bcrypt --build-from-source || true


# ── Stage 2: Production image ─────────────────────────────────
FROM node:20-alpine AS runner

# Security: run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser  -S nodeapp -u 1001 -G nodejs

WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source (excluding node_modules, .env, uploads)
COPY --chown=nodeapp:nodejs . .

# Remove dev/sensitive files from image
RUN rm -rf \
    .env \
    .env.local \
    .env.development \
    backend/uploads \
    "New Resume (2) (1).pdf" \
    "New Resume (2).pdf" \
    frontend_developer_resume.pdf \
    dashboard.png \
    README.md \
    project_report.md \
    2>/dev/null || true

# Create uploads directory with correct permissions
RUN mkdir -p backend/uploads && \
    chown -R nodeapp:nodejs backend/uploads

# Switch to non-root user
USER nodeapp

# Expose the app port (Render/Railway inject PORT env var)
EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget -qO- http://localhost:${PORT:-5000}/api/health || exit 1

# Start the application
CMD ["node", "start.js"]
