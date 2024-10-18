from datetime import datetime
import os
from sqlalchemy import create_engine, Column, Integer, Date, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import logging

# Set up logging
logger = logging.getLogger(__name__)

# Database connection parameters
DB_HOST = os.environ['DB_HOST']
DB_NAME = os.environ['DB_NAME']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']
DB_PORT = os.environ.get('DB_PORT', 5432)  # Default to 5432 if not specified

# Create the database URL
DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

# Create the SQLAlchemy engine
engine = create_engine(DATABASE_URL)

# Create a base class for declarative models
Base = declarative_base()

# Define the SpaceData model
class SpaceData(Base):
    __tablename__ = 'space_data'

    id = Column(Integer, primary_key=True)
    date = Column(Date, unique=True, nullable=False)
    neo_data = Column(JSON)
    cme_data = Column(JSON)

# Create the table in the database (if it doesn't exist)
Base.metadata.create_all(engine)

# Create a session factory
SessionLocal = sessionmaker(bind=engine)

def get_db_connection():
    """Create a database session."""
    logger.info(f"Attempting to connect to database {DB_NAME} on host {DB_HOST}")
    try:
        db = SessionLocal()
        logger.info(f"Successfully connected to database {DB_NAME}")
        return db
    except Exception as e:
        logger.error(f"Unable to connect to the database: {e}")
        raise

def store_data(neo_data, cme_data):
    """Store the processed data in the database."""
    logger.info("Attempting to store data in the database...")
    try:
        db = get_db_connection()
        today = datetime.now().date()
        
        # Check if an entry for today already exists
        existing_entry = db.query(SpaceData).filter(SpaceData.date == today).first()
        
        if existing_entry:
            # Update existing entry
            existing_entry.neo_data = neo_data
            existing_entry.cme_data = cme_data
        else:
            # Create new entry
            new_entry = SpaceData(date=today, neo_data=neo_data, cme_data=cme_data)
            db.add(new_entry)
        
        db.commit()
        logger.info("Data successfully stored in the database")
    except Exception as e:
        logger.error(f"Error storing data in the database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

# For testing purposes (can be removed in production)
if __name__ == "__main__":
    # Test database connection
    db = get_db_connection()
    db.close()
    print("Database connection successful")