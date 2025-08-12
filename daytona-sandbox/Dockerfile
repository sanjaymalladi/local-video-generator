# Use Python 3.9 slim image as base
FROM python:3.9-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV DEBIAN_FRONTEND=noninteractive

# Install system dependencies for Manim
RUN apt-get update && apt-get install -y \
    # Core dependencies
    build-essential \
    cmake \
    pkg-config \
    \
    # Graphics and rendering
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    libgirepository1.0-dev \
    libgif-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    libwebp-dev \
    \
    # Fonts and text rendering
    fonts-liberation \
    fonts-dejavu \
    \
    # Additional utilities
    git \
    curl \
    wget \
    \
    # Clean up
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set working directory
WORKDIR /app

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create necessary directories
RUN mkdir -p /app/logs /app/temp

# Set permissions
RUN chmod +x app.py

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the application
CMD ["python", "app.py"] 