# OASIS 🌍 🛰️
**O**rbital **A**nalytics and **S**pace **I**nformation **S**ystem

## 🚀 Project Overview
OASIS is a predictive analytics platform for assessing and forecasting near-Earth space environments. Utilizing data from NASA, NOAA, and space-track.org, it provides critical insights for satellite operations, space missions, and space environment forecasting.

The backend component of the system is responsible for ingesting, processing, and storing data, while the frontend is a Next.js-based interface for displaying results.

## ✨ Key Features
### 1. Data Sources
- Ingests data from multiple public APIs, including NASA DONKI (CME, Geostorm, Solar Flare, HSS), NASA Exoplanet Archive, Near Earth Object Web Service, and space-track.org (SatCat, GP).
- Data is sanitized and stored in a PostgreSQL database.

### 2. Frontend User Interface
- Built using Next.js, React, and TypeScript, providing users with an intuitive way to visualize and interact with the data.
- Utilizes Tailwind CSS for responsive and modern UI components.
- Includes various modules for different aspects of space data visualization and analysis:
  - Dashboard
  - Data Display
  - Near Earth Objects
  - Orbital Regions
  - Space Weather
  - Risk Assessment
  - Satellite Status
  - Debris Tracking
  - Exoplanets

### 3. Backend Services
- Implements RESTful APIs using Next.js API routes to fetch data from the PostgreSQL database.
- Handles data ingestion, processing, and storage using Python scripts.
- Utilizes asyncio and aiohttp for asynchronous data fetching and processing.
- Includes a Lambda function (`lambda_function.py`) for automated data ingestion and updates.

### 4. Database
- Uses PostgreSQL for data storage.
- Includes tables for various data types: NEO, CME, Geostorm, Solar Flare, HSS, Exoplanets, Satellite Catalog, and GP data.
- Utilizes asyncpg for asynchronous database operations.

### 5. Machine Learning
- Includes a Python script (`predictor.py`) for machine learning-based predictive analytics.
- Trains models using historical data to predict environmental risks in different orbital regions.
- Stores prediction results back into the database for visualization in the frontend.

## 🛠️ Technologies
- **Frontend**:
  - Next.js (React)
  - TypeScript
  - Tailwind CSS
- **Backend**:
  - Python
  - asyncio, aiohttp
  - asyncpg (PostgreSQL)
  - scikit-learn (Machine Learning)
- **Database**:
  - PostgreSQL

## 📥 Installation and Usage
To run the project locally:

1. Clone the repository:

```bash
git clone https://github.com/your-organization/OASIS.git
cd OASIS
```

2. Set up the PostgreSQL database and update the connection details in the .env file.

3. Install dependencies for the frontend and run the development server:
   
```bash
cd projectoasis
npm install
npm run dev
```

4. Set up a Python virtual environment and install dependencies for the backend scripts:

```bash
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```
5. Run the data ingestion script:
```bash
python lambda_function.py
```
6. Run the ML predictor script:
```bash
python predictor.py
```
7. Access the application at http://localhost:3000.
## 🤝 Contributing

We welcome contributions to OASIS! Please read our CONTRIBUTING.md file for guidelines on how to make contributions.

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## 🙏 Acknowledgments

- NASA, NOAA, and space-track.org for providing open-source space data.
- AWS for cloud infrastructure and services.
