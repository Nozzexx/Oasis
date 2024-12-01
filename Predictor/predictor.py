import asyncio
import logging
import os
import asyncpg
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error, r2_score
from dotenv import load_dotenv

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


class DatabaseConnection:
    """Manages PostgreSQL database connections and operations using asyncpg."""

    def __init__(self):
        self.host = os.getenv("DB_HOST")
        self.port = int(os.getenv("DB_PORT", "5432"))
        self.database = os.getenv("DB_NAME")
        self.user = os.getenv("DB_USER")
        self.password = os.getenv("DB_PASSWORD")

        # Validate database configuration
        required_fields = ["DB_HOST", "DB_NAME", "DB_USER", "DB_PASSWORD"]
        missing_fields = [field for field in required_fields if not os.getenv(field)]
        if missing_fields:
            raise ValueError(f"Missing required database configuration: {', '.join(missing_fields)}")

    async def connect(self):
        """Establish connection pool to the database."""
        try:
            pool = await asyncpg.create_pool(
                user=self.user,
                password=self.password,
                database=self.database,
                host=self.host,
                port=self.port,
                min_size=1,
                max_size=10,
            )
            logger.info(f"Successfully connected to database at {self.host}")
            return pool
        except Exception as e:
            logger.error(f"Failed to connect to database: {e}")
            raise

    async def initialize_tables(self, pool):
        """Initialize database tables if they don't exist."""
        create_table_query = """
        CREATE TABLE IF NOT EXISTS environmental_scores (
            id SERIAL PRIMARY KEY,
            timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            region VARCHAR(2) NOT NULL,
            risk_score DECIMAL(10,6) NOT NULL,
            flare_risk DECIMAL(10,6),
            cme_risk DECIMAL(10,6),
            storm_risk DECIMAL(10,6),
            debris_risk DECIMAL(10,6),
            data_status VARCHAR(20) NOT NULL,
            confidence_score DECIMAL(10,6),
            model_version VARCHAR(10),
            CONSTRAINT region_check CHECK (region ~ '^[1-3][A-D]$')
        );
        """
        try:
            async with pool.acquire() as conn:
                await conn.execute(create_table_query)
                logger.info("Environmental scores table initialized successfully")
        except Exception as e:
            logger.error(f"Error initializing tables: {e}")
            raise


