# Stage 1: Build the Application
# Uses node:18-alpine as requested
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY server.js .

# Stage 2: Define the runtime image (Final minimal image)
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app .

# Expose the port the application listens on (3001 from your server.js)
EXPOSE 3001

# Command to run the application when the container starts
# This requires a 'start' script in package.json
CMD ["npm", "start"]
