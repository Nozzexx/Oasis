# OASIS 🌍 🛰️

**O**rbital **A**nalysis and **S**pace **I**nformation **S**ystem

## 🚀 Project Overview

OASIS is a cloud-based application for near-Earth space environment assessment and exoplanet habitability prediction. Using AWS services, React, and Python, it processes NASA, NOAA, and space-track.org data to provide insights for space operations and research.

## ✨ Key Features

### 1. Data Ingestion and Processing
- AWS Lambda Python Service for data ingestion, processing, and sanitization
- Fetches data from multiple Public APIs including NASA, NOAA, and space-track.org
- Triggered by AWS API Gateway and scheduled by CloudWatch Events
- Inserts and updates data in AWS RDS PostgreSQL Database

### 2. Data Storage and Retrieval
- AWS RDS PostgreSQL Database for storing processed data
- Efficient querying for real-time analysis and forecasting

### 3. Machine Learning Model
- AWS Lambda-based Python Machine Learning Model for predictive analytics
- Queries and updates data in the PostgreSQL database
- Provides intelligent insights and predictions

### 4. Data Retrieval and Display
- AWS Elastic Beanstalk hosting a scalable JavaScript Service
- Handles data retrieval from the database and updates the user interface
- Communicates with the Python-based Machine Learning Model for predictions

### 5. User Interface
- React-based frontend for intuitive interaction with the application
- Communicates with the backend via REST API
- Renders in the user's browser

## 🛠️ Technologies

- AWS Services:
  - Lambda (Python for data processing and machine learning)
  - API Gateway
  - CloudWatch Events
  - RDS PostgreSQL
  - Elastic Beanstalk
- Frontend:
  - React
  - JavaScript
- Backend:
  - Python (AWS Lambda for data processing and machine learning)
  - JavaScript (AWS Elastic Beanstalk for data retrieval and UI updates)
- Database:
  - PostgreSQL (AWS RDS)

## System Architecture

The OASIS system is divided into two main parts:

1. Single Instance Services:
   - Public APIs data source
   - AWS Lambda Python Service for data ingestion, processing, and sanitization
   - AWS RDS PostgreSQL Database
   - AWS Lambda Python Machine Learning Model

2. Scalable Services:
   - AWS Elastic Beanstalk JavaScript Service for data retrieval and UI updates
   - React Frontend
   - Browser interface

Data flows from Public APIs through the Python Service into the Database. The Python-based Machine Learning Model interacts with the Database for training and predictions. The JavaScript Service retrieves data from the Database and the Machine Learning Model, then provides it to the React Frontend for display in the user's browser.

## 📥 Installation and Usage

As OASIS is deployed on AWS, there's no local installation process. For development:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/OASIS.git
   cd OASIS
   ```

2. Set up AWS CLI and configure your credentials.

3. Deploy the backend services to AWS (specific instructions to be added).

4. For the frontend:
   ```bash
   cd frontend
   npm install
   npm start
   ```

## 🤝 Contributing

We welcome contributions to OASIS! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to make contributions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- NASA, NOAA, and space-track.org for providing open-source space data
- AWS for cloud infrastructure and services

## ⚠️ Disclaimer

OASIS is under active development and its features are subject to change. The application is currently in a prototype phase, and not all described functionalities may be fully implemented.