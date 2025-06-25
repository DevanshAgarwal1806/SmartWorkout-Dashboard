# WorkoutSmart: AI-Powered Fitness Tracking & Coaching Platform

## Overview
WorkoutSmart is a full-stack, production-ready fitness tracking and coaching platform. It combines a modern Vite/React/TypeScript frontend with a FastAPI backend and Supabase for authentication and data storage. The app empowers users to log workouts, analyze progress, receive AI-generated insights, generate personalized workout plans, set and track goals, and manage their fitness journey with science-backed intelligence.

---

## Features

### 🚀 Modern, Responsive UI
- Clean, mobile-friendly design with a dashboard, quick actions, and intuitive navigation.
- All pages and modals are fully responsive and visually consistent.

### 🏋️‍♂️ Workout Logging & History
- Log workouts with type, duration, calories, and notes.
- View, delete, and manage all past workouts.
- Streak tracking: see your consecutive workout days.

### 📈 Analytics & Data Visualization
- Upload workout CSVs for instant analysis.
- Interactive plotting: select axes, chart types, and legends.
- Robust error handling and column matching.

### 🤖 AI Coach & Insights
- Upload your workout data to get AI-powered, evidence-based insights.
- Receive actionable recommendations, spot trends, and get professional-level analysis.

### 📊 Weight Prediction & Calories Calculator
- Predict your weight for 1, 2, and 6 months based on your profile and goals.
- Calculate calories burned for various activities, with or without heart rate.
- Use your profile data or enter new data for each calculation.

### 📝 Personalized Workout Plans
- Generate AI-powered, daily workout plans tailored to your goals, schedule, and preferences.
- Name and save each plan for future reference.
- View, manage, and delete all your saved plans.

### 🎯 Set & Track Goals
- Add, view, complete, and delete fitness goals.
- All goals are securely stored and linked to your account.

### 👤 User Profile Management
- Secure authentication via Supabase (email/password, email confirmation).
- Manage your profile: name, height, weight, age, gender.
- Profile data is used to prefill calculators and plans for a seamless experience.

### 🔒 Secure & Production-Ready
- All secrets (API keys, Supabase keys) are stored in `.env` files and never committed.
- Row Level Security (RLS) ensures users only access their own data.
- No sensitive data is exposed in version control.

---

## Tech Stack
- **Frontend:** Vite, React, TypeScript, Tailwind CSS, Recharts, Lucide Icons
- **Backend:** FastAPI (Python), Pandas, Matplotlib, Seaborn, OpenRouter (AI)
- **Database & Auth:** Supabase (Postgres + Auth)

---

## Getting Started

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd WorkoutSmart
```

### 2. Setup Environment Variables
- Copy `.env.example` to `.env` in both `frontend/` and `backend/`.
- Add your Supabase project URL and anon key, and your OpenRouter API key.

### 3. Install Dependencies
- **Frontend:**
  ```sh
  cd frontend
  npm install
  ```
- **Backend:**
  ```sh
  cd ../backend
  pip install -r requirements.txt
  ```

### 4. Start the App
- **Backend:**
  ```sh
  uvicorn main:app --reload
  ```
- **Frontend:**
  ```sh
  cd ../frontend
  npm run dev
  ```

### 5. Supabase Setup
- Run the provided SQL in the Supabase SQL Editor to create tables for workouts, user profiles, goals, and personalized workouts (with RLS policies).

---

## Deployment & Security
- All secrets are stored in `.env` and are gitignored.
- Never commit `.env` or any secret keys.
- Use Supabase RLS for all user data tables.
- For production, use HTTPS and secure your API endpoints.

---

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## License
[MIT](LICENSE)

---

## Credits
- Built with ❤️ by your team, powered by OpenRouter, Supabase, and the open-source community.
