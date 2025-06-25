import { Request, Response } from 'express';
import { checkTextPresence, batchCheckTextPresence } from '../services/firecrawlService';
import logger from '../utils/logger';

/**
 * Check if required text is present in a single URL
 */
export const checkSingleUrl = async (req: Request, res: Response) => {
  try {
    const { url, requiredText, includeContent = false, caseSensitive = false } = req.body;

    // Validation
    if (!url || !requiredText) {
      return res.status(400).json({ 
        error: 'Both URL and requiredText are required.',
        example: {
          url: 'https://example.com',
          requiredText: 'privacy policy',
          includeContent: false,
          caseSensitive: false
        }
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    const result = await checkTextPresence(url, requiredText, {
      includeContent,
      caseSensitive
    });

    logger.info(`Single URL text check completed for: ${url}`);
    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error in single URL text check:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Check if required text is present in multiple URLs
 */
export const checkMultipleUrls = async (req: Request, res: Response) => {
  try {
    const { 
      urls, 
      requiredText, 
      includeContent = false, 
      caseSensitive = false,
      maxConcurrent = 3
    } = req.body;

    // Validation
    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ 
        error: 'URLs array is required and must not be empty.',
        example: {
          urls: ['https://example1.com', 'https://example2.com'],
          requiredText: 'privacy policy',
          includeContent: false,
          caseSensitive: false,
          maxConcurrent: 3
        }
      });
    }

    if (!requiredText) {
      return res.status(400).json({ error: 'requiredText is required.' });
    }

    if (urls.length > 20) {
      return res.status(400).json({ 
        error: 'Maximum 20 URLs allowed per batch request.' 
      });
    }

    // Validate URL formats
    const invalidUrls = urls.filter((url: string) => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      return res.status(400).json({ 
        error: 'Invalid URL formats found.',
        invalidUrls
      });
    }

    const results = await batchCheckTextPresence(urls, requiredText, {
      includeContent,
      caseSensitive,
      maxConcurrent: Math.min(maxConcurrent, 5) // Cap at 5 for API limits
    });

    const summary = {
      totalUrls: urls.length,
      urlsWithText: results.filter(r => r.textFound).length,
      urlsWithErrors: results.filter(r => r.error).length
    };

    logger.info(`Batch URL text check completed. Summary: ${JSON.stringify(summary)}`);
    res.json({
      success: true,
      summary,
      results
    });

  } catch (error) {
    logger.error('Error in batch URL text check:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Health check endpoint for firecrawl service
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    // Test with a simple, reliable URL
    const testResult = await checkTextPresence('https://httpbin.org/html', 'Herman Melville');
    
    res.json({
      success: true,
      status: 'Firecrawl service is operational',
      testResult: {
        textFound: testResult.textFound,
        hasError: !!testResult.error
      }
    });

  } catch (error) {
    logger.error('Firecrawl health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'Firecrawl service unavailable',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};