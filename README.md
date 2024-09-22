# OASIS 🌍 🛰️

**O**rbital **A**nalysis and **S**pace **I**nformation **S**ystem

## 🚀 Project Overview

OASIS is a cloud-based application designed for near-Earth space environment assessment and exoplanet habitability prediction. Utilizing services from AWS, React, and Python, the system ingests data from NASA, NOAA, and other public datasets to generate insights that support space operations and research.

The backend component of the system is handled by **PRISM** (Python-based Real-time Ingestion and Sanitization Model), which is responsible for ingesting, processing, and sanitizing data, while the frontend, **projectoasis**, is a React-based interface for displaying results.

## ✨ Key Features

### 1. Data Ingestion and Processing (PRISM)

- **PRISM** is a **Python** service running on **AWS Lambda** for data ingestion and sanitization.
- It fetches data from multiple public APIs, including NASA, NOAA, and space-track.org.
- The ingestion pipeline is triggered by **AWS API Gateway** and scheduled using **CloudWatch Events**.
- Sanitized data is stored in an **AWS RDS PostgreSQL** database for easy querying.

### 2. Frontend User Interface (projectoasis)

- The **projectoasis** frontend is built using **React**, providing users with an intuitive way to visualize and interact with the data.
- It communicates with the backend via REST APIs, fetching data from the **AWS Elastic Beanstalk** JavaScript service.
- The frontend renders dynamic data visualizations based on the sanitized and processed datasets provided by **PRISM**.

### 3. Machine Learning Integration

- **AWS Lambda** is used for machine learning-based predictive analytics, using data stored in the **AWS RDS PostgreSQL** database.
- Predictions generated from the model are used for space environment forecasting and other advanced analytics.

### 4. Scalability

- The system is designed with scalability in mind, with **AWS Elastic Beanstalk** handling the frontend and JavaScript services, ensuring that as data increases, the system can scale up efficiently.
- The data retrieval and display layer interacts with the React frontend, allowing for real-time data updates and display.

## System Architecture

The architecture is divided into two main sections:

1. **Single Instance Services**:
   - Data ingestion, processing, and storage.
   - Managed through **AWS Lambda** and **AWS RDS PostgreSQL**.
   - Includes the PRISM backend service (Python-based).

2. **Scalable Services**:
   - **AWS Elastic Beanstalk** handles the data retrieval and JavaScript services.
   - The React-based frontend, **projectoasis**, is deployed here, allowing users to visualize data through a browser interface.

Refer to the system architecture diagram for more details (as shown in `Diagram.png`).

## 🛠️ Technologies

- **Frontend**:
  - React (JavaScript/TypeScript)
  - TailwindCSS for responsive and modern UI
- **Backend (PRISM)**:
  - **Python** (Data ingestion and sanitization via AWS Lambda)
  - PostgreSQL (AWS RDS for database storage)
  - Machine Learning (AWS Lambda-based predictive models)
- **Cloud Infrastructure**:
  - AWS Lambda
  - AWS API Gateway
  - AWS RDS PostgreSQL
  - AWS Elastic Beanstalk

## 📥 Installation and Usage

To run the project locally or on AWS:

1. Clone the repository:

```bash
git clone https://github.com/your-organization/OASIS.git
cd OASIS
```

2. Set up AWS CLI and configure your credentials.

3. Deploy the backend services (PRISM):

```bash
cd prism
npm install
npm run deploy
```

4. Run the frontend locally:

```bash
cd projectoasis
npm install
npm start
```

## 🤝 Contributing

We welcome contributions to OASIS! Please read our CONTRIBUTING.md file for guidelines on how to make contributions.

## 📄 License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## 🙏 Acknowledgments

- NASA, NOAA, and space-track.org for providing open-source space data.
- AWS for cloud infrastructure and services.