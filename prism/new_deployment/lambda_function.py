import json
import logging
from api.nasa_api import get_nasa_data
from database.postgres_connection import store_data

# Set up logging
logging.basicConfig(level=logging.INFO,
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger()

def lambda_handler(event, context):
    logger.info("Starting Python Retriever for Integrated Space Metrics")
    
    try:
        # Fetch NASA data
        logger.info("Fetching NASA NEO data")
        neo_data = get_nasa_data('neo')
        if not neo_data:
            raise Exception("Failed to retrieve NEO data")

        logger.info("Fetching NASA CME data")
        cme_data = get_nasa_data('cme')
        if not cme_data:
            raise Exception("Failed to retrieve CME data")

        # Store data in the database
        logger.info("Attempting to store processed data in the database")
        store_data(neo_data, cme_data)
        logger.info("Database storage operation completed")

        return {
            'statusCode': 200,
            'body': json.dumps({
                'message': 'Data successfully retrieved and stored',
                'neo_data': neo_data,
                'cme_data': cme_data
            })
        }
        
    except Exception as e:
        logger.error(f"Error in lambda execution: {str(e)}")
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

# For local testing (can be removed in production)
if __name__ == "__main__":
    test_event = {}
    test_context = None
    print(lambda_handler(test_event, test_context))