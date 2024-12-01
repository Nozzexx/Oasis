# predictor/utils.py
import pandas as pd

def fetch_space_data(conn):
    """Fetch space weather and debris data from database"""
    # Solar flares query
    solar_flares_query = """
        SELECT 
            date_trunc('hour', begin_time) as time_bucket,
            COUNT(*) as flare_count,
            COUNT(*) FILTER (WHERE class_type LIKE 'X%') as x_flare_count,
            COUNT(*) FILTER (WHERE class_type LIKE 'M%') as m_flare_count
        FROM donki_solar_flare
        WHERE begin_time >= NOW() - INTERVAL '1 year'
        GROUP BY time_bucket
        ORDER BY time_bucket;
    """
    
    # CME query
    cme_query = """
        SELECT 
            date_trunc('hour', start_time) as time_bucket,
            COUNT(*) as cme_count,
            AVG(speed) as avg_cme_speed
        FROM donki_cme
        WHERE start_time >= NOW() - INTERVAL '1 year'
        GROUP BY time_bucket
        ORDER BY time_bucket;
    """
    
    # Geostorm query
    geostorm_query = """
        SELECT 
            date_trunc('hour', observed_time) as time_bucket,
            AVG(kp_index) as avg_kp_index
        FROM geostorm_kp_index
        WHERE observed_time >= NOW() - INTERVAL '1 year'
        GROUP BY time_bucket
        ORDER BY time_bucket;
    """
    
    # Debris query
    debris_query = """
        SELECT 
            object_type,
            inclination::float as orbit_inclination,
            mean_motion::float,
            eccentricity::float,
            COUNT(*) as object_count
        FROM gp
        WHERE decay_date IS NULL OR decay_date > CURRENT_DATE
        GROUP BY object_type, inclination, mean_motion, eccentricity;
    """
    
    # Execute queries
    with conn.cursor() as cur:
        cur.execute(solar_flares_query)
        solar_flares_df = pd.DataFrame(cur.fetchall(), 
            columns=['time_bucket', 'flare_count', 'x_flare_count', 'm_flare_count'])
        
        cur.execute(cme_query)
        cme_df = pd.DataFrame(cur.fetchall(), 
            columns=['time_bucket', 'cme_count', 'avg_cme_speed'])
        
        cur.execute(geostorm_query)
        geostorm_df = pd.DataFrame(cur.fetchall(), 
            columns=['time_bucket', 'avg_kp_index'])
        
        cur.execute(debris_query)
        debris_df = pd.DataFrame(cur.fetchall(), 
            columns=['object_type', 'orbit_inclination', 'mean_motion', 'eccentricity', 'object_count'])
    
    # Merge weather data
    weather_df = solar_flares_df.merge(cme_df, on='time_bucket', how='outer')\
                               .merge(geostorm_df, on='time_bucket', how='outer')
    
    # Handle missing values
    weather_df = weather_df.fillna({
        'flare_count': 0,
        'x_flare_count': 0,
        'm_flare_count': 0,
        'cme_count': 0,
        'avg_cme_speed': weather_df['avg_cme_speed'].mean(),
        'avg_kp_index': weather_df['avg_kp_index'].mean()
    })
    
    return weather_df, debris_df

def validate_input_data(data):
    """Validate input data for predictions"""
    required_fields = {
        'flare_count': int,
        'x_flare_count': int,
        'm_flare_count': int,
        'cme_count': int,
        'avg_cme_speed': (int, float),
        'avg_kp_index': (int, float)
    }
    
    for field, field_type in required_fields.items():
        if field not in data:
            raise ValueError(f"Missing required field: {field}")
        if not isinstance(data[field], field_type):
            raise ValueError(f"Invalid type for {field}. Expected {field_type}, got {type(data[field])}")