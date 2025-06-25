import FirecrawlApp from 'firecrawl-js';
import logger from '../utils/logger';

// Initialize Firecrawl with API key from environment
const firecrawl = new FirecrawlApp({ apiKey: process.env.FIRECRAWL_API_KEY });

export interface TextCheckResult {
  found: boolean;
  url: string;
  searchText: string;
  extractedContent?: string;
  matchCount?: number;
  matchPositions?: number[];
}

/**
 * Check if given text is present in a webpage using Firecrawl
 * @param url - The URL to scrape and search
 * @param searchText - The text to search for
 * @param caseSensitive - Whether the search should be case sensitive (default: false)
 * @returns Promise<TextCheckResult>
 */
export const checkTextPresence = async (
  url: string, 
  searchText: string, 
  caseSensitive: boolean = false
): Promise<TextCheckResult> => {
  try {
    logger.info(`Starting text presence check for "${searchText}" in ${url}`);

    // Scrape the webpage using Firecrawl
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'article', 'section'],
      excludeTags: ['script', 'style', 'nav', 'footer', 'header', 'aside'],
      waitFor: 3000
    });

    if (!scrapeResult.success || !scrapeResult.data) {
      throw new Error(`Failed to scrape URL: ${scrapeResult.error || 'Unknown error'}`);
    }

    // Extract text content from the scraped data
    const content = scrapeResult.data.markdown || scrapeResult.data.html || '';
    
    if (!content) {
      logger.warn(`No content extracted from ${url}`);
      return {
        found: false,
        url,
        searchText,
        extractedContent: '',
        matchCount: 0,
        matchPositions: []
      };
    }

    // Perform text search
    const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();
    const contentToSearch = caseSensitive ? content : content.toLowerCase();
    
    // Find all matches and their positions
    const matches: number[] = [];
    let position = 0;
    
    while ((position = contentToSearch.indexOf(searchPattern, position)) !== -1) {
      matches.push(position);
      position += searchPattern.length;
    }

    const found = matches.length > 0;
    
    logger.info(`Text presence check completed. Found: ${found}, Matches: ${matches.length}`);
    
    return {
      found,
      url,
      searchText,
      extractedContent: content.substring(0, 1000) + (content.length > 1000 ? '...' : ''), // Truncate for response
      matchCount: matches.length,
      matchPositions: matches
    };

  } catch (error) {
    logger.error(`Error in text presence check: ${error}`);
    throw new Error(`Failed to check text presence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

/**
 * Check multiple text patterns in a webpage
 * @param url - The URL to scrape and search
 * @param searchTexts - Array of texts to search for
 * @param caseSensitive - Whether the search should be case sensitive (default: false)
 * @returns Promise<TextCheckResult[]>
 */
export const checkMultipleTextPresence = async (
  url: string,
  searchTexts: string[],
  caseSensitive: boolean = false
): Promise<TextCheckResult[]> => {
  try {
    logger.info(`Starting multiple text presence check for ${searchTexts.length} patterns in ${url}`);

    // Scrape once and check all patterns
    const scrapeResult = await firecrawl.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'article', 'section'],
      excludeTags: ['script', 'style', 'nav', 'footer', 'header', 'aside'],
      waitFor: 3000
    });

    if (!scrapeResult.success || !scrapeResult.data) {
      throw new Error(`Failed to scrape URL: ${scrapeResult.error || 'Unknown error'}`);
    }

    const content = scrapeResult.data.markdown || scrapeResult.data.html || '';
    const contentToSearch = caseSensitive ? content : content.toLowerCase();
    
    const results: TextCheckResult[] = searchTexts.map(searchText => {
      const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();
      const matches: number[] = [];
      let position = 0;
      
      while ((position = contentToSearch.indexOf(searchPattern, position)) !== -1) {
        matches.push(position);
        position += searchPattern.length;
      }

      return {
        found: matches.length > 0,
        url,
        searchText,
        extractedContent: content.substring(0, 500) + (content.length > 500 ? '...' : ''),
        matchCount: matches.length,
        matchPositions: matches
      };
    });

    logger.info(`Multiple text presence check completed for ${searchTexts.length} patterns`);
    return results;

  } catch (error) {
    logger.error(`Error in multiple text presence check: ${error}`);
    throw new Error(`Failed to check multiple text presence: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};