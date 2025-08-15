# Frontend Dockerfile - Windows Compatible
FROM node:18-alpine AS base

# Set working directory
WORKDIR /app

# Copy package.json first for better caching
COPY package.docker.json ./package.json

# Install dependencies fresh
RUN npm install

# Copy source code
COPY . .

# Build stage
FROM base AS build

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine AS production

# Copy built files to nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration (create if doesn't exist)
RUN echo 'server { listen 3000; location / { root /usr/share/nginx/html; try_files $uri $uri/ /index.html; } }' > /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Development stage
FROM base AS development

# Expose port
EXPOSE 5173

# Start development server
CMD ["npm", "run", "dev"]