class SpaceEnvironmentPredictor:
    """Predicts space environmental risks using weather and debris data."""

    def __init__(self, db_pool):
        self.db_pool = db_pool
        self.model = None
        self.model_version = "1.0"

    async def store_environmental_scores(self, regional_scores, metrics, weather_df=None):
        """Store environmental scores in the database."""
        insert_query = """
            INSERT INTO environmental_scores 
            (region, risk_score, flare_risk, cme_risk, storm_risk, debris_risk,
             data_status, confidence_score, model_version)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        """
        
        try:
            async with self.db_pool.acquire() as conn:
                # Store each regional score
                for _, row in regional_scores.iterrows():
                    region = row['region']
                    # Get component risks for this region from weather_df
                    region_risks = {
                        'flare_risk': 0.0,
                        'cme_risk': 0.0,
                        'storm_risk': 0.0,
                        'debris_risk': 0.0
                    }
                    
                    if weather_df is not None:
                        region_data = weather_df[weather_df['region'] == region]
                        if not region_data.empty:
                            region_risks = {
                                'flare_risk': float(region_data['flare_risk'].mean()),
                                'cme_risk': float(region_data['cme_risk'].mean()),
                                'storm_risk': float(region_data['storm_risk'].mean()),
                                'debris_risk': float(region_data['debris_risk'].mean())
                            }

                    await conn.execute(
                        insert_query,
                        region,
                        float(row['risk_score']),
                        region_risks['flare_risk'],
                        region_risks['cme_risk'],
                        region_risks['storm_risk'],
                        region_risks['debris_risk'],
                        row['data_status'],
                        float(metrics.get('r2', 0.0)),
                        self.model_version
                    )
                
                logger.info(f"Successfully stored {len(regional_scores)} environmental scores with component risks")
        except Exception as e:
            logger.error(f"Error storing environmental scores: {e}")
            raise

    async def train_model(self):
        """Train the prediction model using historical data."""
        async with self.db_pool.acquire() as conn:
            weather_df, debris_df = await self.fetch_space_data(conn)

        logger.debug(f"Weather DataFrame shape: {weather_df.shape}")
        logger.debug(f"Debris DataFrame shape: {debris_df.shape}")

        # Assign regions dynamically
        weather_df["region"] = self.assign_region(weather_df, "weather")
        debris_df["region"] = self.assign_region(debris_df, "debris")

        # Calculate risk scores
        weather_df = self._calculate_risk_score(weather_df, debris_df)

        # Aggregate regional scores
        regional_scores = weather_df.groupby("region")["risk_score"].mean().reset_index()

        # Ensure all regions are represented
        all_regions = [f"{i}{suffix}" for i in range(1, 4) for suffix in ["A", "B", "C", "D"]]
        regional_scores = regional_scores.set_index("region").reindex(all_regions, fill_value=0).reset_index()

        # Add data status flag
        regions_with_weather = set(weather_df["region"].unique())
        regions_with_debris = set(debris_df["region"].unique())
        regional_scores["data_status"] = regional_scores["region"].apply(
            lambda region: "Data Available" if region in regions_with_weather or region in regions_with_debris else "No Data"
        )

        # Clean and prepare features for model training
        feature_cols = [
            "flare_count", "x_flare_count", "m_flare_count",
            "cme_count", "avg_cme_speed", "avg_kp_index", "debris_risk"
        ]
        self._clean_data(weather_df, feature_cols)

        X = weather_df[feature_cols]
        y = weather_df["risk_score"]

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        self.model = Pipeline([
            ("preprocessor", StandardScaler()),
            ("regressor", RandomForestRegressor(
                n_estimators=100, min_samples_leaf=3, random_state=42, n_jobs=-1
            ))
        ])
        self.model.fit(X_train, y_train)

        y_pred = self.model.predict(X_test)
        metrics = {
            "mse": mean_squared_error(y_test, y_pred),
            "r2": r2_score(y_test, y_pred),
        }

        # Store the results in the database, now including the weather_df
        await self.store_environmental_scores(regional_scores, metrics, weather_df)

        return metrics, regional_scores

    async def fetch_space_data(self, conn):
        """Fetch weather and debris data from the database."""
        logger.debug("Executing database queries...")
        weather_query = """
            SELECT 
                COALESCE(cme.start_time, flare.begin_time, geostorm.start_time) AS time_bucket,
                COUNT(DISTINCT flare.flare_id) AS flare_count,
                COUNT(CASE WHEN flare.class_type LIKE 'X%' THEN 1 END) AS x_flare_count,
                COUNT(CASE WHEN flare.class_type LIKE 'M%' THEN 1 END) AS m_flare_count,
                COUNT(DISTINCT cme.activity_id) AS cme_count,
                AVG(cme.speed) AS avg_cme_speed,
                AVG(kp.kp_index) AS avg_kp_index
            FROM donki_cme AS cme
            FULL OUTER JOIN donki_solar_flare AS flare
                ON cme.start_time::DATE = flare.begin_time::DATE
            FULL OUTER JOIN donki_geostorm AS geostorm
                ON geostorm.start_time::DATE = flare.begin_time::DATE
            LEFT JOIN geostorm_kp_index AS kp
                ON geostorm.gst_id = kp.gst_id
            GROUP BY time_bucket
            ORDER BY time_bucket;
        """
        debris_query = """
            SELECT 
                object_type,
                inclination AS orbit_inclination,
                mean_motion,
                eccentricity,
                COUNT(*) AS object_count
            FROM gp
            WHERE decay_date IS NULL OR decay_date > CURRENT_DATE
            GROUP BY object_type, inclination, mean_motion, eccentricity;
        """

        async with conn.transaction():
            weather_data = await conn.fetch(weather_query)
            debris_data = await conn.fetch(debris_query)

        weather_df = pd.DataFrame(
            weather_data, columns=[
                "time_bucket", "flare_count", "x_flare_count", "m_flare_count",
                "cme_count", "avg_cme_speed", "avg_kp_index"
            ]
        )
        debris_df = pd.DataFrame(
            debris_data, columns=[
                "object_type", "orbit_inclination", "mean_motion", "eccentricity", "object_count"
            ]
        )

        return weather_df, debris_df

    def assign_region(self, data, data_type):
        """Assigns regions based on orbital shells (1-3) and quadrants (A-D in 90° segments)."""
        def map_region(row):
            if data_type == "debris":
                # Convert mean_motion to determine orbital shell
                mean_motion = row.get("mean_motion", 0)
                # Get angular position (0-360°)
                angle = row.get("right_ascension", 0) % 360
                
                # Determine orbital shell (1, 2, or 3)
                if mean_motion > 12:  # Low orbit
                    orbital_shell = "1"
                elif mean_motion > 6:  # Medium orbit
                    orbital_shell = "2"
                else:  # High orbit
                    orbital_shell = "3"
                
                # Determine quadrant (A, B, C, or D) based on 90° segments
                if 0 <= angle < 90:
                    quadrant = "A"  # Northeast
                elif 90 <= angle < 180:
                    quadrant = "B"  # Southeast
                elif 180 <= angle < 270:
                    quadrant = "C"  # Southwest
                else:  # 270-360
                    quadrant = "D"  # Northwest
                    
                return f"{orbital_shell}{quadrant}"
                
            elif data_type == "weather":
                # For space weather events
                intensity = (
                    row.get("flare_count", 0) +
                    row.get("cme_count", 0) * 2 +
                    row.get("avg_kp_index", 0)
                )
                
                # Determine shell based on event intensity
                if intensity > 15:
                    orbital_shell = "3"
                elif intensity > 7:
                    orbital_shell = "2"
                else:
                    orbital_shell = "1"
                
                # Use time to determine quadrant (90° segments)
                time_bucket = pd.to_datetime(row.get("time_bucket"))
                hour = time_bucket.hour if time_bucket is not pd.NaT else 0
                
                # Map 24 hours to 360 degrees
                angle = (hour / 24) * 360
                
                if 0 <= angle < 90:
                    quadrant = "A"
                elif 90 <= angle < 180:
                    quadrant = "B"
                elif 180 <= angle < 270:
                    quadrant = "C"
                else:
                    quadrant = "D"
                    
                return f"{orbital_shell}{quadrant}"

            return "1A"  # Default fallback

        data["region"] = data.apply(map_region, axis=1)
        logger.debug(f"Assigned regions ({data_type}):\n{data['region'].value_counts()}")
        return data["region"]

    def _calculate_risk_score(self, weather_df, debris_df):
        """Calculate risk scores for environmental risks, including debris risk."""
        weather_df["flare_risk"] = np.minimum(10, weather_df["x_flare_count"] * 5 + weather_df["m_flare_count"] * 2 + weather_df["flare_count"] * 0.5)
        weather_df["cme_risk"] = np.minimum(10, weather_df["cme_count"] * 2 + (weather_df["avg_cme_speed"].fillna(0) / 300))
        weather_df["storm_risk"] = weather_df["avg_kp_index"].fillna(0) * (10 / 9) + 1

        debris_risk_by_region = debris_df.groupby("region")["object_count"].sum() / 1000
        debris_risk_by_region = debris_risk_by_region.clip(upper=10)

        weather_df = weather_df.merge(debris_risk_by_region, on="region", how="left")
        weather_df.rename(columns={"object_count": "debris_risk"}, inplace=True)
        weather_df["debris_risk"].fillna(0, inplace=True)

        weather_df["risk_score"] = np.clip(
            weather_df["flare_risk"] * 0.3 +
            weather_df["cme_risk"] * 0.3 +
            weather_df["storm_risk"] * 0.2 +
            weather_df["debris_risk"] * 0.2,
            1.0, 10.0
        )
        return weather_df

    def _clean_data(self, df, feature_cols):
        """Fill NaN values and drop invalid rows."""
        for col in feature_cols:
            if df[col].isna().any():
                logger.warning(f"Filling NaN values in {col} with 0.")
                df[col].fillna(0, inplace=True)

        if df["risk_score"].isna().any():
            logger.warning("Filling NaN values in risk_score with 0.")
            df["risk_score"].fillna(0, inplace=True)

    def predict_risk(self, region_data):
        """Predict environmental risk for a given space region."""
        if self.model is None:
            raise ValueError("Model needs to be trained first.")

        X_pred = pd.DataFrame([region_data])
        risk_score = np.clip(self.model.predict(X_pred)[0], 1.0, 10.0)
        feature_importance = self.model.named_steps["regressor"].feature_importances_
        confidence_score = np.mean(feature_importance)

        return {
            "risk_score": risk_score,
            "confidence": confidence_score,
        }

