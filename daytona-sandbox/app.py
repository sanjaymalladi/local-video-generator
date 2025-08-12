#!/usr/bin/env python3
"""
Daytona Sandbox - Manim Video Generation API
A Flask API service for generating videos using Manim
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import tempfile
import os
import subprocess
import json
import time
from pathlib import Path
import boto3
from botocore.exceptions import ClientError
import cloudinary
import cloudinary.uploader
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure cloud storage (choose one)
CLOUD_STORAGE = os.getenv('CLOUD_STORAGE', 'cloudinary')  # 's3' or 'cloudinary'

# AWS S3 Configuration
if CLOUD_STORAGE == 's3':
    s3_client = boto3.client(
        's3',
        aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
        aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
        region_name=os.getenv('AWS_REGION', 'us-east-1')
    )
    S3_BUCKET = os.getenv('S3_BUCKET', 'your-video-bucket')

# Cloudinary Configuration
if CLOUD_STORAGE == 'cloudinary':
    cloudinary.config(
        cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
        api_key=os.getenv('CLOUDINARY_API_KEY'),
        api_secret=os.getenv('CLOUDINARY_API_SECRET')
    )

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'manim-video-generator',
        'cloud_storage': CLOUD_STORAGE,
        'timestamp': time.time()
    })

@app.route('/generate-video', methods=['POST'])
def generate_video():
    """Generate video from Manim code"""
    try:
        # Get request data
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'No JSON data provided'
            }), 400

        manim_code = data.get('code')
        query = data.get('query', 'animation')
        quality = data.get('quality', '1080p')
        format_type = data.get('format', 'mp4')

        if not manim_code:
            return jsonify({
                'success': False,
                'error': 'Manim code is required'
            }), 400

        logger.info(f"Generating video for query: {query}")

        # Create temporary directory for output
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            
            # Execute Manim code
            video_path = execute_manim_code(manim_code, temp_path, quality)
            
            if not video_path or not video_path.exists():
                return jsonify({
                    'success': False,
                    'error': 'Failed to generate video file'
                }), 500

            # Upload to cloud storage
            video_url = upload_video_to_storage(video_path, query)
            
            if not video_url:
                return jsonify({
                    'success': False,
                    'error': 'Failed to upload video to storage'
                }), 500

            logger.info(f"Video generated successfully: {video_url}")
            
            return jsonify({
                'success': True,
                'video_url': video_url,
                'message': f'Video generated for: {query}',
                'file_size': video_path.stat().st_size,
                'duration': 30,  # Placeholder, could extract from video
                'resolution': quality
            })

    except Exception as e:
        logger.error(f"Error generating video: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

def execute_manim_code(code: str, output_dir: Path, quality: str = '1080p') -> Path:
    """Execute Manim code and return path to generated video"""
    try:
        # Write Manim code to file
        script_path = output_dir / 'script.py'
        with open(script_path, 'w', encoding='utf-8') as f:
            f.write(code)

        logger.info(f"Manim script written to: {script_path}")

        # Determine quality flag
        quality_flag = {
            '480p': '-ql',
            '720p': '-qm', 
            '1080p': '-qh',
            '4k': '-qk'
        }.get(quality, '-qm')

        # Execute Manim command
        cmd = [
            'manim',
            str(script_path),
            'ExplanationScene',  # Default scene class name
            quality_flag,
            '--output_file=scene.mp4',
            '--media_dir=' + str(output_dir)
        ]

        logger.info(f"Executing Manim command: {' '.join(cmd)}")

        # Run Manim process
        result = subprocess.run(
            cmd,
            cwd=output_dir,
            capture_output=True,
            text=True,
            timeout=300  # 5 minute timeout
        )

        if result.returncode != 0:
            logger.error(f"Manim process failed: {result.stderr}")
            raise Exception(f"Manim execution failed: {result.stderr}")

        # Look for generated video file
        possible_paths = [
            output_dir / 'videos' / 'scene' / '720p30' / 'scene.mp4',
            output_dir / 'videos' / 'scene' / '1080p30' / 'scene.mp4',
            output_dir / 'videos' / 'scene' / '480p30' / 'scene.mp4',
            output_dir / 'scene.mp4'
        ]

        for video_path in possible_paths:
            if video_path.exists():
                logger.info(f"Video generated at: {video_path}")
                return video_path

        raise Exception("Video file not found after Manim execution")

    except subprocess.TimeoutExpired:
        raise Exception("Manim execution timed out")
    except Exception as e:
        logger.error(f"Error in execute_manim_code: {str(e)}")
        raise

def upload_video_to_storage(video_path: Path, query: str) -> str:
    """Upload video to cloud storage and return public URL"""
    try:
        if CLOUD_STORAGE == 's3':
            return upload_to_s3(video_path, query)
        elif CLOUD_STORAGE == 'cloudinary':
            return upload_to_cloudinary(video_path, query)
        else:
            raise Exception(f"Unsupported cloud storage: {CLOUD_STORAGE}")
    except Exception as e:
        logger.error(f"Error uploading video: {str(e)}")
        raise

def upload_to_s3(video_path: Path, query: str) -> str:
    """Upload video to AWS S3"""
    try:
        # Generate unique filename
        filename = f"manim-videos/{int(time.time())}_{query[:50].replace(' ', '_')}.mp4"
        
        # Upload to S3
        s3_client.upload_file(
            str(video_path),
            S3_BUCKET,
            filename,
            ExtraArgs={
                'ContentType': 'video/mp4',
                'ACL': 'public-read'
            }
        )

        # Return public URL
        return f"https://{S3_BUCKET}.s3.amazonaws.com/{filename}"

    except ClientError as e:
        logger.error(f"S3 upload error: {e}")
        raise Exception(f"Failed to upload to S3: {e}")

def upload_to_cloudinary(video_path: Path, query: str) -> str:
    """Upload video to Cloudinary"""
    try:
        # Upload to Cloudinary
        result = cloudinary.uploader.upload(
            str(video_path),
            resource_type="video",
            folder="manim-videos",
            public_id=f"{int(time.time())}_{query[:50].replace(' ', '_')}",
            overwrite=True
        )

        return result['secure_url']

    except Exception as e:
        logger.error(f"Cloudinary upload error: {e}")
        raise Exception(f"Failed to upload to Cloudinary: {e}")

@app.route('/status', methods=['GET'])
def status():
    """Get service status"""
    return jsonify({
        'status': 'running',
        'service': 'manim-video-generator',
        'version': '1.0.0',
        'cloud_storage': CLOUD_STORAGE,
        'timestamp': time.time()
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    debug = os.environ.get('DEBUG', 'false').lower() == 'true'
    
    logger.info(f"Starting Manim Video Generator on port {port}")
    logger.info(f"Cloud storage: {CLOUD_STORAGE}")
    logger.info(f"Debug mode: {debug}")
    
    app.run(host='0.0.0.0', port=port, debug=debug) 