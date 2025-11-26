# 1. Use a lightweight Python base image
FROM python:3.12-slim

# 2. Set the working directory inside the container
WORKDIR /app

# 3. Install uv inside the container
RUN pip install uv

# 4. Copy only dependency files first to leverage Docker cache
COPY pyproject.toml uv.lock ./

# 5. Install dependencies using uv
RUN uv sync --frozen

# 6. Copy the rest of the application code
COPY . .

# 7. Expose the port
EXPOSE 8000

# 8. Command to run the application
# We use host 0.0.0.0 to allow external access to the container
CMD ["uv", "run", "fastapi", "run", "main.py", "--port", "8000", "--host", "0.0.0.0"]