# Pragya AI Prototype

A "Campus to Corporate" career guidance platform built to help students transition from academic learning to industry requirements.

## Overview

Pragya AI acts as a career assistant for students. It analyzes their current skills, academic background, and interests to generate personalized roadmaps. The goal is to guide students through the entire process, from figuring out the right career path to preparing for interviews.

### Key Features

*   **Resume Parsing:** Extracts skills, education, and experience from uploaded resumes (PDF/DOCX) or raw text.
*   **Career Path Discovery:** Recommends relevant career roles based on the student's profile and current market demand.
*   **Skill Gap Analysis:** Compares a student's current skills against industry requirements to identify what they need to learn.
*   **Course Recommendations:** Suggests learning resources to help bridge the identified skill gaps.
*   **Opportunity Matching:** Connects students with relevant internships and entry-level jobs based on skill overlap.
*   **Government Scheme Eligibility:** Filters and recommends relevant student welfare and upskilling schemes.
*   **Mock Interviews:** Provides role-specific behavioral and technical mock interviews with feedback.
*   **Resume Enhancement:** Rewrites and optimizes resume bullet points for better impact and ATS compatibility.

## Tech Stack

The project uses a decoupled architecture running entirely locally:

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Python, FastAPI, SQLModel (SQLite)
*   **AI Integration:** Groq (primary - Llama 3), Gemini (fallback)

## Quick Start Guide

### 1. Backend Setup (FastAPI)

\\\ash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\\\
The backend will be available at http://localhost:8000.

### 2. Frontend Setup (React/Vite)

Open a new terminal window:

\\\ash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev-web
\\\
The frontend will be available at http://localhost:5173. 

Note: The Vite dev server automatically proxies all /api and /health requests to the FastAPI backend.

## Configuration

The application uses a .env file in the ackend/ directory for configuration:

\\\nv
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
MOCK_LLM=true 
\\\

**Testing without API Keys:**
Leave MOCK_LLM=true to test the application using pre-generated mock data. No API keys are required in this mode. Set it to alse when you want to enable live LLM generation.

## Project Structure

*   /frontend - React application source code and assets.
*   /backend - Python FastAPI application, database models, AI service layer, and prompt templates.
*   IMPLEMENTATION-PLAN.md - Original project architecture and planning document.
*   Project-Blueprint.html - Visual blueprint of the application flow.
