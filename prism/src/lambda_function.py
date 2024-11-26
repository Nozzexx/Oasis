import json
import logging
import os
import asyncio
import aiohttp
import asyncpg
from datetime import datetime, timedelta
from typing import Dict, Any, List
import sys
from dotenv import load_dotenv
from dateutil import parser
import pytz

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('nasa_data.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Utility Functions
def parse_datetime(date_string):
    """Parse datetime with or without microseconds."""
    try:
        # Try parsing with microseconds
        return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S.%f')
    except ValueError:
        # Fallback to parsing without microseconds
        return datetime.strptime(date_string, '%Y-%m-%dT%H:%M:%S')

def get_date_range():
    """Returns start date and end date for API queries (30 day range)"""
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    return start_date.strftime('%Y-%m-%d'), end_date.strftime('%Y-%m-%d')

class NASANeoWsAPI:
    """NASA Near Earth Objects Web Service API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.base_url = "https://api.nasa.gov/neo/rest/v1/feed"

    async def fetch_data(self, session: aiohttp.ClientSession, start_date: str = None) -> Dict[str, Any]:
        """Fetches NEO data from NASA API asynchronously"""
        if not start_date:
            start_date = datetime.now().strftime('%Y-%m-%d')
        params = {
            'start_date': start_date,
            'api_key': self.api_key
        }
        try:
            async with session.get(self.base_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info(f"Fetched NEO data for date: {start_date}")
                return data
        except Exception as e:
            logger.error(f"Error fetching NEO data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms NEO data"""
        sanitized_data = []
        try:
            for date, neo_list in raw_data.get('near_earth_objects', {}).items():
                for neo in neo_list:
                    estimated_diameter_km = neo['estimated_diameter']['kilometers']['estimated_diameter_max']
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
            return sanitized_data
        except Exception as e:
            logger.error(f"Error sanitizing NEO data: {str(e)}")
            raise

class DONKICMEAPI:
    """NASA DONKI CME API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.base_url = "https://api.nasa.gov/DONKI/CME"

    async def fetch_data(self, session: aiohttp.ClientSession, start_date: str = None) -> List[Dict[str, Any]]:
        """Fetches CME data from NASA DONKI API asynchronously"""
        start_date, end_date = get_date_range()
        params = {
            'startDate': start_date,
            'endDate': end_date,
            'api_key': self.api_key
        }
        try:
            async with session.get(self.base_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info(f"Fetched DONKI CME data for date: {start_date}")
                return data
        except Exception as e:
            logger.error(f"Error fetching DONKI CME data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms CME data"""
        sanitized_data = []
        for cme in raw_data:
            try:
                # Extract analysis data from the first analysis if available
                analysis = cme.get('cmeAnalyses', [{}])[0]
                
                sanitized_cme = {
                    'activity_id': cme.get('activityID'),
                    'catalog': cme.get('catalog', ''),
                    'start_time': cme.get('startTime'),
                    'source_location': cme.get('sourceLocation', ''),
                    'active_region_num': cme.get('activeRegionNum'),
                    'link': cme.get('link', ''),
                    'note': cme.get('note', ''),
                    # Analysis fields
                    'latitude': analysis.get('latitude'),
                    'longitude': analysis.get('longitude'),
                    'half_angle': analysis.get('halfAngle'),
                    'speed': analysis.get('speed'),
                    'type': analysis.get('type', ''),
                    'level_of_data': analysis.get('levelOfData', 0),
                    'completion_time': analysis.get('modelCompletionTime'),
                    'is_most_accurate': analysis.get('isMostAccurate', False)
                }
                sanitized_data.append(sanitized_cme)
            except Exception as e:
                logger.error(f"Error sanitizing CME data: {e}")
                continue
                
        return sanitized_data
    
class GeostormAPI:
    """NASA DONKI Geomagnetic Storm API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.base_url = "https://api.nasa.gov/DONKI/GST"

    async def fetch_data(self, session: aiohttp.ClientSession, start_date: str = None) -> List[Dict[str, Any]]:
        """Fetches Geomagnetic Storm data from NASA DONKI API asynchronously"""
        end_date = datetime.now().strftime('%Y-%m-%d')
        start_date = "2010-01-01"  # Fixed start date
        params = {
            'startDate': start_date,
            'endDate': end_date,
            'api_key': self.api_key
        }
        try:
            async with session.get(self.base_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info(f"Fetched DONKI Geostorm data from 2010 to {end_date}")
                return data
        except Exception as e:
            logger.error(f"Error fetching DONKI Geostorm data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms Geomagnetic Storm data"""
        sanitized_data = []
        
        # Check if raw_data is None or empty
        if not raw_data:
            logger.warning("No geostorm data received")
            return []
            
        for storm in raw_data:
            try:
                # Process KP Index data with safety checks
                kp_index_data = []
                if storm.get('allKpIndex'):  # Changed from 'in storm' to get()
                    for kp in storm['allKpIndex']:
                        if kp and isinstance(kp, dict):  # Add type checking
                            kp_index_data.append({
                                'observed_time': kp.get('observedTime'),
                                'kp_index': float(kp.get('kpIndex', 0)),
                                'source': kp.get('source', '')
                            })

                # Process linked events with safety checks
                linked_events = []
                if storm.get('linkedEvents'):  # Changed from 'in storm' to get()
                    for event in storm['linkedEvents']:
                        if event and isinstance(event, dict):  # Add type checking
                            event_id = event.get('activityID')
                            if event_id:
                                linked_events.append(event_id)

                sanitized_storm = {
                    'gst_id': storm.get('gstID'),
                    'start_time': storm.get('startTime'),
                    'linked_events': linked_events,
                    'kp_index_data': kp_index_data,
                    'link': storm.get('link', ''),
                    'submission_time': storm.get('submissionTime'),
                    'version_id': int(storm.get('versionId', 0))
                }
                
                # Only add if we have a valid gst_id
                if sanitized_storm['gst_id']:
                    sanitized_data.append(sanitized_storm)
                else:
                    logger.warning("Skipping storm record with no gst_id")
                    
            except Exception as e:
                logger.error(f"Error sanitizing Geostorm data: {e}")
                logger.debug(f"Problematic storm data: {storm}")
                continue
        
        logger.info(f"Successfully sanitized {len(sanitized_data)} geostorm records")
        return sanitized_data

class SolarFlareAPI:
    """NASA DONKI Solar Flare API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.base_url = "https://api.nasa.gov/DONKI/FLR"

    async def fetch_data(self, session: aiohttp.ClientSession, start_date: str = None) -> List[Dict[str, Any]]:
        """Fetches Solar Flare data from NASA DONKI API asynchronously"""
        start_date, end_date = get_date_range()
        params = {
            'startDate': start_date,
            'endDate': end_date,
            'api_key': self.api_key
        }
        try:
            async with session.get(self.base_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info(f"Fetched DONKI Solar Flare data for date: {start_date}")
                return data
        except Exception as e:
            logger.error(f"Error fetching DONKI Solar Flare data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms Solar Flare data"""
        sanitized_data = []
        
        # Check if raw_data is None or empty
        if not raw_data:
            logger.warning("No solar flare data received")
            return []
            
        for flare in raw_data:
            try:
                # Safely get linked events
                linked_events = []
                if flare.get('linkedEvents'):  # Changed from 'in flare' to get()
                    for event in flare['linkedEvents']:
                        if event and isinstance(event, dict):  # Add type checking
                            event_id = event.get('activityID')
                            if event_id:
                                linked_events.append(event_id)

                # Safely get instruments
                instruments = []
                if flare.get('instruments'):  # Changed from 'in flare' to get()
                    for inst in flare['instruments']:
                        if inst and isinstance(inst, dict):  # Add type checking
                            display_name = inst.get('displayName')
                            if display_name:
                                instruments.append(display_name)

                sanitized_flare = {
                    'flare_id': flare.get('flrID'),
                    'begin_time': flare.get('beginTime'),
                    'peak_time': flare.get('peakTime'),
                    'end_time': flare.get('endTime'),
                    'class_type': flare.get('classType'),
                    'source_location': flare.get('sourceLocation'),
                    'active_region_num': flare.get('activeRegionNum'),
                    'linked_events': linked_events,
                    'link': flare.get('link', ''),
                    'note': flare.get('note', ''),
                    'instruments': instruments
                }
                sanitized_data.append(sanitized_flare)
                
            except Exception as e:
                logger.error(f"Error sanitizing Solar Flare data: {e}")
                logger.debug(f"Problematic flare data: {flare}")
                continue

        return sanitized_data

class HighSpeedStreamAPI:
    """NASA DONKI High Speed Stream API implementation"""
    def __init__(self):
        self.api_key = os.getenv('NASA_API_KEY')
        if not self.api_key:
            raise ValueError("NASA_API_KEY environment variable not set.")
        self.base_url = "https://api.nasa.gov/DONKI/HSS"

    async def fetch_data(self, session: aiohttp.ClientSession, start_date: str = None) -> List[Dict[str, Any]]:
        """Fetches High Speed Stream data from NASA DONKI API asynchronously"""
        start_date, end_date = get_date_range()
        params = {
            'startDate': start_date,
            'endDate': end_date,
            'api_key': self.api_key
        }
        try:
            async with session.get(self.base_url, params=params) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info(f"Fetched DONKI HSS data for date: {start_date}")
                return data
        except Exception as e:
            logger.error(f"Error fetching DONKI HSS data: {str(e)}")
            raise

    def sanitize_data(self, raw_data: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Sanitizes and transforms High Speed Stream data"""
        sanitized_data = []
        for hss in raw_data:
            try:
                linked_events = []
                if hss.get('linkedEvents'):
                    for event in hss['linkedEvents']:
                        linked_events.append(event.get('activityID'))

                sanitized_hss = {
                    'hss_id': hss.get('hssID'),
                    'event_time': hss.get('eventTime'),
                    'instruments': [inst.get('displayName') for inst in hss.get('instruments', [])],
                    'linked_events': linked_events,
                    'link': hss.get('link', ''),
                    'submission_time': hss.get('submissionTime'),
                    'version_id': int(hss.get('versionId', 0))
                }
                sanitized_data.append(sanitized_hss)
            except Exception as e:
                logger.error(f"Error sanitizing HSS data: {e}")
                continue
                
        return sanitized_data

class SpaceTrackAPI:
    """Space-Track.org API implementation"""
    def __init__(self):
        self.username = os.getenv('SPACE_TRACK_USERNAME')
        self.password = os.getenv('SPACE_TRACK_PASSWORD')
        if not all([self.username, self.password]):
            raise ValueError("SPACE_TRACK credentials not set in environment variables.")
        self.base_url = "https://www.space-track.org"

    async def fetch_satcat_data(self, session: aiohttp.ClientSession) -> List[Dict[str, Any]]:
        """Fetches satellite catalog data asynchronously"""
        auth_url = f"{self.base_url}/ajaxauth/login"
        query_url = f"{self.base_url}/basicspacedata/query/class/satcat"
        credentials = {
            'identity': self.username,
            'password': self.password
        }

        try:
            async with session.post(auth_url, data=credentials) as auth_response:
                auth_response.raise_for_status()
                logger.info("Authenticated with Space-Track.org")

            async with session.get(query_url) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info("Fetched satellite catalog data")
                return data
        except Exception as e:
            logger.error(f"Error fetching SatCat data: {str(e)}")
            raise

    async def fetch_gp_data(self, session: aiohttp.ClientSession) -> List[Dict[str, Any]]:
        """Fetches GP data asynchronously"""
        auth_url = f"{self.base_url}/ajaxauth/login"
        query_url = f"{self.base_url}/basicspacedata/query/class/gp"
        credentials = {
            'identity': self.username,
            'password': self.password
        }

        try:
            async with session.post(auth_url, data=credentials) as auth_response:
                auth_response.raise_for_status()
                logger.info("Authenticated with Space-Track.org")

            async with session.get(query_url) as response:
                response.raise_for_status()
                data = await response.json()
                logger.info("Fetched GP data")
                return data
        except Exception as e:
            logger.error(f"Error fetching GP data: {str(e)}")
            raise

class DatabaseConnection:
    """Manages PostgreSQL database connections and operations using asyncpg"""
    def __init__(self):
        self.host = os.getenv('DB_HOST')
        self.port = int(os.getenv('DB_PORT', '5432'))
        self.database = os.getenv('DB_NAME')
        self.user = os.getenv('DB_USER')
        self.password = os.getenv('DB_PASSWORD')
        
        # Validate database configuration
        required_fields = ['DB_HOST', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
        missing_fields = [field for field in required_fields if not os.getenv(field)]
        if missing_fields:
            raise ValueError(f"Missing required database configuration: {', '.join(missing_fields)}")

    async def connect(self):
        try:
            pool = await asyncpg.create_pool(
                user=self.user,
                password=self.password,
                database=self.database,
                host=self.host,
                port=self.port,
                min_size=1,
                max_size=10
            )
            logger.info(f"Successfully connected to database at {self.host}")
            return pool
        except Exception as e:
            logger.error(f"Failed to connect to database: {str(e)}")
            raise

    async def setup_database(self, pool):
        """Creates necessary database tables if they don't exist"""
        create_enum_sql = """
        DO $$ 
        BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'current_enum') THEN
                CREATE TYPE current_enum AS ENUM ('Y', 'N');
            END IF;
        END $$;
        """
        
        create_tables_sql = """
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

        CREATE TABLE IF NOT EXISTS donki_cme (
            id SERIAL PRIMARY KEY,
            activity_id VARCHAR(50) UNIQUE,
            catalog VARCHAR(50),
            start_time TIMESTAMP,
            source_location VARCHAR(50),
            active_region_num VARCHAR(50),
            link TEXT,
            note TEXT,
            latitude FLOAT,
            longitude FLOAT,
            half_angle FLOAT,
            speed FLOAT,
            type VARCHAR(50),
            level_of_data INTEGER,
            completion_time TIMESTAMP,
            is_most_accurate BOOLEAN,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS donki_geostorm (
            id SERIAL PRIMARY KEY,
            gst_id VARCHAR(50) UNIQUE,
            start_time TIMESTAMP,
            link TEXT,
            submission_time TIMESTAMP,
            version_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS geostorm_kp_index (
            id SERIAL PRIMARY KEY,
            gst_id VARCHAR(50) REFERENCES donki_geostorm(gst_id),
            observed_time TIMESTAMP,
            kp_index FLOAT,
            source VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS donki_solar_flare (
            id SERIAL PRIMARY KEY,
            flare_id VARCHAR(50) UNIQUE,
            begin_time TIMESTAMP,
            peak_time TIMESTAMP,
            end_time TIMESTAMP,
            class_type VARCHAR(10),
            source_location VARCHAR(50),
            active_region_num INTEGER,
            link TEXT,
            note TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS solar_flare_instruments (
            id SERIAL PRIMARY KEY,
            flare_id VARCHAR(50) REFERENCES donki_solar_flare(flare_id),
            instrument_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS donki_hss (
            id SERIAL PRIMARY KEY,
            hss_id VARCHAR(50) UNIQUE,
            event_time TIMESTAMP,
            link TEXT,
            submission_time TIMESTAMP,
            version_id INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS hss_instruments (
            id SERIAL PRIMARY KEY,
            hss_id VARCHAR(50) REFERENCES donki_hss(hss_id),
            instrument_name VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS linked_events (
            id SERIAL PRIMARY KEY,
            source_id VARCHAR(50),
            source_type VARCHAR(20),
            linked_activity_id VARCHAR(50),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS sat_cat (
            INTLDES char(12) NOT NULL,
            NORAD_CAT_ID int PRIMARY KEY CHECK (NORAD_CAT_ID >= 0),
            OBJECT_TYPE varchar(12),
            SATNAME char(25) NOT NULL,
            COUNTRY char(6) NOT NULL,
            LAUNCH_DATE date,
            SITE char(5),
            DECAY_DATE date,
            PERIOD decimal(12,2),
            INCLINATION decimal(12,2),
            APOGEE bigint CHECK (APOGEE >= 0),
            PERIGEE bigint CHECK (PERIGEE >= 0),
            RCS_VALUE int NOT NULL DEFAULT 0,
            RCS_SIZE varchar(6),
            LAUNCH_YEAR smallint NOT NULL DEFAULT 0 CHECK (LAUNCH_YEAR >= 0),
            LAUNCH_NUM smallint NOT NULL DEFAULT 0 CHECK (LAUNCH_NUM >= 0),
            LAUNCH_PIECE varchar(3) NOT NULL,
            CURRENT current_enum NOT NULL DEFAULT 'N',
            OBJECT_NAME char(25) NOT NULL,
            OBJECT_ID char(12) NOT NULL,
            OBJECT_NUMBER int CHECK (OBJECT_NUMBER >= 0),
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS gp (
            NORAD_CAT_ID character varying PRIMARY KEY,
            OBJECT_NAME character(1),
            OBJECT_ID character(1),
            MEAN_ELEMENT_THEORY character varying,
            CREATION_DATE timestamp without time zone,
            EPOCH timestamp without time zone,
            MEAN_MOTION double precision,
            ECCENTRICITY double precision,
            INCLINATION double precision,
            RA_OF_ASC_NODE double precision,
            ARG_OF_PERICENTER double precision,
            MEAN_ANOMALY double precision,
            BSTAR double precision,
            MEAN_MOTION_DOT double precision,
            MEAN_MOTION_DDOT double precision,
            SEMIMAJOR_AXIS double precision,
            PERIOD double precision,
            APOAPSIS double precision,
            PERIAPSIS double precision,
            REV_AT_EPOCH bigint,
            OBJECT_TYPE character varying,
            COUNTRY_CODE char,
            RCS_SIZE character varying,
            LAUNCH_DATE date,
            DECAY_DATE date,
            GP_ID integer,
            TLE_LINE0 character varying,
            TLE_LINE1 character varying,
            TLE_LINE2 character varying,
            created_at timestamp DEFAULT CURRENT_TIMESTAMP,
            updated_at timestamp DEFAULT CURRENT_TIMESTAMP
        );
        """

        create_trigger_sql = """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM pg_trigger
                WHERE tgname = 'set_updated_at'
            ) THEN
                CREATE OR REPLACE FUNCTION update_updated_at_column()
                RETURNS TRIGGER AS $func$
                BEGIN
                    NEW.updated_at = CURRENT_TIMESTAMP;
                    RETURN NEW;
                END;
                $func$ LANGUAGE plpgsql;

                CREATE TRIGGER set_updated_at
                BEFORE UPDATE ON gp
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
            END IF;
        END;
        $$ LANGUAGE plpgsql;
        """

        try:
            async with pool.acquire() as conn:
                async with conn.transaction():
                    await conn.execute(create_enum_sql)
                    logger.info("Created or verified current_enum type")
                    await conn.execute(create_tables_sql)
                    logger.info("Created or verified all required tables")
                    await conn.execute(create_trigger_sql)
                    logger.info("Created or verified updated_at trigger")
        except Exception as e:
            logger.error(f"Error setting up database: {str(e)}")
            raise
async def process_nasa_data(pool, api, date=None):
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_data(session, date)
        processed_data = api.sanitize_data(raw_data)

    insert_neo_query = """
    INSERT INTO neo_objects 
    (id, name, observation_date, estimated_diameter_km, is_potentially_hazardous)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (id) DO UPDATE SET
        name = EXCLUDED.name,
        observation_date = EXCLUDED.observation_date,
        estimated_diameter_km = EXCLUDED.estimated_diameter_km,
        is_potentially_hazardous = EXCLUDED.is_potentially_hazardous
    """

    insert_approach_query = """
    INSERT INTO neo_approaches 
    (neo_id, close_approach_date, relative_velocity_kph, miss_distance_km)
    VALUES ($1, $2, $3, $4)
    """

    async with pool.acquire() as connection:
        async with connection.transaction():
            await connection.executemany(insert_neo_query, [
                (item['id'], item['name'], datetime.strptime(item['date'], '%Y-%m-%d').date(),
                 float(item['estimated_diameter_km']), bool(item['is_potentially_hazardous']))
                for item in processed_data
            ])

            approach_params = [
                (item['id'], datetime.strptime(approach['close_approach_date'], '%Y-%m-%d').date(),
                 float(approach['relative_velocity_kph']), float(approach['miss_distance_km']))
                for item in processed_data for approach in item['close_approach_data']
            ]

            if approach_params:
                await connection.executemany(insert_approach_query, approach_params)

    logger.info(f"Inserted {len(processed_data)} NEO records into the database.")

async def process_donki_cme_data(pool, api, date=None):
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_data(session, date)
        processed_data = api.sanitize_data(raw_data)

    insert_cme_query = """
    INSERT INTO donki_cme 
    (activity_id, catalog, start_time, source_location, active_region_num,
     link, note, latitude, longitude, half_angle, speed, type,
     level_of_data, completion_time, is_most_accurate)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    ON CONFLICT (activity_id) DO UPDATE SET
        catalog = EXCLUDED.catalog,
        start_time = EXCLUDED.start_time,
        source_location = EXCLUDED.source_location,
        active_region_num = EXCLUDED.active_region_num,
        link = EXCLUDED.link,
        note = EXCLUDED.note,
        latitude = EXCLUDED.latitude,
        longitude = EXCLUDED.longitude,
        half_angle = EXCLUDED.half_angle,
        speed = EXCLUDED.speed,
        type = EXCLUDED.type,
        level_of_data = EXCLUDED.level_of_data,
        completion_time = EXCLUDED.completion_time,
        is_most_accurate = EXCLUDED.is_most_accurate
    """

    async with pool.acquire() as connection:
        try:
            await connection.executemany(insert_cme_query, [
                (
                    item['activity_id'],
                    item['catalog'],
                    parser.parse(item['start_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                    item['source_location'],
                    str(item['active_region_num']) if item.get('active_region_num') is not None else None,
                    item['link'],
                    item['note'],
                    item['latitude'],
                    item['longitude'],
                    item['half_angle'],
                    item['speed'],
                    item['type'],
                    item['level_of_data'],
                    parser.parse(item['completion_time']).astimezone(pytz.UTC).replace(tzinfo=None) if item.get('completion_time') else None,
                    item['is_most_accurate']
                )
                for item in processed_data
            ])
            logger.info(f"Inserted {len(processed_data)} CME records into the database.")
        except Exception as e:
            logger.error(f"Error inserting CME data: {e}")
            raise

async def process_geostorm_data(pool, api, date=None):
    """Process Geomagnetic Storm data"""
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_data(session, date)
        processed_data = api.sanitize_data(raw_data)

    insert_storm_query = """
    INSERT INTO donki_geostorm 
    (gst_id, start_time, link, submission_time, version_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (gst_id) DO UPDATE SET
        start_time = EXCLUDED.start_time,
        link = EXCLUDED.link,
        submission_time = EXCLUDED.submission_time,
        version_id = EXCLUDED.version_id
    RETURNING gst_id;
    """

    insert_kp_query = """
    INSERT INTO geostorm_kp_index 
    (gst_id, observed_time, kp_index, source)
    VALUES ($1, $2, $3, $4)
    """

    insert_linked_events_query = """
    INSERT INTO linked_events 
    (source_id, source_type, linked_activity_id)
    VALUES ($1, $2, $3)
    """

    async with pool.acquire() as connection:
        try:
            async with connection.transaction():
                for storm in processed_data:
                    # Insert main storm data
                    storm_record = await connection.fetchrow(
                        insert_storm_query,
                        storm['gst_id'],
                        parser.parse(storm['start_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                        storm['link'],
                        parser.parse(storm['submission_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                        storm['version_id']
                    )

                    # Insert KP index data
                    for kp_data in storm['kp_index_data']:
                        await connection.execute(
                            insert_kp_query,
                            storm['gst_id'],
                            parser.parse(kp_data['observed_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                            kp_data['kp_index'],
                            kp_data['source']
                        )

                    # Insert linked events
                    for event_id in storm['linked_events']:
                        await connection.execute(
                            insert_linked_events_query,
                            storm['gst_id'],
                            'GST',
                            event_id
                        )

            logger.info(f"Inserted {len(processed_data)} geostorm records into the database.")
        except Exception as e:
            logger.error(f"Error inserting geostorm data: {e}")
            raise

async def process_solar_flare_data(pool, api, date=None):
    """Process Solar Flare data"""
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_data(session, date)
        processed_data = api.sanitize_data(raw_data)

    insert_flare_query = """
    INSERT INTO donki_solar_flare 
    (flare_id, begin_time, peak_time, end_time, class_type, 
     source_location, active_region_num, link, note)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    ON CONFLICT (flare_id) DO UPDATE SET
        begin_time = EXCLUDED.begin_time,
        peak_time = EXCLUDED.peak_time,
        end_time = EXCLUDED.end_time,
        class_type = EXCLUDED.class_type,
        source_location = EXCLUDED.source_location,
        active_region_num = EXCLUDED.active_region_num,
        link = EXCLUDED.link,
        note = EXCLUDED.note
    RETURNING flare_id;
    """

    insert_instrument_query = """
    INSERT INTO solar_flare_instruments 
    (flare_id, instrument_name)
    VALUES ($1, $2)
    """

    insert_linked_events_query = """
    INSERT INTO linked_events 
    (source_id, source_type, linked_activity_id)
    VALUES ($1, $2, $3)
    """

    async with pool.acquire() as connection:
        try:
            async with connection.transaction():
                for flare in processed_data:
                    # Insert main flare data
                    flare_record = await connection.fetchrow(
                        insert_flare_query,
                        flare['flare_id'],
                        parser.parse(flare['begin_time']).astimezone(pytz.UTC).replace(tzinfo=None) if flare['begin_time'] else None,
                        parser.parse(flare['peak_time']).astimezone(pytz.UTC).replace(tzinfo=None) if flare['peak_time'] else None,
                        parser.parse(flare['end_time']).astimezone(pytz.UTC).replace(tzinfo=None) if flare['end_time'] else None,
                        flare['class_type'],
                        flare['source_location'],
                        flare['active_region_num'],
                        flare['link'],
                        flare['note']
                    )

                    # Insert instruments
                    for instrument in flare['instruments']:
                        await connection.execute(
                            insert_instrument_query,
                            flare['flare_id'],
                            instrument
                        )

                    # Insert linked events
                    for event_id in flare['linked_events']:
                        await connection.execute(
                            insert_linked_events_query,
                            flare['flare_id'],
                            'FLR',
                            event_id
                        )

            logger.info(f"Inserted {len(processed_data)} solar flare records into the database.")
        except Exception as e:
            logger.error(f"Error inserting solar flare data: {e}")
            raise

async def process_hss_data(pool, api, date=None):
    """Process High Speed Stream data"""
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_data(session, date)
        processed_data = api.sanitize_data(raw_data)

    insert_hss_query = """
    INSERT INTO donki_hss 
    (hss_id, event_time, link, submission_time, version_id)
    VALUES ($1, $2, $3, $4, $5)
    ON CONFLICT (hss_id) DO UPDATE SET
        event_time = EXCLUDED.event_time,
        link = EXCLUDED.link,
        submission_time = EXCLUDED.submission_time,
        version_id = EXCLUDED.version_id
    RETURNING hss_id;
    """

    insert_instrument_query = """
    INSERT INTO hss_instruments 
    (hss_id, instrument_name)
    VALUES ($1, $2)
    """

    insert_linked_events_query = """
    INSERT INTO linked_events 
    (source_id, source_type, linked_activity_id)
    VALUES ($1, $2, $3)
    """

    async with pool.acquire() as connection:
        try:
            async with connection.transaction():
                for hss in processed_data:
                    # Insert main HSS data
                    hss_record = await connection.fetchrow(
                        insert_hss_query,
                        hss['hss_id'],
                        parser.parse(hss['event_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                        hss['link'],
                        parser.parse(hss['submission_time']).astimezone(pytz.UTC).replace(tzinfo=None),
                        hss['version_id']
                    )

                    # Insert instruments
                    for instrument in hss['instruments']:
                        await connection.execute(
                            insert_instrument_query,
                            hss['hss_id'],
                            instrument
                        )

                    # Insert linked events
                    for event_id in hss['linked_events']:
                        await connection.execute(
                            insert_linked_events_query,
                            hss['hss_id'],
                            'HSS',
                            event_id
                        )

            logger.info(f"Inserted {len(processed_data)} HSS records into the database.")
        except Exception as e:
            logger.error(f"Error inserting HSS data: {e}")
            raise
        
async def process_satellite_data(pool, api):
    """Process satellite catalog data"""
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_satcat_data(session)

    insert_sat_query = """
    INSERT INTO sat_cat 
    (INTLDES, NORAD_CAT_ID, OBJECT_TYPE, SATNAME, COUNTRY,
    LAUNCH_DATE, SITE, DECAY_DATE, PERIOD, INCLINATION,
    APOGEE, PERIGEE, RCS_VALUE, RCS_SIZE, LAUNCH_YEAR,
    LAUNCH_NUM, LAUNCH_PIECE, CURRENT, OBJECT_NAME, OBJECT_ID,
    OBJECT_NUMBER, CREATED_AT, UPDATED_AT)
    VALUES 
    ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
    $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    ON CONFLICT (NORAD_CAT_ID) DO UPDATE SET
    INTLDES = EXCLUDED.INTLDES,
    OBJECT_TYPE = EXCLUDED.OBJECT_TYPE,
    SATNAME = EXCLUDED.SATNAME,
    COUNTRY = EXCLUDED.COUNTRY,
    LAUNCH_DATE = EXCLUDED.LAUNCH_DATE,
    SITE = EXCLUDED.SITE,
    DECAY_DATE = EXCLUDED.DECAY_DATE,
    PERIOD = EXCLUDED.PERIOD,
    INCLINATION = EXCLUDED.INCLINATION,
    APOGEE = EXCLUDED.APOGEE,
    PERIGEE = EXCLUDED.PERIGEE,
    RCS_VALUE = EXCLUDED.RCS_VALUE,
    RCS_SIZE = EXCLUDED.RCS_SIZE,
    LAUNCH_YEAR = EXCLUDED.LAUNCH_YEAR,
    LAUNCH_NUM = EXCLUDED.LAUNCH_NUM,
    LAUNCH_PIECE = EXCLUDED.LAUNCH_PIECE,
    CURRENT = EXCLUDED.CURRENT,
    OBJECT_NAME = EXCLUDED.OBJECT_NAME,
    OBJECT_ID = EXCLUDED.OBJECT_ID,
    OBJECT_NUMBER = EXCLUDED.OBJECT_NUMBER,
    UPDATED_AT = CURRENT_TIMESTAMP;
    """

    successful_inserts = 0
    async with pool.acquire() as connection:
        for sat in raw_data:
            try:
                launch_date = (
                    datetime.strptime(sat['LAUNCH'], '%Y-%m-%d').date()
                    if 'LAUNCH' in sat and sat['LAUNCH']
                    else None
                )
                decay_date = (
                    datetime.strptime(sat['DECAY'], '%Y-%m-%d').date()
                    if 'DECAY' in sat and sat['DECAY']
                    else None
                )

                params = [
                    sat.get('INTLDES', ''),
                    str(sat.get('NORAD_CAT_ID')) if sat.get('NORAD_CAT_ID') else None,
                    sat.get('OBJECT_TYPE'),
                    sat.get('SATNAME', ''),
                    sat.get('COUNTRY', ''),
                    launch_date,
                    sat.get('SITE'),
                    decay_date,
                    float(sat.get('PERIOD')) if sat.get('PERIOD') else None,
                    float(sat.get('INCLINATION')) if sat.get('INCLINATION') else None,
                    int(sat.get('APOGEE')) if sat.get('APOGEE') else None,
                    int(sat.get('PERIGEE')) if sat.get('PERIGEE') else None,
                    int(sat.get('RCSVALUE', 0)),
                    sat.get('RCS_SIZE'),
                    int(sat.get('LAUNCH_YEAR', 0)),
                    int(sat.get('LAUNCH_NUM', 0)),
                    sat.get('LAUNCH_PIECE', ''),
                    sat.get('CURRENT') == 'Y',  # Convert 'Y'/'N' to boolean
                    sat.get('OBJECT_NAME', ''),
                    sat.get('OBJECT_ID', ''),
                    int(sat.get('OBJECT_NUMBER')) if sat.get('OBJECT_NUMBER') else None
                ]

                async with connection.transaction():
                    await connection.execute(insert_sat_query, *params)
                    successful_inserts += 1
                    logger.debug(f"Successfully processed satellite {params[1]}")

            except (ValueError, TypeError) as e:
                logger.error(f"Data conversion error for satellite {sat.get('NORAD_CAT_ID', 'unknown')}: {e}")
                continue
            except asyncpg.exceptions.PostgresError as e:
                logger.error(f"Database error processing satellite {sat.get('NORAD_CAT_ID', 'unknown')}: {e}")
                continue

    logger.info(f"Completed satellite processing. Successfully inserted/updated {successful_inserts} records.")
    return successful_inserts

async def process_gp_data(pool, api):
    """Process GP (General Perturbations) data"""
    async with aiohttp.ClientSession() as session:
        raw_data = await api.fetch_gp_data(session)

    insert_gp_query = """
    INSERT INTO gp (
        NORAD_CAT_ID, OBJECT_NAME, OBJECT_ID, MEAN_ELEMENT_THEORY, CREATION_DATE,
        EPOCH, MEAN_MOTION, ECCENTRICITY, INCLINATION, RA_OF_ASC_NODE,
        ARG_OF_PERICENTER, MEAN_ANOMALY, BSTAR, MEAN_MOTION_DOT, MEAN_MOTION_DDOT,
        SEMIMAJOR_AXIS, PERIOD, APOAPSIS, PERIAPSIS, REV_AT_EPOCH,
        OBJECT_TYPE, COUNTRY_CODE, RCS_SIZE, LAUNCH_DATE, DECAY_DATE,
        GP_ID, TLE_LINE0, TLE_LINE1, TLE_LINE2, CREATED_AT
    ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, CURRENT_TIMESTAMP
    )
    ON CONFLICT (NORAD_CAT_ID) DO UPDATE SET
        OBJECT_NAME = EXCLUDED.OBJECT_NAME,
        OBJECT_ID = EXCLUDED.OBJECT_ID,
        MEAN_ELEMENT_THEORY = EXCLUDED.MEAN_ELEMENT_THEORY,
        CREATION_DATE = EXCLUDED.CREATION_DATE,
        EPOCH = EXCLUDED.EPOCH,
        MEAN_MOTION = EXCLUDED.MEAN_MOTION,
        ECCENTRICITY = EXCLUDED.ECCENTRICITY,
        INCLINATION = EXCLUDED.INCLINATION,
        RA_OF_ASC_NODE = EXCLUDED.RA_OF_ASC_NODE,
        ARG_OF_PERICENTER = EXCLUDED.ARG_OF_PERICENTER,
        MEAN_ANOMALY = EXCLUDED.MEAN_ANOMALY,
        BSTAR = EXCLUDED.BSTAR,
        MEAN_MOTION_DOT = EXCLUDED.MEAN_MOTION_DOT,
        MEAN_MOTION_DDOT = EXCLUDED.MEAN_MOTION_DDOT,
        SEMIMAJOR_AXIS = EXCLUDED.SEMIMAJOR_AXIS,
        PERIOD = EXCLUDED.PERIOD,
        APOAPSIS = EXCLUDED.APOAPSIS,
        PERIAPSIS = EXCLUDED.PERIAPSIS,
        REV_AT_EPOCH = EXCLUDED.REV_AT_EPOCH,
        OBJECT_TYPE = EXCLUDED.OBJECT_TYPE,
        COUNTRY_CODE = EXCLUDED.COUNTRY_CODE,
        RCS_SIZE = EXCLUDED.RCS_SIZE,
        LAUNCH_DATE = EXCLUDED.LAUNCH_DATE,
        DECAY_DATE = EXCLUDED.DECAY_DATE,
        GP_ID = EXCLUDED.GP_ID,
        TLE_LINE0 = EXCLUDED.TLE_LINE0,
        TLE_LINE1 = EXCLUDED.TLE_LINE1,
        TLE_LINE2 = EXCLUDED.TLE_LINE2,
        UPDATED_AT = CURRENT_TIMESTAMP
    """

    successful_inserts = 0
    async with pool.acquire() as connection:
        for item in raw_data:
            try:
                creation_date = parse_datetime(item['CREATION_DATE']) if 'CREATION_DATE' in item else None
                epoch = parse_datetime(item['EPOCH']) if 'EPOCH' in item else None
                launch_date = (
                    datetime.strptime(item['LAUNCH_DATE'], '%Y-%m-%d').date()
                    if 'LAUNCH_DATE' in item and item['LAUNCH_DATE']
                    else None
                )
                decay_date = (
                    datetime.strptime(item['DECAY_DATE'], '%Y-%m-%d').date()
                    if 'DECAY_DATE' in item and item['DECAY_DATE']
                    else None
                )

                params = [
                    str(item.get('NORAD_CAT_ID', 0)),  # Cast to string
                    item.get('OBJECT_NAME'),
                    item.get('OBJECT_ID'),
                    item.get('MEAN_ELEMENT_THEORY'),
                    creation_date,
                    epoch,
                    float(item.get('MEAN_MOTION', 0)),
                    float(item.get('ECCENTRICITY', 0)),
                    float(item.get('INCLINATION', 0)),
                    float(item.get('RA_OF_ASC_NODE', 0)),
                    float(item.get('ARG_OF_PERICENTER', 0)),
                    float(item.get('MEAN_ANOMALY', 0)),
                    float(item.get('BSTAR', 0)),
                    float(item.get('MEAN_MOTION_DOT', 0)),
                    float(item.get('MEAN_MOTION_DDOT', 0)),
                    float(item.get('SEMIMAJOR_AXIS', 0)),
                    float(item.get('PERIOD', 0)),
                    float(item.get('APOAPSIS', 0)),
                    float(item.get('PERIAPSIS', 0)),
                    int(item.get('REV_AT_EPOCH', 0)),
                    item.get('OBJECT_TYPE'),
                    item.get('COUNTRY_CODE'),
                    item.get('RCS_SIZE'),
                    launch_date,
                    decay_date,
                    int(item.get('GP_ID', 0)),
                    item.get('TLE_LINE0'),
                    item.get('TLE_LINE1'),
                    item.get('TLE_LINE2'),
                ]

                async with connection.transaction():
                    await connection.execute(insert_gp_query, *params)
                    successful_inserts += 1

            except (ValueError, TypeError) as e:
                logger.error(f"Data conversion error for GP item {item.get('NORAD_CAT_ID', 'unknown')}: {e}")
                continue
            except asyncpg.exceptions.PostgresError as e:
                logger.error(f"Database error processing GP item {item.get('NORAD_CAT_ID', 'unknown')}: {e}")
                continue

    logger.info(f"Completed GP processing. Successfully inserted/updated {successful_inserts} records.")
    return successful_inserts

async def main():
    try:
        db_conn = DatabaseConnection()
        db_pool = await db_conn.connect()
        nasa_api = NASANeoWsAPI()
        donki_cme_api = DONKICMEAPI()
        geostorm_api = GeostormAPI()
        solar_flare_api = SolarFlareAPI()
        hss_api = HighSpeedStreamAPI()
        space_track_api = SpaceTrackAPI()

        try:
            await db_conn.setup_database(db_pool)

            tasks = [
                asyncio.create_task(process_nasa_data(db_pool, nasa_api, None)),
                asyncio.create_task(process_donki_cme_data(db_pool, donki_cme_api, None)),
                asyncio.create_task(process_satellite_data(db_pool, space_track_api)),
                asyncio.create_task(process_gp_data(db_pool, space_track_api)),
                asyncio.create_task(process_geostorm_data(db_pool, geostorm_api, None)),
                asyncio.create_task(process_solar_flare_data(db_pool, solar_flare_api, None)),
                asyncio.create_task(process_hss_data(db_pool, hss_api, None))
            ]

            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            errors = [r for r in results if isinstance(r, Exception)]
            if errors:
                raise Exception(f"Errors occurred during processing: {errors}")
            
            logger.info("All data processing completed successfully")
            return {
                'statusCode': 200,
                'message': 'Successfully processed all data',
                'timestamp': datetime.now().isoformat()
            }
            
        finally:
            await db_pool.close()
            logger.info("Database connection closed")
            
    except Exception as e:
        logger.error(f"Error in main execution: {str(e)}")
        return {
            'statusCode': 500,
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }

if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        if result['statusCode'] != 200:
            logger.error(f"Process failed: {result.get('error', 'Unknown error')}")
            sys.exit(1)
        else:
            logger.info(f"Process completed successfully: {result.get('message')}")
    except KeyboardInterrupt:
        logger.info("Process interrupted by user")
        sys.exit(0)
    except Exception as e:
        logger.error(f"Fatal error: {str(e)}", exc_info=True)
        sys.exit(1)