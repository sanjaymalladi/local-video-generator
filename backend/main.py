# main.py

import os
import uuid
import asyncio
import logging
import subprocess
import sys
import shutil
import re
from pathlib import Path

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from dotenv import load_dotenv

import google.generativeai as genai

# --- Configuration & Initialization ---

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="LearnTube AI: Coqui TTS Integration",
    description="Programmatic video generation using Gemini, Manim, and Coqui TTS.",
    version="2.2.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files directory (for UI)
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"Serving static UI files from {static_dir}")
else:
    logger.warning("Static UI directory 'static' not found.")

# --- Pydantic Models ---

class VideoRequest(BaseModel):
    topic: str

class VideoResponse(BaseModel):
    video_id: str
    status: str
    message: str

class VideoStatus(BaseModel):
    video_id: str
    status: str
    video_url: Optional[str] = None
    error: Optional[str] = None

# --- In-Memory Task Storage ---
video_tasks = {}

# --- Gemini AI Configuration ---
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    logger.critical("GEMINI_API_KEY not found. Video generation will fail.")
else:
    genai.configure(api_key=GEMINI_API_KEY)
    logger.info("Google Generative AI (Gemini) configured successfully.")

# Create necessary directories on startup
Path("manim_scripts").mkdir(exist_ok=True)
Path("generated_videos").mkdir(exist_ok=True)
Path("manim_media").mkdir(exist_ok=True)


# --- Helper Functions ---

def to_pascal_case(text: str) -> str:
    """Converts a string to PascalCase, suitable for a Python class name."""
    return "".join(word.capitalize() for word in re.split(r'[\s\W_]+', text))

# --- Core Generation Logic ---

async def generate_educational_script(topic: str) -> str:
    """
    Step 1: Generate the narration script for the video using Gemini.
    """
    logger.info(f"Generating educational narration script for topic: '{topic}'")
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    prompt = f"""
    You are an expert scriptwriter for educational YouTube videos.
    Create a clear, concise, and engaging narration script for a 2-3 minute video about "{topic}".
    Divide the script into paragraphs. Each paragraph will become a separate scene/voiceover block in the animation.
    """
    
    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        logger.error(f"Error generating narration script with Gemini: {e}")
        raise ValueError(f"Failed to generate narration script: {e}")


async def generate_manim_voiceover_script(topic: str, narration_script: str) -> str:
    """
    Step 2: Generate a complete Manim script with integrated Coqui TTS voiceover.
    Uses the visualization-heavy prompt strategy.
    """
    logger.info(f"Generating Manim script with Coqui TTS for topic: '{topic}'")
    model = genai.GenerativeModel('gemini-2.0-flash')
    
    scene_class_name = f"{to_pascal_case(topic)}Scene"

    prompt = f"""
    You are a world-class motion graphics artist and expert Manim developer, specializing in creating visually-heavy educational content with the `manim-voiceover` plugin. Your goal is to produce a Manim script that is not just text on a screen, but a rich, dynamic, and memorable visual explanation of the topic: "{topic}".

    ---
    ### **CORE TECHNICAL DIRECTIVE (TTS)**
    1.  **Class & Imports:** The script MUST start with:
        ```python
        from manim import *
        from manim_voiceover import VoiceoverScene
        from manim_voiceover.services.coqui import CoquiService
        ```
    2.  **Voiceover Setup:** The `construct` method must begin with:
        ```python
        self.camera.background_color = WHITE
        self.set_speech_service(CoquiService(model_name="tts_models/en/ljspeech/tacotron2-DDC"))
        ```
    3.  **The `voiceover` Block:** The core logic MUST be structured with `with self.voiceover(text="...") as tracker:`.
    4.  **PERFECT TIMING:** All `self.play()` calls inside a `voiceover` block MUST use `tracker.duration` to ensure synchronization. The sum of sequential animations' run_times must equal `tracker.duration`.

    ---
    ### **VISUAL STYLE GUIDE (Visualization-Heavy)**
    -   The visuals must explain and enhance the narration.
    -   Use `Transform`, `ReplacementTransform`, `Arrow`, `Dot`, `VGroup`, and complex layouts (`.arrange()`, `.to_edge()`).
    -   Animate all elements. Avoid static views.
    -   **AVOID SVG FILES**: Do not use SVGMobject() as SVG files may not exist. Use built-in Manim shapes instead.

    ---
    ### **CRITICAL MANIM CODING RULES (Non-Negotiable)**
    -   The class name MUST be `{scene_class_name}` and inherit from `VoiceoverScene`.
    -   Return **ONLY** the raw, executable Python code.
    -   **NEVER use external files**: Do not reference any SVG, image, or external files.
    -   **Correct Line parameters**: When creating Line objects, use `stroke_opacity` instead of `opacity`.
    -   **Built-in shapes only**: Use Rectangle, Circle, Dot, Text, MathTex, Arrow, etc. instead of custom SVG files.
    -   **Error-free code**: Ensure all Manim objects are created with valid parameters only.
    -   **No placeholder paths**: Do not use placeholder SVG paths like "book.svg" or "chatbot.svg".
    -   **No look_at method**: Do not use `.look_at()` method on objects. Use `.rotate()` instead.
    -   **Clear text between scenes**: Always use `FadeOut()` or remove text objects before starting new scenes to prevent text from staying on screen.
    -   **Proper scene transitions**: End each voiceover block with cleanup animations like `FadeOut()` for all objects.

    ---
    ### **REPLACEMENT GUIDE FOR COMMON SVG OBJECTS**
    -   Book → Rectangle with Text "📚" or "Book"
    -   Chatbot → Circle with Text "🤖" or Rectangle with "AI"
    -   Translate → Arrow with Text "🌐 Translate"
    -   Code → Rectangle with Text "<Code>"
    -   Poem → Rectangle with Text "📝 Poem"
    -   People → Circle with Text "👥"
    -   Productivity → Rectangle with Text "⚡ Productivity"
    -   Discovery → Circle with Text "🔍"

    ---
    ### **EXAMPLE CODE PATTERNS**
    ✅ **Correct Line usage:**
    ```python
    Line(start_point, end_point, color=GRAY, stroke_opacity=0.5)
    ```

    ❌ **Avoid these patterns:**
    ```python
    Line(start_point, end_point, opacity=0.5)  # Wrong parameter
    SVGMobject("book.svg")  # External file dependency
    character.look_at(brain)  # Invalid method
    ```

    ✅ **Correct rotation patterns:**
    ```python
    character.animate.rotate(PI/6)  # Use rotate instead of look_at
    character.animate.rotate_about_point(angle, point)  # For specific rotation
    ```

    ✅ **Proper scene transitions:**
    ```python
    # Always end scenes with cleanup
    with self.voiceover(text="...") as tracker:
        # ... your animations ...
        self.play(FadeOut(text_obj, brain, character), run_time=tracker.duration/4)
    ```

    ❌ **Avoid persistent text:**
    ```python
    # DON'T do this - text will stay on screen
    with self.voiceover(text="...") as tracker:
        text_obj = Text("Hello")
        self.play(Write(text_obj), run_time=tracker.duration/2)
        # Missing FadeOut - text stays forever!

    # DO this instead
    with self.voiceover(text="...") as tracker:
        text_obj = Text("Hello")
        self.play(Write(text_obj), run_time=tracker.duration/2)
        self.play(FadeOut(text_obj), run_time=tracker.duration/2)
    ```

    ---
    ### **Provided Narration Script (To be turned into visuals)**
    {narration_script}
    ---

    Now, generate the complete, visualization-heavy Manim script using only built-in Manim objects and correct parameter names.
    """

    try:
        response = await model.generate_content_async(prompt)
        clean_code = re.sub(r'^```python\n|```$', '', response.text, flags=re.MULTILINE)
        return clean_code.strip()
    except Exception as e:
        logger.error(f"Error generating Manim script with Gemini: {e}")
        raise ValueError(f"Failed to generate Manim script: {e}")


async def render_manim_voiceover_video(manim_script: str, video_id: str, topic: str) -> str:
    """
    Step 3: Save the generated script and render it using the Manim CLI.
    Uses -pql for rapid development preview.
    """
    script_path = Path(f"manim_scripts/{video_id}.py")
    scene_class_name = f"{to_pascal_case(topic)}Scene"
    
    logger.info(f"Saving generated Manim script to: {script_path}")
    with open(script_path, "w", encoding='utf-8') as f:
        f.write(manim_script)

    python_executable = sys.executable
    
    # Using -pql (preview, low quality) as requested for development/testing
    # Note: Coqui models might take a while to download on first run.
    cmd = [
        python_executable, "-m", "manim",
        str(script_path),
        scene_class_name,
        "-pql",
        "--media_dir", "./manim_media",
        "--output_file", f"{video_id}.mp4",
        "--disable_caching" # Ensures fresh audio generation
    ]

    logger.info(f"Executing Manim render command: {' '.join(cmd)}")
    
    process = await asyncio.create_subprocess_exec(
        *cmd,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )

    stdout, stderr = await process.communicate()

    if process.returncode != 0:
        error_message = stderr.decode()
        logger.error(f"Manim rendering failed for video_id {video_id}:\n{error_message}")
        raise RuntimeError(f"Manim rendering failed: {error_message}")

    logger.info(f"Manim rendering successful for video_id {video_id}.")
    
    # Manim saves PQL video in 480p15 directory
    source_video_path = Path(f"manim_media/videos/{scene_class_name}/480p15/{video_id}.mp4")
    
    # Fallback/Check for higher quality if PQL flag wasn't active
    if not source_video_path.exists():
        # Check standard 720p30 used in the previous version
        source_video_path = Path(f"manim_media/videos/{scene_class_name}/720p30/{video_id}.mp4")

    if not source_video_path.exists():
        logger.error(f"Could not find the rendered video file at expected paths: {video_id}")
        # Search widely if the standard path fails
        for p in Path("manim_media").rglob(f"{video_id}.mp4"):
            source_video_path = p
            break
        
        if not source_video_path.exists():
             raise FileNotFoundError("Rendered video file not found after Manim process completion.")


    final_video_path = Path(f"generated_videos/{video_id}.mp4")
    shutil.copy(source_video_path, final_video_path)
    logger.info(f"Copied final video to: {final_video_path}")
    
    return str(final_video_path)


