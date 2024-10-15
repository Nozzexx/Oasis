import requests
from datetime import datetime, timedelta
from config import NASA_API_KEY

BASE_URL_NEO = "https://api.nasa.gov/neo/rest/v1"
BASE_URL_DONKI = "https://api.nasa.gov/DONKI"

def fetch_neo_data(start_date=None, end_date=None):
    """
    Fetch Near Earth Object data from NASA's NeoWs API.
    If no dates are provided, it fetches data for today and the next 7 days.
    """
    if start_date is None:
        start_date = datetime.now().strftime("%Y-%m-%d")
    if end_date is None:
        end_date = (datetime.now() + timedelta(days=7)).strftime("%Y-%m-%d")

    endpoint = f"{BASE_URL_NEO}/feed"
    params = {
        "start_date": start_date,
        "end_date": end_date,
        "api_key": NASA_API_KEY
    }
    
    response = requests.get(endpoint, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch NEO data: {response.status_code}")

def fetch_cme_data(start_date=None, end_date=None):
    """
    Fetch Coronal Mass Ejection (CME) data from NASA's DONKI API.
    If no dates are provided, it fetches data for the last 30 days.
    """
    if start_date is None:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")
    if end_date is None:
        end_date = datetime.now().strftime("%Y-%m-%d")

    endpoint = f"{BASE_URL_DONKI}/CME"
    params = {
        "startDate": start_date,
        "endDate": end_date,
        "api_key": NASA_API_KEY
    }
    
    response = requests.get(endpoint, params=params)
    
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Failed to fetch CME data: {response.status_code}")

def fetch_data():
    """
    Fetch data from NASA APIs. Fetches both NEO and CME data.
    """
    return {
        "neo": fetch_neo_data(),
        "cme": fetch_cme_data()
    }

if __name__ == "__main__":
    # This block allows you to test the functions independently
    try:
        data = fetch_data()
        print("NEO data sample:", data["neo"]["element_count"])
        print("CME data sample:", len(data["cme"]))
    except Exception as e:
        print(f"Error: {str(e)}")