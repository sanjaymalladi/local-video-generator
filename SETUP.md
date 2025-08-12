# Local Video Generator Setup

## Prerequisites

1. **Node.js** (v18 or higher)
2. **Python** (v3.8 or higher)
3. **Gemini API Key**

## Installation Steps

### 1. Install Node.js Dependencies
```bash
npm install
```

### 2. Install Python Dependencies
Run the setup script:
```bash
# Windows
setup-python.bat

# Or manually:
pip install -r requirements.txt
```

### 3. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and add your Gemini API key:
```
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Verify Manim Installation
Test Manim installation:
```bash
manim --version
```

### 5. Test TTS Setup
Verify Coqui TTS is working:
```bash
python -c "from TTS.api import TTS; print('TTS setup successful!')"
```

## Running the Application

```bash
npm run dev
```

Visit `http://localhost:3000` to start generating videos!

## Features

- **AI-Powered Script Generation**: Uses Gemini AI to create detailed educational scripts
- **Coqui TTS Voiceover**: Automatic voice narration synchronized with animations
- **Manim Animations**: Professional mathematical and educational animations
- **Auto-scroll**: Automatically scrolls to completed videos
- **Detailed Content**: Creates comprehensive 2-3 minute educational videos
- **Local Processing**: Everything runs on your machine for privacy

## Troubleshooting

### Common Issues

1. **Manim not found**: Ensure Python and pip are in your PATH
2. **TTS model download fails**: Check internet connection and try again
3. **Video generation fails**: Check the console logs for specific errors
4. **Audio issues**: Ensure you have proper audio drivers installed

### Getting Help

Check the console logs in your browser's developer tools for detailed error messages.