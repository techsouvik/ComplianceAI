import { Request, Response } from 'express';
import { checkTextPresence, checkMultipleTextPresence } from '../services/firecrawlService';
import logger from '../utils/logger';

/**
 * Check if a single text is present in a webpage
 */
export const checkSingleTextPresence = async (req: Request, res: Response) => {
  try {
    const { url, searchText, caseSensitive = false } = req.body;

    // Validate required fields
    if (!url || !searchText) {
      return res.status(400).json({ 
        error: 'Both URL and searchText are required.',
        example: {
          url: 'https://example.com',
          searchText: 'privacy policy',
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

    const result = await checkTextPresence(url, searchText, caseSensitive);

    logger.info(`Single text presence check completed for "${searchText}" in ${url}`);
    res.json({
      success: true,
      result
    });

  } catch (error) {
    logger.error('Error in single text presence check:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Check if multiple texts are present in a webpage
 */
export const checkMultipleTextsPresence = async (req: Request, res: Response) => {
  try {
    const { url, searchTexts, caseSensitive = false } = req.body;

    // Validate required fields
    if (!url || !searchTexts || !Array.isArray(searchTexts)) {
      return res.status(400).json({ 
        error: 'URL and searchTexts array are required.',
        example: {
          url: 'https://example.com',
          searchTexts: ['privacy policy', 'terms of service', 'cookie policy'],
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

    // Validate searchTexts array
    if (searchTexts.length === 0) {
      return res.status(400).json({ error: 'searchTexts array cannot be empty.' });
    }

    if (searchTexts.length > 50) {
      return res.status(400).json({ error: 'Maximum 50 search texts allowed per request.' });
    }

    // Validate each search text
    for (const text of searchTexts) {
      if (typeof text !== 'string' || text.trim().length === 0) {
        return res.status(400).json({ error: 'All search texts must be non-empty strings.' });
      }
    }

    const results = await checkMultipleTextPresence(url, searchTexts, caseSensitive);

    logger.info(`Multiple text presence check completed for ${searchTexts.length} patterns in ${url}`);
    res.json({
      success: true,
      results,
      summary: {
        totalSearches: results.length,
        foundCount: results.filter(r => r.found).length,
        notFoundCount: results.filter(r => !r.found).length
      }
    });

  } catch (error) {
    logger.error('Error in multiple text presence check:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};

/**
 * Health check endpoint for Firecrawl service
 */
export const healthCheck = async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      service: 'Firecrawl Text Presence Checker',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /api/firecrawl/check-text': 'Check single text presence in URL',
        'POST /api/firecrawl/check-multiple-texts': 'Check multiple texts presence in URL',
        'GET /api/firecrawl/health': 'Service health check'
      }
    });
  } catch (error) {
    logger.error('Error in health check:', error);
    res.status(500).json({ 
      error: 'Service health check failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};