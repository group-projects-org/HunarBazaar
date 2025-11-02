# TRENDIFY : E-CLOTHING STORE

INTITAL: pip install Flask Flask-Cors pymongo python-dotenv qrcode[pil] sendgrid twilio

[![Store Link](https://img.shields.io/badge/Visit%20Store-TRENDIFY-28a745?style=for-the-badge&logo=shopping-cart&logoColor=white)](https://trendify-e-commerce-store-blush.vercel.app/)

[![License](https://img.shields.io/badge/license-MIT-blue.svg?&logo=open-source-initiative&logoColor=white)](LICENSE)
[![LinkedIn Follow](https://img.shields.io/badge/Follow%20on-LinkedIn-blue?style=social&logo=linkedin)](https://www.linkedin.com/in/khajanbhatt/)
[![LinkedIn Follow](https://img.shields.io/badge/Follow%20on-Github-blue?style=social&logo=github)](https://github.com/Khajan38/)

<img src="docs/Trendify.avif" alt="MerkelRex Application" style="width:100%;"/> <br>

<p style="font-size:16px;"> Hi, I am <B>Khajan Bhatt</B>. Welcome to the <B>MerkelRex Application</B> - a project developed as part of the <B>"Object-Oriented Programming"</B> specialization from <B>Coursera</B>, created during my 2nd Year of B.Tech. C.S.E. </p>

    Platform: Coursera (University of London)

    Specialization: Object Oriented Programming (5 Courses)

          1. Introduction to Object Oriented Programming in C++
          2. C++ Programming : Classes and Data
          3. Object Oriented Programming in C++ - Functions
          4. Working with Objects in C++
          5. Use C++ to build a Crypto Trading Platform: Final System

    Lecturer: Dr Matthew Yee-King,
              Lecturer in Computing at Goldsmiths, 
              University of London 

__Check More Projects :__ [Link to my GitHub ID](https://github.com/Khajan38)

__See me on LinkedIn :__ [Link to my LinkedIn ID](https://www.linkedin.com/in/khajanbhatt/)
    

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Directory Structure](#directory-structure)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Overview
MerkelRex is a robust application designed to manage and analyze order book data from CSV files. It features a powerful matching engine and provides statistical insights into trading data, making it a valuable tool for traders and analysts.

The MerkelRex Application is a C++-based order book management system designed to analyze trading data and provide insights using CSV file handling. This project is an object-oriented C++ application that features a matching engine for buy/sell orders, along with statistical analysis tools for trading data, making it suitable for crypto trading enthusiasts and developers.

## Features
- **CSV Data Handling**: Read and process trading data from CSV files.
- **Matching Engine**: Efficiently match buy and sell orders.
- **Statistical Analysis**: Generate statistical insights from order book entries.
- **User-Friendly Menu**: Easy navigation through a console-based interface.
- **Help System**: Access helpful information and instructions directly within the application.

## Directory Structure
For detailed information about the project's structure, please refer to the [Directory Structure](docs/Directory_Structure.md) document.

## Installation
To build and run the MerkelRex application, follow these steps:

1. Clone the repository:
   ```bash
   git https://github.com/Khajan38/Trendify-E-Commerce-Store.git
   cd Trendify-E-Commerce-Store
   ```
2. Add .env files:
   ```bash
   Trendify-E-Commerce-Store/.env: 
      MONGO_URI=<Your MongoDB Connection Link>
      BASE_URI=<Your frontend base URL like http://localhost:3000>
   
   Trendify-E-Commerce-Store/frontend/.env:
      REACT_APP_API_BASE_URL=<Your Backend Flask API Link, e.g. http://localhost:5000>
   ```
3. Build the application:
   ```bash
   docker build -t secure-delivery-backend .
   
   cd frontend
   npm install
   npm install -g serve
   ```
4. Run the application:
   ```bash
   docker run -p 5000:5000 secure-delivery-backend
   
   //Either run this for Development purposes
   cd frontend
   npm start 
   
   //Or this for Production purposes
   cd backend
   npm run build
   serve -s build 
   ```

## Usage
- Start the application.
- Load your CSV file (data.csv) to analyze order book data.
- Navigate the menu to access various features, including statistical functions and wallet management.
- For help, refer to the Help section within the application or view the Help.txt file.

## Contributing

Contributions are welcome! If you would like to contribute to the MerkelRex application, please follow these steps:

- Fork the repository.
- Create a new branch:
   ```bash
   git checkout -b feature/YourFeature
   ```
- Make your changes and commit them:
   ```bash
  git commit -m "Add your message"
  ```
- Push to your branch:
   ```bash
   git push origin feature/YourFeature
   ```
- Create a pull request.

## License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

## Acknowledgments
Thank you for checking out the MerkelRex Application! We appreciate any feedback and contributions to enhance this project.