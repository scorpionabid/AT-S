FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy all frontend files
COPY frontend/ ./

# Create .env file for Docker
RUN echo "VITE_API_URL=http://localhost:8000" > .env

# Install dependencies (use existing node_modules if available)
RUN npm install --legacy-peer-deps 2>/dev/null || echo "NPM install failed, continuing..."

# Expose port
EXPOSE 3000

# Set Node options and start dev server
ENV NODE_OPTIONS="--no-deprecation"
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]