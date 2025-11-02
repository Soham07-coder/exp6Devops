# Stage 1: Build the Application
FROM node:18-alpine AS builder

# Set the working directory inside the container
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Stage 2: Define the runtime image
FROM node:18-alpine

WORKDIR /app
COPY --from=builder /app .

# Expose the port the application listens on (defined in server.js)
EXPOSE 3002

# Command to run the application when the container starts
CMD ["npm", "start"]