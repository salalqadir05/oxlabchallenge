# Use official Node.js image as the base image
FROM node:20-slim

# Set the working directory inside the container
WORKDIR index.js

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install 

# Copy the rest of the application code to the container
COPY . .

# Set environment variables (if required)
# Example: Set environment variable for the database URL
# ENV DATABASE_URL='your-database-url-here'

# Expose the port your backend will run on
EXPOSE 8000

# Command to start the backend server (adjust as per your entry point)
CMD ["node", "index.js"]
