# Fake News Detector

A full-stack web application that uses Google's Gemini AI to analyze news content for credibility.

## Features
- AI-powered analysis (Real, Fake, or Suspicious)
- Confidence score with animated progress bar
- Detailed reasoning and factual inconsistencies
- Modern dark-themed UI with Glassmorphism
- Responsive design for all devices
- Typing animation for results

## Prerequisites
- Node.js installed
- Gemini API Key (already included in `.env`)

## Getting Started

### 1. Start the Backend
```bash
cd server
npm install
node index.js
```
The server will run on `http://localhost:5000`.

### 2. Start the Frontend
```bash
cd client
npm install
npm run dev
```
The client will run on `http://localhost:5173` (or similar).

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Framer Motion, Lucide Icons
- **Backend**: Node.js, Express, Google Generative AI (Gemini API)
