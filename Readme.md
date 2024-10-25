
# Compliance AI API

This repository contains the Compliance API, a scalable microservice that takes a website URL and compliance policy URL, analyzes the content of each, and returns any non-compliant findings. Powered by a microservices architecture and advanced AI, this API enables robust compliance checking for diverse applications.

## Features

- **Content Compliance Evaluation**:  Analyzes website content against specified compliance policies.
- **Scalable Microservices Architecture**: Enables horizontal scaling to handle large workloads.
- **Advanced Content Processing**: Uses Google's Generative AI model to generate and interpret complex compliance findings..
- **Modular Architecture**: Follows microservice and MVC architecture for easy scalability and maintenance.
- **No Database**: The project does not require a database, with data retrieved directly from the product pages.
- **Logging**: Utilizes Winston for logging errors and info-level logs to files.

---

## Live Link 

This a REST API being deployed on Render, [click here](https://complianceai.onrender.com)

```
curl --location 'https://complianceai.onrender.com/api/compliance/check' \
--header 'Content-Type: application/json' \
--data '{
    "url":"https://mercury.com/",
    "policyUrl":"https://stripe.com/docs/treasury/marketing-treasury"
}'
```

Note : The free version of Render is being used and can give a 500 Internal Server Error or a 502 Bad Gateway Error also.

---

## Project Architecture Diagram

This a Data Flow Diagram, to access [click here](https://utfs.io/f/TJAg477eCsqbx0ooqgQTeMHhEvzBm0PW4lOx7y9nrFojAqYg)

```
https://utfs.io/f/TJAg477eCsqbx0ooqgQTeMHhEvzBm0PW4lOx7y9nrFojAqYg
```


---

## Table of Contents

1. [Installation](#installation)
2. [API Endpoints](#api-endpoints)
3. [Directory](#directory-structure)
4. [Services](#services)
5. [Environment Variables](#environment-variables)
6. [Technologies Used](#technologies-used)
7. [Logging](#logging)
8. [Error Handling](#error-handling)
9. [Future Improvements](#future-improvements)

---

## Installation

### Prerequisites

- [Node.js](https://nodejs.org/) (version 14+)


### Setup

1. Clone the repository:

   ```bash
    git clone https://github.com/tecshouvik/ComplianceAI.git
    cd ComplianceAI
   ```

2. Install dependencies:

   ```bash
   npm install
   ```


4. Create a `.env` file and add the following environment variables:

   ```
   PORT=3000
   LLM_API_KEY = <API KEY for using Google Gemini Model>
   ```

5. Start the server:

   ```bash
   npm run dev
   ```

   The server should be running on `http://localhost:3000`.

---


## API Endpoints

### POST /api/compliance/check

Evaluates a webpage's content against a compliance policy and returns any non-compliant findings.

#### Request

- **Content-Type**: application/json

##### Body Parameters

- **url**: (String) — The URL of the webpage to check.
- **policyUrl** (String) — The URL of the compliance policy to compare against. 

Example request:

```
POST /api/compliance/check
(Body)
{
  "url": "https://example.com/page",
  "policyUrl": "https://example.com/policy"
}
```

#### Response

- **200 OK**: Returns an object with non-compliant findings, if any.
- **400 Bad Request**: Missing or invalid parameters.
- **500 Internal Server Error**: An unexpected error occurred.

```
{
  "nonCompliantFindings": [
    {
      "finding": "Missing disclaimer",
      "explanation": "The webpage lacks a required disclaimer as specified in the compliance policy."
    }
  ]
}
```

#### Response Fields

- `nonCompliantFindings`: All the findings
  - `finding`: The heading of the non-compliant finding.
  - `explanation`: description on why it is non-compliant.
  

---

## Directory Structure

```
complianceAI/
├── Dockerfile               # Docker configuration for containerization
├── logs/                    # Log files (errors, exceptions)
│   ├── combined.log
│   ├── error.log
│   └── exceptions.log
├── src/
│   ├── controllers/
│   │   └── complianceController.ts   # Controller logic for compliance checking
│   ├── services/
│   │   └── webScraperService.ts      # Service to scrape webpage content
│   ├── utils/
│   │   └── logger.ts                 # Winston-based logger for logging
│   ├── app.ts                        # Express application setup
│   └── routes.ts                     # API routes
├── package.json              # Project dependencies
├── tsconfig.json             # Typescript Build Configs
└── README.md                 # Documentation
```

---

## Services

### Scrape Service

This service handles the navigation to the given url using Puppeteer, fetches the HTML content, and cleans it by removing unnecessary elements (e.g., scripts, images, pop-ups).

```javascript
etchWebpageContent(url) → html
```

- **Parameters**: 
  - `url`: The product page URL.
- **Returns**: 
  - Cleaned HTML content.

### LLM Service

This service sends the urlContent and the policyContent to a LLM API to dynamically find the nonc-compliant features as per the policyContent.

```javascript
checkContentAgainstPolicy(pageContent, policyContent) → { findings }
```

- **Parameters**:
  - `pageContent`: Cleaned HTML content of the target page.
  - `policyContent`: Cleaned HTML content of the policy page
- **Returns**: 
  - all the non-compliant findings


---

## Environment Variables

| Variable   | Description               | Default |
|------------|---------------------------|---------|
| `PORT`     | The port on which the API runs | `3000`  |
| `GEMINI_API_KEY` | llmService uses Gemini 1.5 flash Model | `LLM configuration` |

You can create a `.env` file to manage environment-specific configurations.

To get a GEMINI api Key, click [here](https://ai.google.dev/gemini-api/docs/api-key)

---

## Technologies Used

- **Node.js**: Backend JavaScript runtime.
- **Express**: Web framework for building the API.
- **Puppeteer**: For headless browser automation to fetch page content.
- **Winston**: For logging.
- **Axios**: For making HTTP requests.

---

## Logging

This API uses the **Winston** logging library for logging errors and info-level messages to both console and files.

- **Combined log**: Captures both info and error messages (`combined.log`).
- **Error log**: Captures only error messages (`error.log`).

By default, logs are written to the root directory of the project.

---

## Error Handling

The API is designed to handle common errors, including:

1. **Invalid URL**: If the product page URL is not valid or inaccessible, an error message will be returned.
2. **Error fetching page content**: If the browser fails to scrap the HTML content, an error message will be returned with log.
3. **LLM Errors**: If LLM fails or any other conflict ocurs in the LLMService, an error is returned with error log.

Example error response:

```json
{
  "error": "Error in compliance check"
}
```

---

## Future Improvements

- **LLM Service Integration**: Replace the mock LLM service with a live LLM API for Compliance check.
- **Error Handling**: Improve error messages for better debugging and clarity.
- **Support for Additional Compliance Check Platforms**: Expand compatibility to handle more finance platforms and custom websites.
- **Storing Data in a Database**: Implementing a database which further stores the cssSelectors for a given website which can later used a cache before requesting the LLM

- **Containerisation**: Implementing Docker and composing it to make an image which will be easy to use
---


### Author

**Souvik Ojha**  
[GitHub](https://github.com/techsouvik) | [LinkedIn](https://linkedin.com/in/souvikojha)
