# Firecrawl Integration Feature

## Overview

The Firecrawl integration adds powerful web scraping capabilities to ComplianceAI, enabling you to check if specific text is present in web pages. This feature uses Firecrawl's advanced scraping technology to extract content from websites and perform text presence validation.

## Features

- **Single URL Text Checking**: Check if required text exists in a single webpage
- **Batch URL Processing**: Check multiple URLs simultaneously for text presence
- **Advanced Scraping**: Uses Firecrawl's robust scraping engine that handles JavaScript, dynamic content, and modern web applications
- **Flexible Options**: Case-sensitive/insensitive search, content extraction, and configurable concurrency
- **Error Handling**: Comprehensive error handling with detailed error messages
- **Health Monitoring**: Built-in health check endpoint for service monitoring

## API Endpoints

### 1. Check Single URL

**Endpoint**: `POST /api/firecrawl/check-text`

**Description**: Checks if required text is present in a single URL.

**Request Body**:
```json
{
  "url": "https://example.com",
  "requiredText": "privacy policy",
  "includeContent": false,
  "caseSensitive": false
}
```

**Parameters**:
- `url` (required): The URL to scrape and check
- `requiredText` (required): The text to search for
- `includeContent` (optional): Whether to include the full extracted content in response
- `caseSensitive` (optional): Whether the search should be case-sensitive

**Response**:
```json
{
  "success": true,
  "result": {
    "url": "https://example.com",
    "textFound": true,
    "matchedText": "...privacy policy statement...",
    "extractedContent": "Full page content (if includeContent=true)"
  }
}
```

### 2. Check Multiple URLs (Batch)

**Endpoint**: `POST /api/firecrawl/check-text-batch`

**Description**: Checks if required text is present in multiple URLs simultaneously.

**Request Body**:
```json
{
  "urls": [
    "https://example1.com",
    "https://example2.com",
    "https://example3.com"
  ],
  "requiredText": "privacy policy",
  "includeContent": false,
  "caseSensitive": false,
  "maxConcurrent": 3
}
```

**Parameters**:
- `urls` (required): Array of URLs to check (max 20 URLs per request)
- `requiredText` (required): The text to search for
- `includeContent` (optional): Whether to include full extracted content
- `caseSensitive` (optional): Whether the search should be case-sensitive
- `maxConcurrent` (optional): Maximum concurrent requests (max 5, default 3)

**Response**:
```json
{
  "success": true,
  "summary": {
    "totalUrls": 3,
    "urlsWithText": 2,
    "urlsWithErrors": 0
  },
  "results": [
    {
      "url": "https://example1.com",
      "textFound": true,
      "matchedText": "...privacy policy..."
    },
    {
      "url": "https://example2.com",
      "textFound": false
    },
    {
      "url": "https://example3.com",
      "textFound": true,
      "matchedText": "...privacy policy statement..."
    }
  ]
}
```

### 3. Health Check

**Endpoint**: `GET /api/firecrawl/health`

**Description**: Checks if the Firecrawl service is operational.

**Response**:
```json
{
  "success": true,
  "status": "Firecrawl service is operational",
  "testResult": {
    "textFound": true,
    "hasError": false
  }
}
```

## Setup and Configuration

### 1. Install Dependencies

The firecrawl-js dependency has been added to package.json:

```bash
npm install
```

### 2. Environment Variables

Add your Firecrawl API key to your `.env` file:

```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

You can get your API key from [Firecrawl Dashboard](https://firecrawl.dev/).

### 3. Start the Server

```bash
npm run dev
```

## Usage Examples

### Example 1: Check if a website has a privacy policy

```bash
curl -X POST http://localhost:3000/api/firecrawl/check-text \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stripe.com",
    "requiredText": "privacy policy",
    "caseSensitive": false
  }'
```

### Example 2: Check multiple e-commerce sites for terms of service

```bash
curl -X POST http://localhost:3000/api/firecrawl/check-text-batch \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://amazon.com",
      "https://ebay.com",
      "https://shopify.com"
    ],
    "requiredText": "terms of service",
    "maxConcurrent": 2
  }'
```

### Example 3: Check for GDPR compliance text

```bash
curl -X POST http://localhost:3000/api/firecrawl/check-text \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example-eu-site.com",
    "requiredText": "GDPR",
    "caseSensitive": true,
    "includeContent": true
  }'
```

## Use Cases

1. **Compliance Monitoring**: Verify that websites contain required legal text (privacy policies, terms of service, GDPR notices)
2. **Content Validation**: Ensure specific content or disclaimers are present on web pages
3. **Brand Monitoring**: Check if brand names or trademarks appear on websites
4. **Regulatory Compliance**: Verify that financial or healthcare websites contain required regulatory disclosures
5. **Quality Assurance**: Automated testing to ensure important content is present on deployed websites

## Error Handling

The API provides comprehensive error handling:

- **400 Bad Request**: Invalid input parameters or malformed URLs
- **500 Internal Server Error**: Service errors or Firecrawl API issues
- **503 Service Unavailable**: Firecrawl service is down (health check)

Error responses include detailed messages:

```json
{
  "error": "Both URL and requiredText are required.",
  "example": {
    "url": "https://example.com",
    "requiredText": "privacy policy",
    "includeContent": false,
    "caseSensitive": false
  }
}
```

## Rate Limits and Best Practices

1. **Batch Processing**: Use the batch endpoint for multiple URLs to optimize API usage
2. **Concurrency**: Keep maxConcurrent ≤ 5 to respect API rate limits
3. **URL Validation**: The API validates URL formats before processing
4. **Content Size**: Large pages may take longer to process
5. **Error Handling**: Always check for errors in the response

## Technical Implementation

### Service Layer (`firecrawlService.ts`)
- Handles Firecrawl API integration
- Provides text matching logic
- Manages batch processing with concurrency control
- Includes comprehensive error handling

### Controller Layer (`firecrawlController.ts`)
- Validates input parameters
- Handles HTTP request/response logic
- Provides detailed error messages
- Implements health check functionality

### Routes (`firecrawlRoutes.ts`)
- Defines API endpoints
- Maps routes to controller functions
- Provides API documentation in comments

## Integration with Existing ComplianceAI

The Firecrawl integration seamlessly integrates with the existing ComplianceAI architecture:

- Uses the same logging system (Winston)
- Follows the same MVC pattern
- Maintains consistent error handling
- Uses the same environment configuration

This feature enhances ComplianceAI's capabilities by adding robust web scraping and text validation functionality while maintaining the existing compliance checking features.