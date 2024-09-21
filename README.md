# OASIS 🌍 🛰️

**O**rbital **A**nalysis and **S**pace **I**nformation **S**ystem

## 🚀 Project Overview

OASIS is a comprehensive application that combines near-Earth space environment assessment with exoplanet habitability prediction. This tool aims to provide valuable insights for space operations, satellite management, and exoplanet research using data from various open-source datasets including NASA, NOAA, and space-track.org.

## ✨ Key Features

### 1. Data Ingestion and Processing
- Import data from multiple sources:
  - NASA's Exoplanet Archive API
  - NASA's space environment datasets
  - NOAA's Space Weather Prediction Center
  - Space-track.org orbital debris data
- Clean, normalize, and combine data from various sources using AWS Lambda functions
- Handle missing values and outliers

### 2. Near-Earth Space Environment Analysis
- Space environment rating model considering:
  - Space weather conditions
  - Orbital debris density and distribution
  - Radiation levels
  - Atmospheric drag for different orbital altitudes
- Predict space environment conditions using machine learning models
- Historical view of data over time

### 3. User Interface
- React-based GUI for intuitive interaction with the application
- Dashboard for overview of key space environment and exoplanet data
- Detailed views for in-depth analysis of specific datasets

## 🛠️ Technologies

- AWS Services:
  - Lambda (Python for data processing, JavaScript for backend logic)
  - API Gateway
  - CloudWatch Events
  - RDS PostgreSQL
  - Elastic Beanstalk
- Frontend:
  - React
  - TypeScript
  - CSS
- Backend:
  - Node.js (running in AWS Lambda and Elastic Beanstalk)
- Data Processing:
  - Python (running in AWS Lambda)
- Machine Learning:
  - Python libraries (e.g., scikit-learn, TensorFlow) running in AWS Lambda
- Infrastructure:
  - Docker
  - Kubernetes (potential future use)

## 📥 Installation and Usage

As OASIS is currently deployed on AWS, there's no local installation process. However, for development purposes:

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/OASIS.git
   cd OASIS
   ```

2. Set up AWS CLI and configure your credentials.

3. Deploy the backend services to AWS:
   (Include specific deployment instructions here)

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

- NASA for providing open-source exoplanet and space environment data
- NOAA for space weather prediction data
- space-track.org for orbital debris data
- AWS for cloud infrastructure and services

## ⚠️ Disclaimer

OASIS is under active development and its features are subject to change. The application is currently in a prototype phase, and not all described functionalities may be fully implemented.