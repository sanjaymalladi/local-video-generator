#!/usr/bin/env python3
"""
Video Generation Service
Handles Manim video generation with TTS in a local environment
"""

import os
import json
import tempfile
import subprocess
import shutil
from pathlib import Path
from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
TEMP_DIR = Path("/app/temp")
OUTPUT_DIR = Path("/app/data/videos")
TEMP_DIR.mkdir(exist_ok=True)
OUTPUT_DIR.mkdir(exist_ok=True)

class VideoGenerator:
    def __init__(self):
        self.setup_manim_environment()
    
    def setup_manim_environment(self):
        """Setup Manim and TTS environment"""
        try:
            # Test Manim installation
            result = subprocess.run(['manim', '--version'], 
                                  capture_output=True, text=True, timeout=10)
            if result.returncode == 0:
                logger.info(f"Manim version: {result.stdout.strip()}")
            else:
                logger.error("Manim not properly installed")
                
            # Test TTS installation
            try:
                from TTS.api import TTS
                logger.info("TTS library available")
            except ImportError:
                logger.warning("TTS library not available, will use fallback")
                
        except Exception as e:
            logger.error(f"Environment setup error: {e}")
    
    def generate_video(self, job_id: str, manim_code: str) -> dict:
        """Generate video from Manim code"""
        try:
            # Create job directory
            job_dir = TEMP_DIR / job_id
            job_dir.mkdir(exist_ok=True)
            
            # Write Manim script
            script_path = job_dir / "scene.py"
            with open(script_path, 'w', encoding='utf-8') as f:
                f.write(manim_code)
            
            # Create output directory
            output_dir = OUTPUT_DIR / job_id
            output_dir.mkdir(exist_ok=True)
            
            # Run Manim command
            cmd = [
                'manim',
                str(script_path),
                'ExplanationScene',
                '-qm',  # Medium quality
                f'--output_file=video.mp4',
                f'--media_dir={output_dir}',
                '--disable_caching',
                '--flush_cache',
                '--progress_bar=none'
            ]
            
            logger.info(f"Running Manim command: {' '.join(cmd)}")
            
            # Execute Manim with timeout
            result = subprocess.run(
                cmd,
                cwd=job_dir,
                capture_output=True,
                text=True,
                timeout=300  # 5 minute timeout
            )
            
            if result.returncode == 0:
                # Find the generated video file
                video_path = self.find_video_file(output_dir)
                if video_path and video_path.exists():
                    # Get video info
                    file_size = video_path.stat().st_size
                    
                    return {
                        'success': True,
                        'video_path': str(video_path),
                        'file_size': file_size,
                        'duration': 60,  # Estimated
                        'message': 'Video generated successfully'
                    }
                else:
                    return {
                        'success': False,
                        'error': 'Video file not found after generation',
                        'stdout': result.stdout,
                        'stderr': result.stderr
                    }
            else:
                return {
                    'success': False,
                    'error': f'Manim execution failed with code {result.returncode}',
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
                
        except subprocess.TimeoutExpired:
            return {
                'success': False,
                'error': 'Video generation timed out (5 minutes)',
            }
        except Exception as e:
            logger.error(f"Video generation error: {e}")
            return {
                'success': False,
                'error': str(e)
            }
        finally:
            # Cleanup temp files
            try:
                if job_dir.exists():
                    shutil.rmtree(job_dir)
            except Exception as e:
                logger.warning(f"Cleanup error: {e}")
    
    def find_video_file(self, output_dir: Path) -> Path:
        """Find the generated video file"""
        # Look for video.mp4 in various subdirectories
        possible_paths = [
            output_dir / "video.mp4",
            output_dir / "videos" / "scene" / "720p30" / "video.mp4",
        ]
        
        # Also search recursively for any .mp4 file
        for mp4_file in output_dir.rglob("*.mp4"):
            if mp4_file.name == "video.mp4":
                return mp4_file
        
        # Return first found path that exists
        for path in possible_paths:
            if path.exists():
                return path
        
        # Return first .mp4 file found
        for mp4_file in output_dir.rglob("*.mp4"):
            return mp4_file
        
        return None

# Initialize video generator
video_gen = VideoGenerator()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'video-generation',
        'version': '1.0.0'
    })

@app.route('/generate', methods=['POST'])
def generate_video():
    """Generate video from Manim code"""
    try:
        data = request.get_json()
        
        if not data or 'job_id' not in data or 'manim_code' not in data:
            return jsonify({
                'success': False,
                'error': 'Missing job_id or manim_code in request'
            }), 400
        
        job_id = data['job_id']
        manim_code = data['manim_code']
        
        logger.info(f"Generating video for job {job_id}")
        
        # Generate video
        result = video_gen.generate_video(job_id, manim_code)
        
        if result['success']:
            return jsonify(result), 200
        else:
            return jsonify(result), 500
            
    except Exception as e:
        logger.error(f"Generate endpoint error: {e}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/video/<job_id>', methods=['GET'])
def get_video(job_id):
    """Serve generated video file"""
    try:
        output_dir = OUTPUT_DIR / job_id
        video_path = video_gen.find_video_file(output_dir)
        
        if video_path and video_path.exists():
            return send_file(
                video_path,
                mimetype='video/mp4',
                as_attachment=False,
                download_name=f'video-{job_id}.mp4'
            )
        else:
            return jsonify({
                'error': 'Video not found'
            }), 404
            
    except Exception as e:
        logger.error(f"Video serve error: {e}")
        return jsonify({
            'error': str(e)
        }), 500

@app.route('/status/<job_id>', methods=['GET'])
def get_status(job_id):
    """Get video generation status"""
    try:
        output_dir = OUTPUT_DIR / job_id
        video_path = video_gen.find_video_file(output_dir)
        
        if video_path and video_path.exists():
            file_size = video_path.stat().st_size
            return jsonify({
                'status': 'completed',
                'file_size': file_size,
                'video_available': True
            })
        else:
            return jsonify({
                'status': 'not_found',
                'video_available': False
            })
            
    except Exception as e:
        logger.error(f"Status check error: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e)
        }), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port, debug=False)