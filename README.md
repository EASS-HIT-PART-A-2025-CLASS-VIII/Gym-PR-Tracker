
# Gym PR Tracker 💪

A backend microservice for tracking personal gym records (PRs), built with **FastAPI**.

## 🚀 Features

- **CRUD Operations:** Create, Read, Update, and Delete personal records.
- **Data Validation:** Robust validation using **Pydantic**.
- **Architecture:** Clean separation of concerns (Models, Repository, Endpoints).
- **Testing:** Comprehensive test suite using **pytest**.
- **Containerization:** Fully Dockerized for easy deployment.
- **Developer Experience:** Includes a `.http` file for quick testing in VS Code.

## 🛠️ Prerequisites

- Python 3.12+
- uv
- Docker (Optional)

## 📥 Installation

1. Clone the repository:
```bash
git clone 
cd gym-pr-tracker
```
2. Initialize the environment and install dependencies using uv:

```bash
uv sync
```


## 🏃‍♂️ Running Locally

Start the development server:

```bash
uv run fastapi dev main.py
```

The API will be available at:

  - **Swagger UI (Interactive Docs):** http://127.0.0.1:8000/docs


## 🐳 Running with Docker

You can also run the application inside a Docker container:

1.  **Build the image:**

    ```bash
    docker build -t gym-pr-tracker .
    ```

2.  **Run the container:**

    ```bash
    docker run -p 8000:8000 gym-pr-tracker
    ```

Access the docs at: http://localhost:8000/docs

## 🧪 Running Tests

Execute the automated test suite to verify functionality:

```bash
uv run pytest
```

## 📂 Project Structure

| File | Description |
|------|-------------|
| `main.py` | The entry point of the application, defining API endpoints. |
| `models.py` | Pydantic data schemas for validation. |
| `repository.py` | Data persistence layer (In-Memory implementation). |
| `tests/` | Contains `test_main.py` with  tests. |
| `Dockerfile` | Configuration for building the Docker image. |
| `requests.http` | Bonus file for testing API requests directly in VS Code. |

-----


