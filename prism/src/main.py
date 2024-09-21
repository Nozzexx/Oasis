import logging
import sys
import os
import time
import threading
from colorama import Fore, Back, Style, init

# Initialize colorama
init(autoreset=True)

# Add the parent directory to the Python path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from api import nasa_api
from start_sequence import run_start_sequence

# Custom logging formatter with colors
class ColoredPrismFormatter(logging.Formatter):
    COLORS = {
        'INFO': Fore.CYAN,
        'WARNING': Fore.YELLOW,
        'ERROR': Fore.RED,
        'CRITICAL': Fore.RED + Style.BRIGHT,
        'DEBUG': Fore.GREEN
    }

    def format(self, record):
        color = self.COLORS.get(record.levelname, Fore.WHITE)
        return f"{color}PRISM > {record.getMessage()}{Style.RESET_ALL}"

# Set up logging with custom formatter
logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)
handler = logging.StreamHandler()
handler.setFormatter(ColoredPrismFormatter())
logger.addHandler(handler)

def print_separator(title):
    width = 60
    print(f"\n{Fore.BLUE}{Style.BRIGHT}{'=' * width}")
    print(f"{title.center(width)}")
    print(f"{'=' * width}{Style.RESET_ALL}\n")

# Global flag to control the loading animation
loading = False

def progress_bar_animation():
    global loading
    width = 40
    while loading:
        for i in range(width + 1):
            bar = f"[{'=' * i}{' ' * (width - i)}]"
            percent = i * 100 // width
            print(f"\r{Fore.CYAN}Fetching data... {bar} {percent}%{Style.RESET_ALL}", end="")
            sys.stdout.flush()
            time.sleep(0.1)
    print("\r" + " " * (width + 30) + "\r", end="")  # Clear the loading message
    sys.stdout.flush()

def fetch_data_with_animation():
    global loading
    loading = True
    animation_thread = threading.Thread(target=progress_bar_animation)
    animation_thread.start()
    
    try:
        data = nasa_api.fetch_data()
    finally:
        loading = False
        animation_thread.join()
    
    return data

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

def main():
    run_start_sequence()
    
    logger.info("Starting Python Retriever for Integrated Space Metrics")
    
    try:
        print_separator("Fetching NASA Data")
        nasa_data = fetch_data_with_animation()
        logger.info("Successfully fetched NASA data")
        
        # Process and display NEO data
        print_separator("Near Earth Objects (NEO) Data")
        neo_count, hazardous_count, closest_approach = process_neo_data(nasa_data['neo'])
        
        logger.info(f"Total near-Earth objects in the next 7 days: {neo_count}")
        logger.warning(f"Number of potentially hazardous asteroids: {hazardous_count}")
        logger.critical(f"Closest asteroid approach: {closest_approach:.2f} km")
        
        # Process and display CME data
        print_separator("Coronal Mass Ejection (CME) Data")
        cme_count, fastest_cme_speed, latest_cme_time = process_cme_data(nasa_data['cme'])
        
        logger.info(f"Total Coronal Mass Ejections in the last 30 days: {cme_count}")
        logger.warning(f"Speed of fastest CME: {fastest_cme_speed} km/s")
        logger.info(f"Time of latest CME: {latest_cme_time}")
        
    except Exception as e:
        logger.error(f"Error fetching or processing NASA data: {str(e)}")
    
    print_separator("End of PRISM Execution")
    logger.info("PRISM execution completed")

if __name__ == "__main__":
    main()