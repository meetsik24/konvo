# Use Node.js 20 for building the project
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies with legacy peer deps to avoid conflicts
RUN npm install --legacy-peer-deps

# Copy the rest of the application code
COPY . .

# Build the Vite project with increased memory
RUN NODE_OPTIONS="--max-old-space-size=4096" npm run build

# Use a lightweight Node.js server for serving static files
FROM node:20-alpine AS runner

# Set working directory in final container
WORKDIR /app

# Install a static file server
RUN npm install -g serve

# Copy built files from previous stage
COPY --from=builder /app/dist /app/dist

# Expose port 5173 (or any other port you prefer)
EXPOSE 5173

# Start the server to serve built Vite files
CMD ["serve", "-s", "dist", "-l", "5173"]