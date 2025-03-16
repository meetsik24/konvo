# Use Node.js 18 image
FROM node:18

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Remove node_modules and package-lock.json if they exist
RUN rm -rf node_modules package-lock.json

# Set npm config to ignore platform-specific dependencies
RUN npm config set legacy-peer-deps true

# Force npm to install dependencies without architecture restrictions
RUN npm install --ignore-scripts

# Copy the rest of the application code
COPY . .

# Expose the port the app runs on
EXPOSE 5173

# Start the application
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]