# SlayPay Docker Image
# Backend (Node.js) + AI Agent (Python)

FROM python:3.11-slim

# Install Node.js 18.x
RUN apt-get update && apt-get install -y \
    curl \
    && curl -fsSL https://deb.nodesource.com/setup_18.x | bash - \
    && apt-get install -y nodejs \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy entire repository
COPY . .

# Install Python dependencies
WORKDIR /app/agent
RUN pip install --no-cache-dir -r requirements.txt

# Install Node.js dependencies
WORKDIR /app/backend
RUN npm install --production

# Create logs directory
WORKDIR /app
RUN mkdir -p logs

# Expose ports
# 3001: Backend API
# 3002: AI Agent API
EXPOSE 3001 3002

# Make start script executable
RUN chmod +x start-docker.sh

# Use start-docker.sh as entrypoint
CMD ["./start-docker.sh"]
