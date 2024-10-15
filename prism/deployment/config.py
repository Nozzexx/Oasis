import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv(dotenv_path=os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# NASA API Key
NASA_API_KEY = os.environ.get('NASA_API_KEY')

# If the API key is not set, raise an error
if NASA_API_KEY is None:
    raise ValueError("NASA_API_KEY is not set in the environment variables")