async def process_video_generation_pipeline(video_id: str, topic: str):
    """
    The main background task orchestrating the entire video generation process.
    """
    try:
        video_tasks[video_id]["status"] = "generating_script"
        narration_script = await generate_educational_script(topic)
        
        video_tasks[video_id]["status"] = "generating_manim_code"
        manim_script = await generate_manim_voiceover_script(topic, narration_script)
        
        video_tasks[video_id]["status"] = "rendering_video"
        await render_manim_voiceover_video(manim_script, video_id, topic)

        video_tasks[video_id]["status"] = "completed"
        video_tasks[video_id]["video_url"] = f"/videos/{video_id}"
        logger.info(f"Successfully completed video generation for ID: {video_id}")

    except Exception as e:
        logger.error(f"Video generation pipeline failed for ID {video_id}: {e}", exc_info=True)
        video_tasks[video_id]["status"] = "failed"
        video_tasks[video_id]["error"] = str(e)


# --- API Endpoints ---

@app.get("/", tags=["General"], response_class=HTMLResponse)
async def root():
    """Serves a basic index.html if found, otherwise returns API info."""
    index_path = Path(static_dir) / "index.html"
    if index_path.exists():
        with open(index_path, 'r', encoding='utf-8') as f:
            return HTMLResponse(content=f.read())
    else:
        return FileResponse("README.md", media_type="text/markdown", filename="README.md")


@app.post("/generate-video", response_model=VideoResponse, status_code=202, tags=["Video Generation"])
async def generate_video(request: VideoRequest, background_tasks: BackgroundTasks):
    """
    Starts the asynchronous video generation process for a given topic.
    """
    if not GEMINI_API_KEY:
         raise HTTPException(status_code=503, detail="AI Service is not configured. Missing GEMINI_API_KEY.")
         
    video_id = str(uuid.uuid4())
    
    video_tasks[video_id] = {
        "status": "queued",
        "topic": request.topic,
        "video_url": None,
        "error": None
    }

    background_tasks.add_task(process_video_generation_pipeline, video_id, request.topic)

    return VideoResponse(
        video_id=video_id,
        status="queued",
        message="Video generation has been queued. Check the status endpoint for updates."
    )

@app.get("/video-status/{video_id}", response_model=VideoStatus, tags=["Video Generation"])
async def get_video_status(video_id: str):
    """
    Retrieves the current status of a video generation task.
    """
    task = video_tasks.get(video_id)
    if not task:
        raise HTTPException(status_code=404, detail="Video ID not found.")
    
    return VideoStatus(video_id=video_id, **task)

@app.get("/videos/{video_id}", tags=["Video Generation"])
async def get_video_file(video_id: str):
    """
    Serves the generated MP4 video file if it's completed.
    """
    task = video_tasks.get(video_id)
    if not task:
        raise HTTPException(status_code=404, detail="Video ID not found.")
    
    if task["status"] != "completed":
        raise HTTPException(status_code=400, detail=f"Video is not ready. Current status: {task['status']}")

    video_path = Path(f"generated_videos/{video_id}.mp4")
    if not video_path.exists():
        logger.error(f"Completed video file not found on disk for ID: {video_id}")
        raise HTTPException(status_code=500, detail="Video file is missing despite completed status.")
        
    return FileResponse(video_path, media_type="video/mp4", filename=f"{task['topic']}.mp4")

if __name__ == "__main__":
    import uvicorn
    logger.info("Starting LearnTube AI Server (v2.2.0)...")
    logger.critical("SETUP WARNING: Coqui TTS requires PyTorch and specific dependencies. Ensure you installed with: pip install 'manim-voiceover[coqui]'")
    logger.warning("Ensure 'ffmpeg' is installed and accessible in your system's PATH.")
    uvicorn.run(app, host="0.0.0.0", port=8000)