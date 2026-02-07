import asyncio
import sys
import os

# Add the backend directory to sys.path to allow imports from app
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db import init_db, get_session, engine
from app.models import User, PRCreate, PR
from app.repository import UserRepository, PRRepository
from app.auth import get_password_hash
from sqlmodel import select

async def main():
    print("Initializing database...")
    await init_db()

    # Create a session manually since get_session is a dependency generator
    from sqlalchemy.orm import sessionmaker
    from sqlmodel.ext.asyncio.session import AsyncSession
    
    async_session = sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )

    async with async_session() as session:
        user_repo = UserRepository(session)
        
        # Check if test user exists
        username = "testuser"
        user = await user_repo.get_by_username(username)
        
        if not user:
            print(f"Creating user '{username}'...")
            hashed_password = get_password_hash("password123")
            user = User(username=username, hashed_password=hashed_password)
            user = await user_repo.create(user)
            print(f"User '{username}' created with ID: {user.id}")
        else:
            print(f"User '{username}' already exists.")

        # Create PRs
        pr_repo = PRRepository(session, user.id)
        existing_prs = await pr_repo.list_all()
        
        if not existing_prs:
            print("Seeding PRs...")
            prs_to_create = [
                PRCreate(exercise="Bench Press", weight=80.0, reps=5),
                PRCreate(exercise="Squat", weight=100.0, reps=5),
                PRCreate(exercise="Deadlift", weight=120.0, reps=3),
                PRCreate(exercise="Overhead Press", weight=50.0, reps=8),
                PRCreate(exercise="Pull Up", weight=10.0, reps=10),
            ]
            
            for pr_data in prs_to_create:
                await pr_repo.create(pr_data)
                print(f"Created PR: {pr_data.exercise} - {pr_data.weight}kg x {pr_data.reps}")
        else:
            print("PRs already exist. Skipping PR seeding.")

        # Sync milestones (create() handles this, but good to ensure everything is consistent)
        print("Syncing achievements...")
        await pr_repo.sync_achievements()
        
        print("Database seeded successfully!")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(main())
