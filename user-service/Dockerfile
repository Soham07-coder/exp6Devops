# Stage 1: Build the Application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app

# Copy only package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Stage 2: Define the runtime image (optional but good practice for smaller size)
FROM node:18-alpine

# Set the working directory
WORKDIR /app

# Copy built artifacts from the builder stage
COPY --from=builder /app .

# Expose the port the application listens on (defined in server.js)
EXPOSE 3001

# Command to run the application when the container starts
CMD ["npm", "start"]