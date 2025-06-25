# Firecrawl Text Checking Feature

## Overview

The Firecrawl Text Checking feature is a new service that enables checking if specific text is present in a given webpage URL using the Firecrawl API. This feature provides advanced web scraping capabilities with better content extraction compared to traditional scraping methods.

## Features

- **Text Presence Detection**: Check if specific text exists in a webpage
- **Multiple Text Search**: Search for multiple text patterns simultaneously
- **Case Sensitivity Control**: Option to perform case-sensitive or case-insensitive searches
- **Context Extraction**: Get surrounding context for found text occurrences
- **Metadata Extraction**: Retrieve webpage metadata (title, description, language)
- **Position Tracking**: Get exact positions and occurrence counts

## API Endpoints

### 1. Check Text Presence

**Endpoint**: `POST /api/firecrawl/check-text`

**Description**: Check if specific text is present in a webpage.

**Request Body**:
```json
{
  "url": "https://example.com",
  "searchText": "privacy policy",
  "caseSensitive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "found": true,
    "occurrences": 3,
    "positions": [
      {
        "index": 1250,
        "context": "...our comprehensive privacy policy ensures your data..."
      }
    ],
    "url": "https://example.com",
    "searchText": "privacy policy"
  },
  "message": "Text check completed. Found: true, Occurrences: 3"
}
```

### 2. Check Multiple Texts

**Endpoint**: `POST /api/firecrawl/check-multiple-texts`

**Description**: Check multiple text patterns in a single webpage.

**Request Body**:
```json
{
  "url": "https://example.com",
  "searchTexts": ["privacy policy", "terms of service", "cookie policy"],
  "caseSensitive": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "found": true,
        "occurrences": 2,
        "positions": [...],
        "url": "https://example.com",
        "searchText": "privacy policy"
      }
    ],
    "summary": {
      "totalTexts": 3,
      "foundTexts": 2,
      "totalOccurrences": 5
    }
  },
  "message": "Multiple text check completed. Found 2/3 texts"
}
```

### 3. Get Webpage Metadata

**Endpoint**: `POST /api/firecrawl/metadata`

**Description**: Extract metadata from a webpage.

**Request Body**:
```json
{
  "url": "https://example.com"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "title": "Example Website",
    "description": "This is an example website",
    "language": "en",
    "sourceURL": "https://example.com"
  },
  "message": "Webpage metadata retrieved successfully"
}
```

## Environment Variables

Add the following to your `.env` file:

```env
FIRECRAWL_API_KEY=your_firecrawl_api_key_here
```

## Usage Examples

### Basic Text Check
```bash
curl -X POST http://localhost:3000/api/firecrawl/check-text \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stripe.com",
    "searchText": "payment processing",
    "caseSensitive": false
  }'
```

### Multiple Text Search
```bash
curl -X POST http://localhost:3000/api/firecrawl/check-multiple-texts \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stripe.com",
    "searchTexts": ["API", "documentation", "developer"],
    "caseSensitive": false
  }'
```

### Get Metadata
```bash
curl -X POST http://localhost:3000/api/firecrawl/metadata \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://stripe.com"
  }'
```

## Error Handling

The API returns appropriate HTTP status codes and error messages:

- **400 Bad Request**: Invalid input parameters
- **500 Internal Server Error**: Server-side errors

Example error response:
```json
{
  "success": false,
  "error": "URL and searchText are required fields"
}
```

## Implementation Details

### Service Layer (`firecrawlService.ts`)
- Handles Firecrawl API integration
- Implements text searching algorithms
- Manages error handling and logging

### Controller Layer (`firecrawlController.ts`)
- Validates request parameters
- Processes API requests and responses
- Handles HTTP status codes

### Routes (`firecrawlRoutes.ts`)
- Defines API endpoints
- Maps routes to controller functions

## Benefits over Traditional Scraping

1. **Better Content Extraction**: Firecrawl provides cleaner, more accurate content extraction
2. **JavaScript Rendering**: Handles dynamic content loaded by JavaScript
3. **Rate Limiting**: Built-in rate limiting and retry mechanisms
4. **Structured Output**: Returns both markdown and HTML formats
5. **Metadata Extraction**: Automatic extraction of page metadata

## Use Cases

- **Compliance Checking**: Verify presence of required legal text
- **Content Monitoring**: Monitor websites for specific content changes
- **SEO Analysis**: Check for presence of keywords and phrases
- **Brand Monitoring**: Track mentions of brand names or products
- **Competitive Analysis**: Monitor competitor websites for specific content

## Getting Started

1. Sign up for a Firecrawl API key at [firecrawl.dev](https://firecrawl.dev)
2. Add the API key to your environment variables
3. Start the server and test the endpoints
4. Integrate with your existing compliance checking workflows

## Future Enhancements

- Regex pattern matching support
- Scheduled text monitoring
- Webhook notifications for content changes
- Bulk URL processing
- Advanced filtering options