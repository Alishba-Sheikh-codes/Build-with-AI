# Build with AI 

A **speaking avatar news broadcaster** that uses **web scraping** to fetch the latest news and **AI text-to-speech** to deliver it. Built with **Firebase** and **Google’s Gemini model**, originally created for the GDSC NUST Hackathon.

---

## Overview

This project demonstrates how to build an **interactive AI-powered news web app** that:

- Scrapes news from websites in real-time
- Converts news headlines and summaries into **spoken output** using AI
- Uses **Firebase** for backend services (hosting, database)
- Features a **realistic speaking avatar** on the frontend

It’s perfect for learning **AI integration, web scraping, and interactive web apps**.

---

## Features

- Real-time news scraping from multiple websites  
- AI-generated speech with Gemini  
- Speaking avatar that reads news to users  
- Firebase backend for hosting and data  
- Responsive web interface 

---

## Repository Structure
```
Build-with-AI
┣ 📂src
┃ ┣ 📂pages … UI & app code
┃ ┣ 📂components … reusable interface pieces
┃ ┗ 📂services … Firebase & AI integrations
┣ 📂backend … server functions (if used)
┣ 📂docs … project documentation
┣ 📂Dependencies… dependencies
┣ README.md … project overview
┗ Deployed Project
```

---

## Tech Stack

- **Next.js / React** – Frontend framework  
- **Firebase** – Hosting, database, and server functions  
- **Web Scraping** – Fetches latest news headlines and summaries  
- **Gemini AI** – Converts text into spoken output  
- **TypeScript & Tailwind CSS** – Strong typing + modern styling  

---

## Getting Started

### Prerequisites

Make sure you have:

- Node.js (v16+)
- A Firebase project set up
- API keys for Gemini or other AI services

### Install Dependencies

```bash
git clone https://github.com/washma-sajjad/Build-with-AI.git
cd Build-with-AI
npm install
```
### Configure Firebase

- Create a Firebase project
- Copy your config values
- Create a .env.local file and add secrets:
```
NEXT_PUBLIC_FIREBASE_API_KEY=…
FIREBASE_AUTH_DOMAIN=…
FIREBASE_PROJECT_ID=…
AI_API_KEY=…
```
### Run Locally
`npm run dev`
Open http://localhost:3000 to view in the browser.
