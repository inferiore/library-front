# Development Dockerfile for React application
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies for development)
RUN npm install

# Expose port 3000 for React development server
EXPOSE 3000

# Start the development server
CMD ["npm", "start"]