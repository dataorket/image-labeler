# Use Node.js 20 LTS
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (all, including dev for building)
RUN npm ci

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# List dist folder to verify build
RUN ls -la dist/

# Expose port (Cloud Run uses PORT env var)
EXPOSE 8080

# Start the server
CMD ["node", "dist/server.js"]
