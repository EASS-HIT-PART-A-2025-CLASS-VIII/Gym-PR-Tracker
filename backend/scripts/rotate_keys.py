import os
import secrets
from pathlib import Path

def rotate_secret():
    
    new_key = secrets.token_urlsafe(32)
    print(f"Generated new Secret Key: {new_key}")
    
    env_path = Path(".env")
    if env_path.exists():
        lines = env_path.read_text().splitlines()
        new_lines = []
        for line in lines:
            if line.startswith("JWT_SECRET="):
                new_lines.append(f"JWT_SECRET={new_key}")
            else:
                new_lines.append(line)
        env_path.write_text("\n".join(new_lines))
        print("Updated .env with new JWT_SECRET")
    else:
        print("No .env file found. Please create one with JWT_SECRET=...")

if __name__ == "__main__":
    rotate_secret()
