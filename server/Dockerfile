# Use official Playwright image as base (contains Node and all browser deps)
FROM mcr.microsoft.com/playwright:v1.50.1-jammy

# Create app directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN npm run build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=10000
# Playwright browsers are already in the image, so skip download
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 
# Helps with memory management on Render's 512MB limit
ENV NODE_OPTIONS="--max-old-space-size=400"

# Expose port
EXPOSE 10000

# Start server
CMD ["npm", "start"]
