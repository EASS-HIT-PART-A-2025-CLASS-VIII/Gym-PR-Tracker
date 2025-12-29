# Gym PR Tracker 💪

A full-stack application for tracking personal gym records (PRs).
Built with **FastAPI** (Backend) and **Streamlit** (Frontend).

## 🚀 Features

### Backend 
- **CRUD Operations:** Create, Read, Update, and Delete personal records.
- **Data Validation:** Robust validation using **Pydantic**.
- **Architecture:** Clean separation of concerns (Models, Repository, Endpoints).
- **Testing:** Comprehensive test suite using **pytest**.
- **Containerization:** Dockerized backend environment.

### Frontend 
- **Interactive Dashboard:** View all records in a sortable table.
- **Add Records:** Simple form to log new PRs instantly.
- **Visual Analytics:**
  - **Muscle Distribution:** Pie chart showing workout focus by muscle group.
  - **Strength Progress:** Line chart tracking weight progression over time per exercise.
- **Data Filtering:** Filter records by exercise name 
- **Bonus:** Automated interface testing.

## 📂 Project Structure

```
├── app/
│   ├── main.py          # FastAPI application & endpoints
│   ├── models.py        # SQLModel database schemas (Pydantic + SQLAlchemy)
│   ├── repository.py    # Database access layer (CRUD)
│   └── database.py      # Database connection & setup
├── frontend/
│   ├── app.py           # Streamlit dashboard entry point
│   └── api_client.py    # Client to communicate with Backend API
├── tests/
│   ├── test_main.py     # Backend API tests
│   └── test_frontend.py # Frontend UI tests
├── init_db.py           # Database initialization script
├── docker-compose.yml   # Docker configuration
└── pyproject.toml       # Python dependencies & configuration
```

## 🛠️ Prerequisites

- Python 3.12+
- uv (Project & Package Manager)

## 📥 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/EASS-HIT-PART-A-2025-CLASS-VIII/gym-pr-tracker.git
   cd gym-pr-tracker
   ```

2. Install dependencies using uv:
   ```bash
   uv sync
   ```

3. **(Optional)** Initialize the database:
   *Note: The app automatically creates the database on first run, but you can trigger it manually if needed.*
   ```bash
   uv run init_db.py
   ```

## 🖥️ How to Run

To use the application, you need to run both the Backend and the Frontend in separate terminals.

1. **Start the Backend** (Terminal 1)
   This starts the FastAPI server which handles the data.
   ```bash
   uv run uvicorn app.main:app --reload
   ```

2. **Start the Frontend** (Terminal 2)
   This starts the Streamlit dashboard.
   ```bash
   uv run streamlit run frontend/app.py
   ```

## 🐳 Run with Docker

Alternatively, you can run the entire stack using Docker Compose:

1. **Build and Start**:
   ```bash
   docker-compose up --build
   ```

2. **Access the App**:
   - Frontend: http://localhost:8501
   - Backend Docs: http://localhost:8000/docs

## 🧪 How to Test

To run the automated test suite:
```bash
uv run pytest
```
