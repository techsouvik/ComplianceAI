import { Request, Response } from 'express';
import firecrawlService from '../services/firecrawlService';
import logger from '../utils/logger';

interface CheckTextRequest {
  url: string;
  searchText: string;
  caseSensitive?: boolean;
}

interface CheckMultipleTextsRequest {
  url: string;
  searchTexts: string[];
  caseSensitive?: boolean;
}

interface GetMetadataRequest {
  url: string;
}

/**
 * Check if specific text is present in a webpage
 */
export const checkTextPresence = async (req: Request, res: Response) => {
  try {
    const { url, searchText, caseSensitive = false }: CheckTextRequest = req.body;

    // Validation
    if (!url || !searchText) {
      return res.status(400).json({
        success: false,
        error: 'URL and searchText are required fields'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    logger.info(`Processing text presence check request for URL: ${url}`);

    const result = await firecrawlService.checkTextPresence(url, searchText, caseSensitive);

    res.status(200).json({
      success: true,
      data: result,
      message: `Text check completed. Found: ${result.found}, Occurrences: ${result.occurrences}`
    });

  } catch (error: any) {
    logger.error('Error in checkTextPresence controller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while checking text presence',
      details: error.message
    });
  }
};

/**
 * Check multiple text patterns in a webpage
 */
export const checkMultipleTexts = async (req: Request, res: Response) => {
  try {
    const { url, searchTexts, caseSensitive = false }: CheckMultipleTextsRequest = req.body;

    // Validation
    if (!url || !searchTexts || !Array.isArray(searchTexts) || searchTexts.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'URL and searchTexts array are required fields'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    logger.info(`Processing multiple texts check request for URL: ${url}`);

    const results = await firecrawlService.checkMultipleTexts(url, searchTexts, caseSensitive);

    const summary = {
      totalTexts: searchTexts.length,
      foundTexts: results.filter(r => r.found).length,
      totalOccurrences: results.reduce((sum, r) => sum + r.occurrences, 0)
    };

    res.status(200).json({
      success: true,
      data: {
        results,
        summary
      },
      message: `Multiple text check completed. Found ${summary.foundTexts}/${summary.totalTexts} texts`
    });

  } catch (error: any) {
    logger.error('Error in checkMultipleTexts controller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while checking multiple texts',
      details: error.message
    });
  }
};

/**
 * Get webpage metadata
 */
export const getWebpageMetadata = async (req: Request, res: Response) => {
  try {
    const { url }: GetMetadataRequest = req.body;

    // Validation
    if (!url) {
      return res.status(400).json({
        success: false,
        error: 'URL is required'
      });
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return res.status(400).json({
        success: false,
        error: 'Invalid URL format'
      });
    }

    logger.info(`Processing metadata request for URL: ${url}`);

    const metadata = await firecrawlService.getWebpageMetadata(url);

    res.status(200).json({
      success: true,
      data: metadata,
      message: 'Webpage metadata retrieved successfully'
    });

  } catch (error: any) {
    logger.error('Error in getWebpageMetadata controller:', error.message);
    res.status(500).json({
      success: false,
      error: 'Internal server error while getting webpage metadata',
      details: error.message
    });
  }
};