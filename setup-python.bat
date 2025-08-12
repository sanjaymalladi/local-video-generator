@echo off
echo Installing Python dependencies for Local Video Generator...
echo.

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.8+ from https://python.org
    pause
    exit /b 1
)

REM Check if pip is available
pip --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: pip is not available
    echo Please ensure pip is installed with Python
    pause
    exit /b 1
)

echo Installing required Python packages...
pip install -r requirements.txt

echo.
echo Installing Google TTS with manim-voiceover...
pip install "manim-voiceover[gtts]"

echo.
echo Testing TTS setup...
python -c "from gtts import gTTS; print('Google TTS installed successfully!')"

echo.
echo Setup complete! You can now generate videos with voiceover.
pause