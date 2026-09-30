# Pragya AI Prototype 🚀

An AI-powered ""Campus to Corporate"" career guidance platform designed to bridge the gap between academic learning and industry expectations.

## 🌟 Overview

Pragya AI serves as an intelligent career copilot for students. It analyzes their current skills, academic background, and interests to generate personalized, actionable roadmaps. From discovering the right career path to preparing for interviews, Pragya guides students every step of the way.

### ✨ Key Features

*   **📄 Intelligent Resume Parsing:** Extracts skills, education, and experience from uploaded resumes (PDF/DOCX) or raw text.
*   **🎯 Career Path Discovery:** Recommends tailored career roles based on a student's unique profile and market demand.
*   **📊 Skill Gap Analysis:** Deterministically compares a student's current skills against target industry requirements to identify specific gaps.
*   **📚 Targeted Course Recommendations:** Suggests specific learning resources to bridge identified skill gaps.
*   **💼 Opportunity Matching:** Matches students with relevant internships and entry-level jobs based on skill overlap.
*   **🏛️ Government Scheme Eligibility:** Filters and recommends relevant student welfare and upskilling schemes.
*   **💬 AI Mock Interviews:** Provides role-specific behavioral and technical mock interviews with instant, actionable feedback.
*   **📝 AI Resume Enhancement:** Rewrites and optimizes resume bullet points to pass ATS checks and highlight impact.

## 🏗️ Tech Stack

This project is built with a decoupled architecture running entirely locally:

*   **Frontend:** React, TypeScript, Vite, Tailwind CSS
*   **Backend:** Python, FastAPI, SQLModel (SQLite)
*   **AI Integration:** Groq (primary - Llama 3), Gemini (fallback)

## 🚀 Quick Start Guide

### 1. Backend Setup (FastAPI)

\\\ash
cd backend

# Install dependencies
pip install -r requirements.txt

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
\\\
*The backend will be available at http://localhost:8000.*

### 2. Frontend Setup (React/Vite)

Open a new terminal window:

\\\ash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev-web
\\\
*The frontend will be available at http://localhost:5173.*

> **Note:** The Vite dev server is configured to automatically proxy all /api and /health requests to the FastAPI backend, bypassing CORS issues.

## ⚙️ Configuration

The application uses a .env file in the ackend/ directory for configuration:

\\\nv
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
MOCK_LLM=true 
\\\

**Testing without API Keys:**
Leave MOCK_LLM=true to test the application using realistic, pre-generated fixture data. No API keys are required in this mode! Set it to alse to enable live LLM generation.

## 📁 Project Structure

*   /frontend - React application source code and assets.
*   /backend - Python FastAPI application, database models, AI service layer, and prompt templates.
*   IMPLEMENTATION-PLAN.md - Original project architecture and planning document.
*   Project-Blueprint.html - Visual blueprint of the application flow.
