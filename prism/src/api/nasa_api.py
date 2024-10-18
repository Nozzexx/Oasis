import requests
from requests.adapters import HTTPAdapter
from requests.packages.urllib3.util.retry import Retry
import os
import logging

logger = logging.getLogger()

NASA_API_KEY = os.environ['NASA_API_KEY']
BASE_URL = "https://api.nasa.gov"

def requests_retry_session(
    retries=3,
    backoff_factor=0.3,
    status_forcelist=(500, 502, 504),
    session=None,
):
    session = session or requests.Session()
    retry = Retry(
        total=retries,
        read=retries,
        connect=retries,
        backoff_factor=backoff_factor,
        status_forcelist=status_forcelist,
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount('http://', adapter)
    session.mount('https://', adapter)
    return session

def fetch_data():
    try:
        session = requests_retry_session()
        
        # NEO data
        neo_response = session.get(
            f"{BASE_URL}/neo/rest/v1/feed",
            params={"api_key": NASA_API_KEY},
            timeout=30  # Increase timeout to 30 seconds
        )
        neo_response.raise_for_status()
        neo_data = neo_response.json()

        # CME data
        cme_response = session.get(
            f"{BASE_URL}/DONKI/CME",
            params={"api_key": NASA_API_KEY},
            timeout=30  # Increase timeout to 30 seconds
        )
        cme_response.raise_for_status()
        cme_data = cme_response.json()

        return {"neo": neo_data, "cme": cme_data}
    except requests.exceptions.RequestException as e:
        logger.error(f"Error fetching NASA data: {str(e)}")
        raise