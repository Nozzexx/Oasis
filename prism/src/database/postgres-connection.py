from sqlalchemy import create_engine

username = 'postgres'
password = 'password'
host = 'localhost'
port = '5432'
database = 'oasis_db'

engine = create_engine(f'postgresql://{username}:{password}@{host}:{port}/{database}')

try:
    with engine.connect() as connection:
        print("Connection successful.")
except Exception as e:
    print(f"Error connecting to the database: {e}")
