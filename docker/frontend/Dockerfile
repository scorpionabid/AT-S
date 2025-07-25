FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files first for better caching
COPY frontend/package*.json ./

# Install dependencies first (this layer will be cached)
RUN npm ci --legacy-peer-deps --cache /tmp/.npm || npm install --legacy-peer-deps --no-audit --no-fund

# Copy rest of frontend files
COPY frontend/ ./

# Create .env file for Docker
RUN echo "VITE_API_URL=http://localhost:8000" > .env && \
    echo "VITE_API_BASE_URL=http://localhost:8000/api" >> .env && \
    echo "VITE_APP_URL=http://localhost:3000" >> .env

# Expose port
EXPOSE 3000

# Set Node options and start dev server
ENV NODE_OPTIONS="--no-deprecation"
CMD ["npx", "vite", "--host", "0.0.0.0", "--port", "3000"]