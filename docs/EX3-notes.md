# EX3 Technical Manual & Runbook

This document explains **how the application works under the hood** and provides commands for advanced operations.

---

## 🏗️ 1. System Architecture (How it Works)

Think of this application as a team of **4 specialized services** working together:

| Service       | Component          | Role                                                                     |
| :------------ | :----------------- | :----------------------------------------------------------------------- |
| **API**       | `FastAPI (Python)` | **The Brain.** Handles logic, saves data, and talks to the AI.           |
| **Interface** | `React (Vite)`     | **The Face.** The website you interact with.                             |
| **Redis**     | `Redis`            | **The Messenger.** passes tasks and data between the API and the Worker. |
| **Worker**    | `Python Worker`    | **The Muscle.** Runs heavy background tasks so the API stays fast.       |

### How they talk to each other:

1. **You** click a button on the **Interface**.
2. The **Interface** sends a request to the **API**.
3. If the task is heavy (like syncing data), the **API** sends a note to **Redis**.
4. The **Worker** picks up the note from **Redis** and does the work in the background.

---

## ⚡ 2. Background Processing (Async Telemetry)

To ensure the app never "freezes" while loading data, we use a **Background Refresher**.

- **Traffic Control (Semaphores):** We limit how many tasks run at once (max 5) to prevent crashing the server.
- **No Double Work (Idempotency):** If a user is already being synced, we skip them. We use a "Lock" in Redis to track this.
- **Smart Retries:** If a task fails, we automatically try again later.

---

## 🔒 3. Security (Keeping Data Safe)

### 🔑 Passwords

- **Never stored in plain text.**
- We use **Hashing** (scrambling the password) with `pbkdf2_sha256` so even we cannot read your password.

### 🎫 Login (JWT Tokens)

- When you log in, you get a digital "Key Card" (Token).
- **Access Token:** Valid for **15 minutes**. Used to access the app.
- **Refresh Token:** Valid for **7 days**. Used to get a new Access Token without logging in again.
- **Safety:** If you change your password or log out, these tokens are invalidated.

---

## 🤖 4. AI Development Report

This project was architected and built with the help of **Antigravity**.

- **Design:** AI helped plan the microservices structure.
- **Debugging:** AI assisted in fixing React state issues and standardizing the API.

---

## 📘 5. Operational Runbook

### Start the System

To launch all 4 services at once:

```bash
docker compose up --build
```

### Verify it's Working

- **Frontend works:** Go to [http://localhost:5173](http://localhost:5173)
- **API works:** Go to [http://localhost:8000/docs](http://localhost:8000/docs)

### Run Tests (Quality Check)

Use these commands to run the automated test suites:

```bash
# Run Backend Tests (Logic & Database)
docker compose run api pytest

# Run Frontend Tests (UI Components)
npm test
```
