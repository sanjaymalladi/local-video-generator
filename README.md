# Local Video Generator

A modern web application that converts text descriptions into animated educational videos using AI-powered backend processing.

## Architecture

This application uses a **client-server architecture**:

- **Frontend**: Next.js React application that handles user interface and API coordination
- **Backend**: Python FastAPI server that generates videos using Manim + Coqui TTS

## Features

- **AI-Powered Script Generation**: Uses Google Gemini AI to generate educational scripts
- **Professional Animations**: Manim mathematical animation engine for high-quality visuals
- **Text-to-Speech**: Coqui TTS for natural voice synthesis
- **Real-time Status Updates**: Live progress tracking during video generation
- **Video Gallery**: Browse and manage generated videos
- **Download Support**: Direct video file downloads

## Tech Stack

### Frontend
- Next.js 15 with TypeScript
- React 19 with modern hooks
- Tailwind CSS for styling
- Radix UI components
- Sonner for notifications

### Backend
- Python FastAPI
- Google Gemini AI for script generation
- Manim for mathematical animations
- Coqui TTS for voice synthesis
- MoviePy for video processing

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Set up your environment variables in the backend:
```bash
cp env.example .env
# Edit .env and add your GEMINI_API_KEY
```

Start the backend server:
```bash
python main.py
```
The backend will be available at `http://localhost:8000`

### 2. Frontend Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp frontend-env.example .env.local
# Edit .env.local and set BACKEND_URL=http://localhost:8000
```

Start the frontend development server:
```bash
npm run dev
```
The frontend will be available at `http://localhost:3000`

## Usage

1. **Generate Videos**: Enter a topic or description in the text input
2. **Monitor Progress**: Watch real-time status updates as the backend processes your request
3. **View Results**: Once complete, watch your generated video with Manim animations and TTS audio
4. **Download**: Save videos to your local machine for offline use
5. **Browse History**: View previously generated videos in the gallery

## API Endpoints

### Frontend API
- `POST /api/generate` - Start video generation
- `GET /api/status/[jobId]` - Check job status
- `GET /api/video/[jobId]` - Get video metadata
- `GET /api/video-file/[jobId]` - Download video file
- `GET /api/history` - Get video history
- `GET /api/health` - Health check

### Backend API
- `POST /generate-video` - Start video generation (main endpoint)
- `GET /video-status/{video_id}` - Check video generation status
- `GET /videos/{video_id}` - Download generated video

## Environment Variables

### Frontend (.env.local)
```env
BACKEND_URL=http://localhost:8000
GEMINI_API_KEY=your_gemini_api_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Backend (.env)
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

## How It Works

1. **User Input**: User enters a topic in the frontend
2. **Backend Processing**: Frontend calls backend API with the topic
3. **AI Generation**: Backend uses Gemini AI to generate educational script
4. **Manim Code**: AI generates Python Manim code for animations
5. **Rendering**: Manim renders the animation with Coqui TTS audio
6. **Completion**: Backend serves the final MP4 video file
7. **Display**: Frontend plays the video and provides download option

## Development

### Available Scripts

```bash
# Frontend
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Backend
cd backend
python main.py       # Start backend server
```

### Project Structure

```
├── src/                    # Frontend Next.js app
│   ├── app/               # Next.js app router
│   ├── components/        # React components
│   └── lib/               # Utility functions
├── backend/               # Python backend
│   ├── generated_videos/  # Output video files
│   ├── manim_scripts/     # Generated Manim Python code
│   └── main.py           # FastAPI server
├── public/                # Static assets
└── frontend-env.example  # Environment variables template
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test both frontend and backend
5. Submit a pull request

## License

MIT License - feel free to use this project for educational and commercial purposes.
