# Use Node.js 18 LTS
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm install typescript @types/node --save-dev && npm run build

# Expose port
EXPOSE 8080

# Start the server
CMD ["npm", "start"]
