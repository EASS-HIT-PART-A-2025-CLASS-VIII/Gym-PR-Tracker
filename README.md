# Gym PR Tracker 💪

A full-stack application for tracking personal gym records (PRs).

- **Backend**: FastAPI (Python)
- **Frontend**: React (TypeScript)

## ✨ Key Features

### 🏋️‍♂️ Application

- **PR Tracking**: Log and visualize your personal records for any exercise.
- **Dynamic Milestones**: Automatically detect and celebrate new achievements.
- **AI Workout Builder**: Generate custom workout plans specific to your goals.
- **User Accounts**: Secure registration and login to keep your data private.
- **Responsive UI**: Modern interface built with React.

### 🛠️ Technical Highlights

- **Backend**: **FastAPI** with **Pydantic** for robust validation.
- **Frontend**: **React** with **TypeScript** & **Vite**.
- **Architecture**: Clean separation of concerns (Models, Repository, Endpoints).
- **Testing**: Comprehensive test suites (**Pytest** & **Vitest**).
- **Deployment**: Fully Dockerized with **Docker Compose** orchestration.

## 🛠️ Prerequisites

- Python 3.12+
- Node.js & npm (for Frontend)
- uv (for Backend)
- Docker (Optional)

## ⚡ Quick Start (Running Side-by-Side)

To run the full application, you will need **two separate terminal windows**.

**Terminal 1 (Backend):**

```bash
cd backend
uv sync
uv run fastapi dev app/main.py
```

**Terminal 2 (Frontend):**

```bash
cd frontend
npm install
npm run dev
```

**Access the Application:**

- Frontend: http://localhost:5173
- Backend API Docs: http://127.0.0.1:8000/docs

**Running Tests:**

```bash
# Backend
cd backend
uv run pytest

# Frontend
cd frontend
npm test
```

## 🌱 Database Seeding

To populate the database with initial test data (User + PRs):

```bash
cd backend
# Using uv (recommended)
uv run python scripts/seed.py
```

This will create a user `testuser` (password: `password123`) and some sample PRs.

## 🐳 Docker Stack

To launch the full microservices stack (API, Redis, Worker, Interface):

```bash
docker compose up --build
```

See the **Compose Runbook** section below for detailed orchestration notes.

---

## 📚 Documentation

For detailed technical notes, including:

- **Microservices Orchestration**
- **Security Baseline & Secret Rotation**
- **Async Telemetry (Refresher)**
- **AI Assistance Report**
- **Compose Runbook**

👉 Please see [docs/EX3-notes.md](docs/EX3-notes.md).
