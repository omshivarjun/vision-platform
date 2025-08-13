# Dockerfile for Vision Mobile App (Development)
FROM node:18-alpine

# Install Expo CLI globally
RUN npm install -g @expo/cli

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy source code
COPY . .

# Expose Expo dev server port
EXPOSE 19000

# Start Expo development server
CMD ["npx", "expo", "start", "--host", "0.0.0.0"]
