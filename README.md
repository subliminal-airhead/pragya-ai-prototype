# Campus to Corporate - Full Stack Setup

## Architecture

- **Frontend**: React + Vite (TypeScript) running on `http://localhost:5173`
- **Backend**: Python FastAPI running on `http://localhost:8000`
- Vite dev server proxies `/api` and `/health` requests to the FastAPI backend automatically.

## Quick Start

### 1. Start the Python Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Or with Python directly:
```bash
cd backend
python -m app.main
```

### 2. Start the Frontend Dev Server

In a separate terminal:
```bash
cd frontend
npm install
npm run dev-web
```

The frontend will be available at `http://localhost:5173`. All API calls are proxied to the backend at `http://localhost:8000`.

## Backend Configuration

Edit `backend/.env` to configure:
```
GROQ_API_KEY=your_groq_key_here
GEMINI_API_KEY=your_gemini_key_here
MOCK_LLM=true   # Set to false to use real LLM
```

With `MOCK_LLM=true`, the backend returns realistic fixture data without needing any API keys.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /health | Health check |
| POST | /api/profile/parse | Parse resume (file upload or text) |
| GET | /api/profile/{id} | Get profile |
| PUT | /api/profile/{id} | Update profile |
| POST | /api/careers/recommend | Get career recommendations |
| POST | /api/skills/gap | Analyze skill gaps |
| POST | /api/courses/recommend | Get course recommendations |
| POST | /api/opportunities/match | Match job/internship opportunities |
| POST | /api/govt/match | Match government schemes |
| POST | /api/roadmap/run | Generate full career roadmap |
| GET | /api/roadmap/{id} | Get stored roadmap |
| POST | /api/resume/enhance | AI resume enhancement |
| POST | /api/interview/chat | Mock interview chat |
| DELETE | /api/session | Clear session data |

## Key Integration Notes

- Frontend session IDs are UUID v4 format (auto-generated on first visit)
- Backend profile IDs (from `/api/profile/parse`) are stored in localStorage as `pragya_backend_profile_id`
- All API calls transparently use the backend profile ID even when the frontend passes its own user ID
- Career role IDs are mapped from frontend format (`career_software_eng`) to backend format (`backend-developer`)
