import json
import logging
import sys
import os
from api import nasa_api


# Set up logging for CloudWatch
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def process_neo_data(neo_data):
    """Process and extract relevant information from NEO data."""
    neo_count = neo_data['element_count']
    potentially_hazardous = sum(
        1 for date in neo_data['near_earth_objects'].values()
        for asteroid in date
        if asteroid['is_potentially_hazardous_asteroid']
    )
    closest_approach = min(
        (float(asteroid['close_approach_data'][0]['miss_distance']['kilometers'])
         for date in neo_data['near_earth_objects'].values()
         for asteroid in date),
        default=0
    )
    return neo_count, potentially_hazardous, closest_approach

def process_cme_data(cme_data):
    """Process and extract relevant information from CME data."""
    cme_count = len(cme_data)
    
    if cme_count > 0:
        fastest_cme = max(cme_data, key=lambda x: x.get('speed', 0))
        fastest_speed = fastest_cme.get('speed', 'Unknown')
        latest_cme = max(cme_data, key=lambda x: x['startTime'])
        latest_time = latest_cme['startTime']
    else:
        fastest_speed = "N/A"
        latest_time = "N/A"
    
    return cme_count, fastest_speed, latest_time

def lambda_handler(event, context):
    logger.info("Starting Python Retriever for Integrated Space Metrics")
    
    try:
        logger.info("Fetching NASA Data")
        nasa_data = nasa_api.fetch_data()
        logger.info("Successfully fetched NASA data")
        
        # Process NEO data
        logger.info("Processing Near Earth Objects (NEO) Data")
        neo_count, hazardous_count, closest_approach = process_neo_data(nasa_data['neo'])
        
        logger.info(f"Total near-Earth objects in the next 7 days: {neo_count}")
        logger.warning(f"Number of potentially hazardous asteroids: {hazardous_count}")
        logger.critical(f"Closest asteroid approach: {closest_approach:.2f} km")
        
        # Process CME data
        logger.info("Processing Coronal Mass Ejection (CME) Data")
        cme_count, fastest_cme_speed, latest_cme_time = process_cme_data(nasa_data['cme'])
        
        logger.info(f"Total Coronal Mass Ejections in the last 30 days: {cme_count}")
        logger.warning(f"Speed of fastest CME: {fastest_cme_speed} km/s")
        logger.info(f"Time of latest CME: {latest_cme_time}")
        
        return {
            'statusCode': 200,
            'body': json.dumps({
                'neo': {
                    'count': neo_count,
                    'hazardous_count': hazardous_count,
                    'closest_approach': closest_approach
                },
                'cme': {
                    'count': cme_count,
                    'fastest_speed': fastest_cme_speed,
                    'latest_time': latest_cme_time
                }
            })
        }
        
    except Exception as e:
        logger.error(f"Error fetching or processing NASA data: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }