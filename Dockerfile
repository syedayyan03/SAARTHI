# Use a stable base image containing both Python 3.11 and Node.js 20
FROM nikolaik/python-nodejs:python3.11-nodejs20

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first to leverage Docker layer caching
COPY package*.json ./
COPY requirements.txt ./

# Install Node.js production dependencies
RUN npm ci --only=production

# Install Python requirements
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the application files
COPY . .

# Create directory for temporary uploads if it doesn't exist
RUN mkdir -p temp_uploads data models

# Expose port 3000 (which Express is listening on)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# Start the Node.js server
CMD ["node", "server.js"]
