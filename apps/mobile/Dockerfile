# Dockerfile for Vision Mobile App
FROM node:18-alpine AS base

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies with legacy peer deps to resolve conflicts
RUN npm install --legacy-peer-deps

# Copy source code
COPY . .

# Development stage
FROM base AS development

# Expose Expo dev server port
EXPOSE 19000

# Start Expo development server
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]

# Production stage
FROM base AS production

# Expose Expo dev server port
EXPOSE 19000

# Start Expo development server
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]
