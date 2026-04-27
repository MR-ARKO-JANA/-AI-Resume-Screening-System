FROM node:20-alpine
WORKDIR /usr/src/app
# Install dependencies
COPY package*.json ./
RUN npm install --production
# Copy application code
COPY . .
# Expose Cloud Run default port
EXPOSE 8080
ENV PORT=8080
# Start the application
CMD [ "npm", "start" ]
