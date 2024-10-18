import os
import requests
from datetime import datetime, timedelta
import logging

# Set up logging
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

# Constants
BASE_URL = "https://api.nasa.gov"
NASA_API_KEY = os.environ.get('NASA_API_KEY')

def fetch_nasa_data(endpoint, start_date=None, end_date=None):
    if not NASA_API_KEY:
        logger.error("NASA_API_KEY environment variable is not set")
        raise ValueError("NASA API key is missing")

    # Set default date range if not provided
    if not start_date:
        start_date = datetime.now().strftime('%Y-%m-%d')
    if not end_date:
        end_date = (datetime.now() + timedelta(days=7)).strftime('%Y-%m-%d')

    params = {
        'api_key': NASA_API_KEY,
        'start_date': start_date,
        'end_date': end_date
    }

    full_url = f"{BASE_URL}/{endpoint}"
    logger.info(f"Fetching NASA data from {full_url} for dates {start_date} to {end_date}")

    try:
        response = requests.get(full_url, params=params, timeout=30)
        response.raise_for_status()
        data = response.json()
        logger.info(f"Successfully fetched NASA data from {endpoint}")
        return data
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching NASA data from {endpoint}: {str(e)}")
        raise

def process_neo_data(neo_data):
    """Process and extract relevant information from NEO data."""
    try:
        element_count = neo_data['element_count']
        near_earth_objects = neo_data['near_earth_objects']

        potentially_hazardous = sum(
            1 for date in near_earth_objects.values()
            for asteroid in date
            if asteroid['is_potentially_hazardous_asteroid']
        )

        closest_approach = min(
            (float(asteroid['close_approach_data'][0]['miss_distance']['kilometers'])
             for date in near_earth_objects.values()
             for asteroid in date),
            default=0
        )

        largest_asteroid = max(
            (float(asteroid['estimated_diameter']['kilometers']['estimated_diameter_max'])
             for date in near_earth_objects.values()
             for asteroid in date),
            default=0
        )

        processed_data = {
            'total_asteroids': element_count,
            'potentially_hazardous': potentially_hazardous,
            'closest_approach_km': closest_approach,
            'largest_asteroid_km': largest_asteroid
        }

        logger.info(f"Processed NEO data: {processed_data}")
        return processed_data
    except KeyError as e:
        logger.error(f"Error processing NEO data: Missing key {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing NEO data: {str(e)}")
        raise

def process_cme_data(cme_data):
    """Process and extract relevant information from CME data."""
    try:
        cme_count = len(cme_data)
        
        if cme_count > 0:
            fastest_cme = max(cme_data, key=lambda x: x.get('speed', 0))
            fastest_speed = fastest_cme.get('speed', 'Unknown')
            latest_cme = max(cme_data, key=lambda x: x['startTime'])
            latest_time = latest_cme['startTime']
            
            # Calculate average speed
            average_speed = sum(cme.get('speed', 0) for cme in cme_data if cme.get('speed') is not None) / cme_count
        else:
            fastest_speed = "N/A"
            latest_time = "N/A"
            average_speed = 0
        
        processed_data = {
            'cme_count': cme_count,
            'fastest_speed': fastest_speed,
            'latest_time': latest_time,
            'average_speed': average_speed
        }

        logger.info(f"Processed CME data: {processed_data}")
        return processed_data
    except KeyError as e:
        logger.error(f"Error processing CME data: Missing key {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error processing CME data: {str(e)}")
        raise

def get_nasa_data(data_type='neo', start_date=None, end_date=None):
    try:
        if data_type == 'neo':
            endpoint = "neo/rest/v1/feed"
            raw_data = fetch_nasa_data(endpoint, start_date, end_date)
            return process_neo_data(raw_data)
        elif data_type == 'cme':
            endpoint = "DONKI/CME"
            raw_data = fetch_nasa_data(endpoint, start_date, end_date)
            return process_cme_data(raw_data)
        else:
            raise ValueError(f"Unsupported data type: {data_type}")
    except Exception as e:
        logger.error(f"Failed to get NASA {data_type} data: {str(e)}")
        return None

# For testing purposes (can be removed in production)
if __name__ == "__main__":
    neo_data = get_nasa_data('neo')
    cme_data = get_nasa_data('cme')
    print("NEO Data:", neo_data)
    print("CME Data:", cme_data)