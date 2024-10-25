
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

This a REST API being deployed on Render, [click here](https://gomassign.onrender.com/)

```
https://gomassign.onrender.com/api/reviews?page=https://2717recovery.com/products/recovery-cream
```

Note : The free version of Render is being used and can give a 500 Internal Server Error

---

## Project Architecture Diagram

This a Data Flow Diagram, to access [click here](https://utfs.io/f/TJAg477eCsqbm9D4wp6NDwBc0RLi9SXYj7fnIe5hgPbk48sC)

```
https://utfs.io/f/TJAg477eCsqbm9D4wp6NDwBc0RLi9SXYj7fnIe5hgPbk48sC
```


---

## Table of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Endpoints](#api-endpoints)
4. [Directory](#directory-structure)
5. [Services](#services)
6. [Environment Variables](#environment-variables)
7. [Technologies Used](#technologies-used)
8. [Logging](#logging)
9. [Error Handling](#error-handling)
10. [Future Improvements](#future-improvements)

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

## Usage

### Example API Request

You can interact with the API via a simple GET request. Here's an example using `curl`:

```
curl http://localhost:3000/api/reviews?page=https://example-product-page.com
```

Alternatively, you can use tools like [Postman](https://www.postman.com/) or [Insomnia](https://insomnia.rest/).

---

## API Endpoints

### GET /api/reviews

This endpoint extracts reviews from a specified product page URL.

#### Request

- **Method**: GET
- **URL Parameter**: `page` (Required) — The URL of the product page to scrape reviews from.

Example request:

```
GET /api/reviews?page=https://example-product-page.com
```

#### Response

```
{
  "reviews_count": 100,
  "reviews": [
    {
      "title": "Great product!",
      "body": "I really enjoyed using this cream. Highly recommend.",
      "rating": 5,
      "reviewer": "John Doe"
    },
    {
      "title": "Not worth the price",
      "body": "Didn't work as expected. I would not buy it again.",
      "rating": 2,
      "reviewer": "Jane Smith"
    }
  ]
}
```

#### Response Fields

- `reviews_count`: Total number of reviews extracted.
- `reviews`: Array of reviews, each containing:
  - `title`: The title of the review.
  - `body`: The main content of the review.
  - `rating`: The star rating, typically from 1 to 5.
  - `reviewer`: The name of the reviewer.

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

### Browser Service

This service handles the navigation to the product page using Puppeteer, fetches the HTML content, and cleans it by removing unnecessary elements (e.g., scripts, images, pop-ups).

```javascript
fetchPageContent(url) → { html, metadata }
```

- **Parameters**: 
  - `url`: The product page URL.
- **Returns**: 
  - Cleaned HTML content and metadata (title and description).

### LLM Service

This service sends the cleaned HTML and metadata to an LLM API to dynamically identify the CSS selectors for the review section and pagination.

```javascript
identifyCssSelectors(html, metadata) → { selectors }
```

- **Parameters**:
  - `html`: Cleaned HTML content.
  - `metadata`: Page metadata (e.g., title and description).
- **Returns**: 
  - CSS selectors for review container and pagination.

### Scraping Service

This service uses the CSS selectors provided by the LLM Service to extract the reviews. It also handles pagination, ensuring all reviews across multiple pages are retrieved.

```javascript
extractReviews(html, cssSelectors) → [reviews]
handlePagination(html, cssSelectors, url) → [reviews]
```

- **Parameters**: 
  - `html`: HTML content of the product page.
  - `cssSelectors`: CSS selectors for extracting reviews and pagination.
  - `url`: Product page URL (for pagination).
- **Returns**: 
  - A list of reviews from the page(s).

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
- **Redis**: For inter-service communication and queue management.
- **Cheerio**: For parsing and querying the HTML.
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
2. **Failed CSS Selector Identification**: If the LLM fails to identify the correct CSS selectors, the API will return a failure response.
3. **Pagination Errors**: If pagination fails, the current page's reviews are returned along with an error log.

Example error response:

```json
{
  "error": "Failed to retrieve reviews"
}
```

---

## Future Improvements

- **LLM Service Integration**: Replace the mock LLM service with a live LLM API for CSS selector identification.
- **Error Handling**: Improve error messages for better debugging and clarity.
- **Support for Additional Review Platforms**: Expand compatibility to handle more e-commerce platforms and custom websites.
- **Storing Data in a Database**: Implementing a database which further stores the cssSelectors for a given website which can later used a cache before requesting the LLM

- **Containerisation**: Implementing Docker and composing it to make an image which will be easy to use
---


### Author

**Souvik Ojha**  
[GitHub](https://github.com/techsouvik) | [LinkedIn](https://linkedin.com/in/souvikojha)
