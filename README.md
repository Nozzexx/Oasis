# OASIS 🌍 🛰️

**O**rbital **A**nalysis and **S**pace **I**nformation **S**ystem

## 🚀 Project Overview

OASIS is a comprehensive Java-based application that combines near-Earth space environment assessment with exoplanet habitability prediction. This tool aims to provide valuable insights for space operations, satellite management, and exoplanet research using data from various open-source datasets including NASA, NOAA, and space-track.org.

> **Note:** This README outlines the full scope of possibilities for OASIS. The actual implemented features may vary based on development priorities and resources.

## ✨ Key Features

### 1. Data Ingestion and Processing
- Import data from multiple sources:
  - NASA's Exoplanet Archive API
  - NASA's space environment datasets
  - NOAA's Space Weather Prediction Center
  - Space-track.org orbital debris data
- Clean, normalize, and combine data from various sources
- Handle missing values and outliers

### 2. Near-Earth Space Environment Analysis
- Space environment rating model considering:
  - Space weather conditions
  - Orbital debris density and distribution
  - Radiation levels
  - Atmospheric drag for different orbital altitudes
- Predict space environment conditions
- Historical view of data over time

### 3. User Interface
- React-based GUI for intuitive interaction with the application
- Dashboard for overview of key space environment and exoplanet data
- Detailed views for in-depth analysis of specific datasets

## 🚀 Potential Extensions

- Predict characteristics of undiscovered exoplanets
- Simulate exoplanet atmospheric conditions
- Optimize satellite constellation configurations
- Create a risk assessment module for space missions or satellite hardware

## 🛠️ Technologies

- Java 17+
- React
- Python (for Data)
- Typscript / Javascript / CSS (for Frontend)
- Spring / Docker / Kubernetes / AWS (for Backend)
- Maven
- JSON processing libraries (e.g., Jackson)

## 📥 Installation and Usage (DO NOT USE YET, THIS IS INCORRECT)

1. Ensure you have Java Development Kit (JDK) 17 or later installed.

2. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/OASIS.git
   cd OASIS
   ```

3. Build the project using Maven:
   ```bash
   mvn clean install
   ```

4. Run the application:
   ```bash
   mvn javafx:run 
   ```

## 🤝 Contributing

We welcome contributions to OASIS! Please read our [CONTRIBUTING.md](CONTRIBUTING.md) file for guidelines on how to make contributions.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 🙏 Acknowledgments

- NASA for providing open-source exoplanet and space environment data
- NOAA for space weather prediction data
- space-track.org for orbital debris data

## ⚠️ Disclaimer

OASIS is under active development and its features are subject to change. Not all described functionalities may be implemented in the current version.
