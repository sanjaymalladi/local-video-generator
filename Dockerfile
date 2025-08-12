# Multi-stage Docker build for video generation service
FROM python:3.9-slim as python-base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    ffmpeg \
    libcairo2-dev \
    libpango1.0-dev \
    pkg-config \
    python3-dev \
    build-essential \
    git \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

# Copy Python requirements
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Install Manim voiceover with Coqui
RUN pip install --no-cache-dir "manim-voiceover[coqui]"

# Download TTS models (this will cache them in the image)
RUN python -c "from TTS.api import TTS; TTS('tts_models/en/ljspeech/tacotron2-DDC')" || echo "TTS model download failed, will download at runtime"

# Create directories
RUN mkdir -p /app/temp /app/data/videos /app/logs

# Copy the video processing service
COPY video-service/ .

# Expose port
EXPOSE 8000

# Run the video processing service
CMD ["python", "main.py"]