import json
import logging
import os
import requests
import pg8000
from datetime import datetime
from typing import Dict, Any, List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Configure logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

class NASANeoWsAPI:
    """NASA Near Earth Objects Web Service API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.session = requests.Session()
        self.session.mount('https://', requests.adapters.HTTPAdapter(
            max_retries=3,
            pool_connections=100,
            pool_maxsize=100
        ))

    def fetch_data(self, start_date: str = None) -> Dict[str, Any]:
        """Fetches NEO data from NASA API"""
        if not start_date:
            start_date = datetime.now().strftime('%Y-%m-%d')
            
        base_url = "https://api.nasa.gov/neo/rest/v1/feed"
        params = {
            'start_date': start_date,
            'api_key': self.api_key
        }
        
        try:
            response = self.session.get(base_url, params=params, timeout=(5, 30))
            response.raise_for_status()
            logger.info(f"Fetched data for date: {start_date}")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching NASA NEOWS data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms NEO data"""
        sanitized_data = []
        try:
            for date, neo_list in raw_data.get('near_earth_objects', {}).items():
                for neo in neo_list:
                    # Extract the maximum estimated diameter in kilometers
                    estimated_diameter_km = neo['estimated_diameter']['kilometers']['estimated_diameter_max']

                    # Ensure 'close_approach_data' is not empty
                    if not neo.get('close_approach_data'):
                        logger.warning(f"No close approach data for NEO {neo['id']}")
                        continue

                    sanitized_neo = {
                        'id': neo['id'],
                        'name': neo['name'],
                        'date': date,
                        'estimated_diameter_km': estimated_diameter_km,
                        'is_potentially_hazardous': neo['is_potentially_hazardous_asteroid'],
                        'close_approach_data': [{
                            'close_approach_date': approach['close_approach_date'],
                            'relative_velocity_kph': float(approach['relative_velocity']['kilometers_per_hour']),
                            'miss_distance_km': float(approach['miss_distance']['kilometers'])
                        } for approach in neo['close_approach_data']]
                    }
                    sanitized_data.append(sanitized_neo)
        except KeyError as e:
            logger.error(f"Error sanitizing NEO data: Missing key {str(e)}")
            raise
        return sanitized_data

class DatabaseConnection:
    """Manages PostgreSQL database connections and operations"""
    def __init__(self):
        self.host = os.getenv('DB_HOST')
        self.port = int(os.getenv('DB_PORT', '5432'))
        self.database = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        self.connection = None

        # Validate environment variables
        if not all([self.host, self.database, self.user, self.password]):
            raise ValueError("Database connection environment variables are not properly set.")

    def connect(self) -> None:
        """Establishes database connection with SSL"""
        try:
            self.connection = pg8000.connect(
                user=self.user,
                password=self.password,
                host=self.host,
                port=self.port,
                database=self.database,
                ssl_context=True,
                tcp_keepalive=True
            )
            logger.info("Successfully connected to PostgreSQL database with SSL")
        except Exception as e:
            logger.error(f"Error connecting to database: {str(e)}")
            raise

    def disconnect(self) -> None:
        """Closes database connection"""
        try:
            if self.connection:
                self.connection.close()
                logger.info("Database connection closed")
        except Exception as e:
            logger.error(f"Error disconnecting from database: {str(e)}")
            raise

    def execute_query(self, query: str, params: List = None) -> Any:
        """Executes SQL query with proper parameter handling"""
        try:
            logger.info(f"Executing query: {query.strip().splitlines()[0]}...")
            cursor = self.connection.cursor()
            if params:
                logger.info(f"Parameters: {params}")
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            self.connection.commit()
            cursor.close()
        except Exception as e:
            logger.error(f"Error executing query: {str(e)}")
            logger.error(f"Query was: {query}")
            if params:
                logger.error(f"Parameters were: {params}")
            raise

class DataProcessor:
    """Main data processing class"""
    def __init__(self):
        self.db = DatabaseConnection()
        self.nasa_api = NASANeoWsAPI()

    def setup_database(self):
        """Creates necessary database tables if they don't exist"""
        schema = """
        DO $$ 
        BEGIN
            CREATE TABLE IF NOT EXISTS neo_objects (
                id VARCHAR(50) PRIMARY KEY,
                name VARCHAR(255),
                observation_date DATE,
                estimated_diameter_km DOUBLE PRECISION,
                is_potentially_hazardous BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS neo_approaches (
                id SERIAL PRIMARY KEY,
                neo_id VARCHAR(50) REFERENCES neo_objects(id),
                close_approach_date DATE,
                relative_velocity_kph DOUBLE PRECISION,
                miss_distance_km DOUBLE PRECISION,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        END $$;
        """
        self.db.execute_query(schema)

    def process_and_store_data(self, date: str = None) -> int:
        """Processes and stores NASA NEO data"""
        try:
            self.db.connect()
            self.setup_database()
            
            # Fetch and process data
            raw_data = self.nasa_api.fetch_data(date)
            processed_data = self.nasa_api.sanitize_data(raw_data)
            
            records_processed = 0
            
            # Store data
            for item in processed_data:
                try:
                    logger.info(f"Processing NEO {item['id']} with {len(item['close_approach_data'])} close approaches")

                    # Insert neo object
                    insert_neo = """
                    INSERT INTO neo_objects 
                    (id, name, observation_date, estimated_diameter_km, is_potentially_hazardous)
                    VALUES 
                    (%s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                        name = EXCLUDED.name,
                        observation_date = EXCLUDED.observation_date,
                        estimated_diameter_km = EXCLUDED.estimated_diameter_km,
                        is_potentially_hazardous = EXCLUDED.is_potentially_hazardous
                    """
                    
                    neo_params = [
                        item['id'],
                        item['name'],
                        datetime.strptime(item['date'], '%Y-%m-%d').date(),
                        float(item['estimated_diameter_km']),
                        bool(item['is_potentially_hazardous'])
                    ]
                    
                    self.db.execute_query(insert_neo, neo_params)
                    records_processed += 1
                    
                    # Insert approach data
                    for approach in item['close_approach_data']:
                        insert_approach = """
                        INSERT INTO neo_approaches 
                        (neo_id, close_approach_date, relative_velocity_kph, miss_distance_km)
                        VALUES 
                        (%s, %s, %s, %s)
                        """
                        
                        approach_params = [
                            item['id'],
                            datetime.strptime(approach['close_approach_date'], '%Y-%m-%d').date(),
                            float(approach['relative_velocity_kph']),
                            float(approach['miss_distance_km'])
                        ]
                        
                        self.db.execute_query(insert_approach, approach_params)
                        
                except Exception as e:
                    logger.error(f"Error processing item {item['id']}: {str(e)}")
                    continue
            
            logger.info(f"Processed {records_processed} NEOs successfully.")
            return records_processed
            
        except Exception as e:
            logger.error(f"Error processing data: {str(e)}")
            raise
        finally:
            self.db.disconnect()

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler function"""
    try:
        # Get date from event or use current date
        process_date = event.get('date')
        
        # Initialize and run processor
        processor = DataProcessor()
        records_processed = processor.process_and_store_data(process_date)
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data processing completed successfully',
                'date': process_date or datetime.now().strftime('%Y-%m-%d'),
                'records_processed': records_processed
            })
        }
        
    except Exception as e:
        logger.error(f"Lambda execution failed: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({
                'message': f'Error processing data: {str(e)}',
                'date': process_date if 'process_date' in locals() else None
            })
        }
