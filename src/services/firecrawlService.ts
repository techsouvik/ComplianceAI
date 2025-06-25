import FirecrawlApp from '@firecrawl/firecrawl-js';
import logger from '../utils/logger';

const firecrawlApp = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export interface TextCheckResult {
  url: string;
  textFound: boolean;
  extractedText?: string;
  error?: string;
}

/**
 * Check if specific text is present in a webpage using Firecrawl
 * @param url - The URL to scrape and check
 * @param searchText - The text to search for
 * @returns Promise<TextCheckResult>
 */
export const checkTextInUrl = async (url: string, searchText: string): Promise<TextCheckResult> => {
  try {
    logger.info(`Checking for text "${searchText}" in URL: ${url}`);
    
    // Scrape the webpage using Firecrawl
    const scrapeResult = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      onlyMainContent: true,
      includeTags: ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'span', 'div', 'article'],
      excludeTags: ['script', 'style', 'nav', 'footer', 'header']
    });

    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape URL: ${scrapeResult.error}`);
    }

    const extractedText = scrapeResult.data?.markdown || scrapeResult.data?.html || '';
    const textFound = extractedText.toLowerCase().includes(searchText.toLowerCase());

    logger.info(`Text check completed for ${url}. Text found: ${textFound}`);
    
    return {
      url,
      textFound,
      extractedText: extractedText.substring(0, 1000), // Limit to first 1000 chars for response
      error: undefined
    };

  } catch (error) {
    logger.error(`Error checking text in URL ${url}:`, error);
    return {
      url,
      textFound: false,
      extractedText: undefined,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Check if specific text is present in multiple URLs
 * @param urls - Array of URLs to check
 * @param searchText - The text to search for
 * @returns Promise<TextCheckResult[]>
 */
export const checkTextInMultipleUrls = async (urls: string[], searchText: string): Promise<TextCheckResult[]> => {
  try {
    logger.info(`Checking for text "${searchText}" in ${urls.length} URLs`);
    
    const promises = urls.map(url => checkTextInUrl(url, searchText));
    const results = await Promise.allSettled(promises);
    
    return results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        return {
          url: urls[index],
          textFound: false,
          extractedText: undefined,
          error: result.reason?.message || 'Promise rejected'
        };
      }
    });
    
  } catch (error) {
    logger.error('Error in bulk text checking:', error);
    throw error;
  }
};

/**
 * Extract all links from a webpage and check for text presence
 * @param baseUrl - The base URL to extract links from
 * @param searchText - The text to search for in the linked pages
 * @param maxLinks - Maximum number of links to check (default: 10)
 * @returns Promise<{ baseUrl: string, linksChecked: TextCheckResult[] }>
 */
export const checkTextInLinkedPages = async (
  baseUrl: string, 
  searchText: string, 
  maxLinks: number = 10
): Promise<{ baseUrl: string, linksChecked: TextCheckResult[] }> => {
  try {
    logger.info(`Extracting links from ${baseUrl} and checking for text "${searchText}"`);
    
    // First scrape the base page to extract links
    const scrapeResult = await firecrawlApp.scrapeUrl(baseUrl, {
      formats: ['html'],
      onlyMainContent: true,
      includeTags: ['a']
    });

    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape base URL: ${scrapeResult.error}`);
    }

    // Extract links from the HTML
    const html = scrapeResult.data?.html || '';
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>/gi;
    const links: string[] = [];
    let match;

    while ((match = linkRegex.exec(html)) !== null && links.length < maxLinks) {
      let link = match[1];
      
      // Convert relative URLs to absolute URLs
      if (link.startsWith('/')) {
        const baseUrlObj = new URL(baseUrl);
        link = `${baseUrlObj.protocol}//${baseUrlObj.host}${link}`;
      } else if (!link.startsWith('http')) {
        continue; // Skip non-HTTP links
      }
      
      if (!links.includes(link)) {
        links.push(link);
      }
    }

    logger.info(`Found ${links.length} unique links to check`);
    
    // Check text in all extracted links
    const linksChecked = await checkTextInMultipleUrls(links, searchText);
    
    return {
      baseUrl,
      linksChecked
    };
    
  } catch (error) {
    logger.error(`Error checking text in linked pages from ${baseUrl}:`, error);
    throw error;
  }
};