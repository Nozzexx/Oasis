from dotenv import load_dotenv
import os

from sqlalchemy import create_engine

username = os.getenv('DATABSE_USERNAME')
password = os.getenv('DATABASE_PASSWORD')
host = os.getenv('DATABASE_HOST')
port = os.getenv('DATABASE_PORT')
database = os.getenv('DATABASE_NAME')

engine = create_engine(f'postgresql://{username}:{password}@{host}:{port}/{database}')

try:
    with engine.connect() as connection:
        print("Connection successful.")
except Exception as e:
    print(f"Error connecting to the database: {e}")
