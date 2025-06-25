import { Request, Response } from 'express';
import { 
  checkTextInUrl, 
  checkTextInMultipleUrls, 
  checkTextInLinkedPages 
} from '../services/firecrawlService';
import logger from '../utils/logger';

/**
 * Check if specific text is present in a single URL
 */
export const checkTextInSingleUrl = async (req: Request, res: Response) => {
  try {
    const { url, searchText } = req.body;

    if (!url || !searchText) {
      return res.status(400).json({ 
        error: 'Both URL and searchText are required.' 
      });
    }

    const result = await checkTextInUrl(url, searchText);
    
    logger.info(`Text check completed for single URL: ${url}`);
    res.json({ 
      success: true,
      result 
    });
    
  } catch (error) {
    logger.error('Error in single URL text check:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

/**
 * Check if specific text is present in multiple URLs
 */
export const checkTextInMultipleUrlsController = async (req: Request, res: Response) => {
  try {
    const { urls, searchText } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0 || !searchText) {
      return res.status(400).json({ 
        error: 'URLs array and searchText are required.' 
      });
    }

    if (urls.length > 20) {
      return res.status(400).json({ 
        error: 'Maximum 20 URLs allowed per request.' 
      });
    }

    const results = await checkTextInMultipleUrls(urls, searchText);
    
    const summary = {
      totalUrls: results.length,
      urlsWithText: results.filter(r => r.textFound).length,
      urlsWithErrors: results.filter(r => r.error).length
    };
    
    logger.info(`Text check completed for ${urls.length} URLs`);
    res.json({ 
      success: true,
      summary,
      results 
    });
    
  } catch (error) {
    logger.error('Error in multiple URLs text check:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};

/**
 * Extract links from a webpage and check for text presence in those links
 */
export const checkTextInLinkedPagesController = async (req: Request, res: Response) => {
  try {
    const { baseUrl, searchText, maxLinks = 10 } = req.body;

    if (!baseUrl || !searchText) {
      return res.status(400).json({ 
        error: 'Both baseUrl and searchText are required.' 
      });
    }

    if (maxLinks > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 links allowed per request.' 
      });
    }

    const result = await checkTextInLinkedPages(baseUrl, searchText, maxLinks);
    
    const summary = {
      baseUrl: result.baseUrl,
      totalLinksChecked: result.linksChecked.length,
      linksWithText: result.linksChecked.filter(r => r.textFound).length,
      linksWithErrors: result.linksChecked.filter(r => r.error).length
    };
    
    logger.info(`Text check completed for linked pages from: ${baseUrl}`);
    res.json({ 
      success: true,
      summary,
      result 
    });
    
  } catch (error) {
    logger.error('Error in linked pages text check:', error);
    res.status(500).json({ 
      success: false,
      error: 'Internal Server Error' 
    });
  }
};