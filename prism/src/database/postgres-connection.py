import os
import psycopg2
from psycopg2.extras import Json
import logging

logger = logging.getLogger()

# Database connection parameters
DB_HOST = os.environ['DB_HOST']
DB_NAME = os.environ['DB_NAME']
DB_USER = os.environ['DB_USER']
DB_PASSWORD = os.environ['DB_PASSWORD']

def get_db_connection():
    """Create a database connection."""
    try:
        conn = psycopg2.connect(
            host=DB_HOST,
            database=DB_NAME,
            user=DB_USER,
            password=DB_PASSWORD
        )
        return conn
    except psycopg2.Error as e:
        logger.error(f"Unable to connect to the database: {e}")
        raise

def store_data(neo_data, cme_data):
    """Store the processed data in the database."""
    try:
        with get_db_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("""
                    INSERT INTO space_data (date, neo_data, cme_data)
                    VALUES (CURRENT_DATE, %s, %s)
                    ON CONFLICT (date) DO UPDATE
                    SET neo_data = EXCLUDED.neo_data,
                        cme_data = EXCLUDED.cme_data
                """, (Json(neo_data), Json(cme_data)))
            conn.commit()
        logger.info("Data successfully stored in the database")
    except psycopg2.Error as e:
        logger.error(f"Error storing data in the database: {e}")
        raise