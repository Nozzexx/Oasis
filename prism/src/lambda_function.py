import json
import logging
import os
import requests
import pg8000
from datetime import datetime
from typing import Dict, Any, List

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
            response = self.session.get(base_url, params=params, timeout=(60, 90))
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

class SpaceTrackAPI:
    """Space-Track.org API implementation"""
    def __init__(self):
        self.username = os.getenv('SPACE_TRACK_USERNAME')
        self.password = os.getenv('SPACE_TRACK_PASSWORD')
        if not all([self.username, self.password]):
            raise ValueError("SPACE_TRACK credentials not set in environment variables.")
        self.session = requests.Session()
        self.base_url = "https://www.space-track.org"
        self.authenticated = False

    def authenticate(self) -> None:
        """Authenticates with Space-Track.org"""
        auth_url = f"{self.base_url}/ajaxauth/login"
        credentials = {
            'identity': self.username,
            'password': self.password
        }
        try:
            response = self.session.post(auth_url, data=credentials, timeout=(60, 90))
            response.raise_for_status()
            self.authenticated = True
            logger.info("Successfully authenticated with Space-Track.org")
        except requests.exceptions.RequestException as e:
            logger.error(f"Error authenticating with Space-Track.org: {str(e)}")
            raise

    def fetch_data(self) -> List[Dict[str, Any]]:
        """Fetches satellite catalog data from Space-Track.org"""
        if not self.authenticated:
            self.authenticate()

        query_url = f"{self.base_url}/basicspacedata/query/class/satcat"
        try:
            response = self.session.get(query_url, timeout=(60, 90))
            response.raise_for_status()
            logger.info("Successfully fetched satellite catalog data")
            return response.json()
        except requests.exceptions.RequestException as e:
            logger.error(f"Error fetching Space-Track data: {str(e)}")
            raise
        finally:
            # Logout after fetching data
            self.session.get(f"{self.base_url}/ajaxauth/logout")

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

            CREATE TABLE IF NOT EXISTS sat_cat (
                norad_cat_id VARCHAR(50) PRIMARY KEY,
                intldes VARCHAR(50),
                object_type VARCHAR(50),
                satname VARCHAR(255),
                country VARCHAR(50),
                launch_date DATE,
                site VARCHAR(50),
                decay_date DATE,
                period DOUBLE PRECISION,
                inclination DOUBLE PRECISION,
                apogee INTEGER,
                perigee INTEGER,
                rcs_value DOUBLE PRECISION,
                rcs_size VARCHAR(20),
                current BOOLEAN,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        END $$;
        """
        self.db.execute_query(schema)

    def process_and_store_data(self, date: str = None) -> dict:
        """Processes and stores NASA NEO data"""
        result = {
            'success': False,
            'records_processed': 0,
            'error': None
        }

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
            result['success'] = True
            result['records_processed'] = records_processed

        except Exception as e:
            logger.error(f"Error processing NASA NEO data: {str(e)}")
            result['error'] = str(e)
        finally:
            self.db.disconnect()

        return result

    def process_and_store_satellite_data(self) -> dict:
        """Processes and stores Space-Track satellite catalog data"""
        result = {
            'success': False,
            'records_processed': 0,
            'error': None
        }

        try:
            space_track = SpaceTrackAPI()
            raw_data = space_track.fetch_data()
            records_processed = 0

            self.db.connect()
            self.setup_database()

            for sat in raw_data:
                try:
                    insert_sat = """
                    INSERT INTO sat_cat 
                    (norad_cat_id, intldes, object_type, satname, country, 
                    launch_date, site, decay_date, period, inclination, 
                    apogee, perigee, rcs_value, rcs_size, current)
                    VALUES 
                    (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (norad_cat_id) DO UPDATE SET
                        intldes = EXCLUDED.intldes,
                        object_type = EXCLUDED.object_type,
                        satname = EXCLUDED.satname,
                        country = EXCLUDED.country,
                        launch_date = EXCLUDED.launch_date,
                        site = EXCLUDED.site,
                        decay_date = EXCLUDED.decay_date,
                        period = EXCLUDED.period,
                        inclination = EXCLUDED.inclination,
                        apogee = EXCLUDED.apogee,
                        perigee = EXCLUDED.perigee,
                        rcs_value = EXCLUDED.rcs_value,
                        rcs_size = EXCLUDED.rcs_size,
                        current = EXCLUDED.current,
                        updated_at = CURRENT_TIMESTAMP
                    """

                    sat_params = [
                        sat.get('NORAD_CAT_ID'),
                        sat.get('INTLDES'),
                        sat.get('OBJECT_TYPE'),
                        sat.get('SATNAME'),
                        sat.get('COUNTRY'),
                        sat.get('LAUNCH'),
                        sat.get('SITE'),
                        sat.get('DECAY'),
                        float(sat.get('PERIOD')) if sat.get('PERIOD') else None,
                        float(sat.get('INCLINATION')) if sat.get('INCLINATION') else None,
                        int(sat.get('APOGEE')) if sat.get('APOGEE') else None,
                        int(sat.get('PERIGEE')) if sat.get('PERIGEE') else None,
                        float(sat.get('RCSVALUE')) if sat.get('RCSVALUE') else None,
                        sat.get('RCS_SIZE'),
                        sat.get('CURRENT') == 'Y'
                    ]

                    self.db.execute_query(insert_sat, sat_params)
                    records_processed += 1

                except Exception as e:
                    logger.error(f"Error processing satellite {sat.get('NORAD_CAT_ID')}: {str(e)}")
                    continue

            logger.info(f"Processed {records_processed} satellites successfully.")
            result['success'] = True
            result['records_processed'] = records_processed

        except Exception as e:
            logger.error(f"Error processing satellite data: {str(e)}")
            result['error'] = str(e)
        finally:
            self.db.disconnect()

        return result

def lambda_handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Main Lambda handler function"""
    try:
        # Get date from event or use current date
        process_date = event.get('date')

        # Initialize processor
        processor = DataProcessor()

        # Process both NEO and satellite data
        results = {
            'nasa_neo': processor.process_and_store_data(process_date),
            'space_track': processor.process_and_store_satellite_data()
        }

        # Determine overall success
        all_failed = all(not result['success'] for result in results.values())

        if all_failed:
            return {
                'statusCode': 500,
                'body': json.dumps({
                    'message': 'All API processing failed',
                    'date': process_date or datetime.now().strftime('%Y-%m-%d'),
                    'details': {
                        'nasa_neo': {
                            'success': False,
                            'error': results['nasa_neo']['error']
                        },
                        'space_track': {
                            'success': False,
                            'error': results['space_track']['error']
                        }
                    }
                })
            }

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Processing completed',
                'date': process_date or datetime.now().strftime('%Y-%m-%d'),
                'results': {
                    'nasa_neo': {
                        'success': results['nasa_neo']['success'],
                        'records_processed': results['nasa_neo']['records_processed'],
                        'error': results['nasa_neo']['error']
                    },
                    'space_track': {
                        'success': results['space_track']['success'],
                        'records_processed': results['space_track']['records_processed'],
                        'error': results['space_track']['error']
                    }
                }
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
