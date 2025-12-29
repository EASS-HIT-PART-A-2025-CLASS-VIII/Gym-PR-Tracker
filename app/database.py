import os
from sqlmodel import SQLModel, create_engine, Session

if not os.path.exists("data"):
    os.makedirs("data")

sqlite_file_name = "data/gym.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, connect_args={"check_same_thread": False})

def create_db_and_tables():
    print("STARTING DB SETUP...") 
    from app.models import PR
    print(f"Model imported. Table name should be: {PR.__tablename__}")

    SQLModel.metadata.create_all(engine)
    print("TABLES CREATED SUCCESSFULLY!")

def get_session():
    with Session(engine) as session:
        yield session