# Use Node.js 16 Alpine base image
FROM node:16-alpine

# Set the working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy the rest of the application
COPY . .

# Expose port 3001
EXPOSE 3001

# Start the application
CMD ["npm", "start"]