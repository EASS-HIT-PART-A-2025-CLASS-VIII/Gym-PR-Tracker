#create my database and tables.
from backend.database import create_db_and_tables
from backend.models import PR 

if __name__ == "__main__":
    print("Manually initializing the database...")
    try:
        create_db_and_tables()
        print("Database created successfully with table 'PR'!")
    except Exception as e:
        print(f"Error creating database: {e}")