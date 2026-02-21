<img width="2859" height="1610" alt="Screenshot 2026-02-21 150929" src="https://github.com/user-attachments/assets/816773a2-a1d1-4394-80b7-eccbe8e9d1bc" /># Movieflix - Premium Movie Dashboard

A modern, responsive, and feature-rich movie dashboard built with **React (Frontend)** and **Flask (Backend)**. This project pulls data from the TMDB API to provide a cinematic experience similar to Netflix.

## 🚀 Features
- **Cinematic UI**: Premium dark-themed design with scrolling hero banners and vertical movie posters.
- **Dynamic Genre Rows**: Categorized movies (Action, Comedy, Horror, Romance, etc.) with real-time data.
- **Interactive Navbar**: Transparent-to-solid navbar on scroll with functional links.
- **User Authentication**: Secure Login/Signup system using JWT and local persistence.
- **Personalized Profile**: Custom user avatar and dropdown menu with account info.
- **Efficient Loading**: Sequential fetching for instant dashboard availability and individual row error handling.

## 🛠️ Tech Stack
- **Frontend**: React, Vite, Lucide-React, Axios, CSS3 (Vanilla).
- **Backend**: Flask, Flask-JWT-Extended, Flask-SQLAlchemy, SQLite (Local).
- **API**: TMDB (The Movie Database).

## 📂 Folder Structure
```text
movies-dashboard/
├── api/                    # Flask Backend
│   ├── app/                # Main Application Logic
│   │   ├── services/       # External API Services (TMDB)
│   │   ├── models.py       # Database Models (User)
│   │   ├── routes.py       # API Endpoints
│   │   └── __init__.py     # Flask App Factory & Config
│   ├── index.py            # Vercel Entry Point (Legacy)
│   └── requirements.txt    # Python Dependencies
├── frontend/               # React Frontend
│   ├── src/                # Source Files
│   │   ├── components/     # UI Components
│   │   ├── App.jsx         # Routing & Layout
│   │   ├── Home.jsx        # Dashboard Page
│   │   ├── Landing.jsx     # Login/Signup/Forgot Password
│   │   ├── Details.jsx     # Movie Details Page
│   │   └── api.js          # Axios API Service
│   ├── dist/               # Compiled Production Build
│   ├── package.json        # Frontend Dependencies
│   └── vite.config.js      # Vite Configuration
├── instance/               # Local SQLite Database
├── .env                    # Environment Variables
├── run.py                  # Main Entry Point (Backend + Frontend)
└── README.md               # Project Documentation
```

## 📥 Installation

### 1. Backend Setup
1. Navigate to the root folder.
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Run the server:
   ```bash
   python run.py
   ```

### 2. Frontend Setup
1. Navigate to the `frontend` folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## 🔑 Environment Variables
Create a `.env` file in the root directory and add your TMDB API Key:
```env
TMDB_API_KEY=your_api_key_here
JWT_SECRET_KEY=your_secret_key
```

## 📸 Screenshots
<img width="2859" height="1610" alt="Screenshot 2026-02-21 150929" src="https://github.com/user-attachments/assets/56e4b31c-014d-416d-a2eb-f0906fae47ae" />