async def main():
    load_dotenv()
    db_conn = DatabaseConnection()
    db_pool = await db_conn.connect()

    try:
        # Initialize tables
        await db_conn.initialize_tables(db_pool)

        predictor = SpaceEnvironmentPredictor(db_pool)
        logger.info("Training model...")
        metrics, regional_scores = await predictor.train_model()
        logger.info(f"Training Complete | MSE: {metrics['mse']:.4f}, R²: {metrics['r2']:.4f}")

        logger.info("\n===== Final Overview of All 12 Regional Risk Scores =====")
        logger.info(f"\n{regional_scores}")

        # Example query to verify stored data
        async with db_pool.acquire() as conn:
            recent_scores = await conn.fetch("""
                SELECT region, risk_score, flare_risk, cme_risk, storm_risk, debris_risk, timestamp
                FROM environmental_scores
                ORDER BY timestamp DESC
                LIMIT 5;
            """)
            
            logger.info("\n===== Most Recent Environmental Scores =====")
            for score in recent_scores:
                logger.info(
                    f"Region: {score['region']}, "
                    f"Risk Score: {score['risk_score']:.2f}, "
                    f"Components: [Flare: {score['flare_risk']:.2f}, "
                    f"CME: {score['cme_risk']:.2f}, "
                    f"Storm: {score['storm_risk']:.2f}, "
                    f"Debris: {score['debris_risk']:.2f}], "
                    f"Time: {score['timestamp']}"
                )

    except Exception as e:
        logger.error(f"An error occurred: {e}")
        raise
    finally:
        await db_pool.close()


if __name__ == "__main__":
    asyncio.run(main())