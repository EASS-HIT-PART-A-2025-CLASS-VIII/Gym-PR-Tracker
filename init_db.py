#create my database and tables.
from app.database import create_db_and_tables
from app.models import PR 

if __name__ == "__main__":
    print("Manually initializing the database...")
    try:
        create_db_and_tables()
        print("Database created successfully with table 'PR'!")
    except Exception as e:
        print(f"Error creating database: {e}")