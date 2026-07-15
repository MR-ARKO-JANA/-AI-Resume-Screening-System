# Build React frontend
FROM node:20-alpine as build
WORKDIR /app/frontend-react
COPY frontend-react/package*.json ./
RUN npm install
COPY frontend-react/ ./
RUN npm run build

# Setup Node.js backend
FROM node:20-alpine
WORKDIR /usr/src/app

# Install backend dependencies
COPY package*.json ./
RUN npm install --production

# Copy application code (backend and other root files)
COPY . .

# Copy built React files from the build stage
COPY --from=build /app/frontend-react/dist ./frontend-react/dist

# Expose Cloud Run default port
EXPOSE 8080
ENV PORT=8080

# Start the application
CMD [ "npm", "start" ]
