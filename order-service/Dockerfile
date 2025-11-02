# Stage 1: Build (Installs dependencies)
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm install

# Copy application source code
COPY server.js .

# Stage 2: Production (Final minimal image)
FROM node:20-alpine

WORKDIR /app

# Copy only the installed dependencies and source code from the build stage
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/server.js .

# Expose the correct port
EXPOSE 3001 

# Define the command to run your application
CMD [ "node", "server.js" ]