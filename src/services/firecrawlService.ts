import FirecrawlApp from 'firecrawl-js';
import logger from '../utils/logger';

const firecrawlApp = new FirecrawlApp({
  apiKey: process.env.FIRECRAWL_API_KEY || ''
});

export interface TextCheckResult {
  url: string;
  textFound: boolean;
  matchedText?: string;
  extractedContent?: string;
  error?: string;
}

/**
 * Checks if required text is present in the given URL using Firecrawl
 * @param url - The URL to scrape and check
 * @param requiredText - The text to search for
 * @param options - Additional options for scraping
 * @returns Promise<TextCheckResult>
 */
export const checkTextPresence = async (
  url: string, 
  requiredText: string,
  options: {
    includeContent?: boolean;
    caseSensitive?: boolean;
  } = {}
): Promise<TextCheckResult> => {
  try {
    logger.info(`Checking text presence in URL: ${url}`);
    
    // Scrape the webpage using Firecrawl
    const scrapeResult = await firecrawlApp.scrapeUrl(url, {
      formats: ['markdown', 'html'],
      includeTags: ['title', 'meta', 'h1', 'h2', 'h3', 'p', 'div', 'span'],
      excludeTags: ['script', 'style', 'nav', 'footer'],
      waitFor: 3000
    });

    if (!scrapeResult.success) {
      throw new Error(`Failed to scrape URL: ${scrapeResult.error || 'Unknown error'}`);
    }

    const content = scrapeResult.data?.markdown || scrapeResult.data?.html || '';
    
    if (!content) {
      return {
        url,
        textFound: false,
        error: 'No content extracted from the webpage'
      };
    }

    // Check for text presence
    const searchText = options.caseSensitive ? requiredText : requiredText.toLowerCase();
    const searchContent = options.caseSensitive ? content : content.toLowerCase();
    
    const textFound = searchContent.includes(searchText);
    
    let matchedText: string | undefined;
    if (textFound) {
      // Extract a snippet around the matched text for context
      const index = searchContent.indexOf(searchText);
      const start = Math.max(0, index - 50);
      const end = Math.min(content.length, index + searchText.length + 50);
      matchedText = content.substring(start, end);
    }

    const result: TextCheckResult = {
      url,
      textFound,
      matchedText: textFound ? matchedText : undefined,
      extractedContent: options.includeContent ? content : undefined
    };

    logger.info(`Text check completed for ${url}. Text found: ${textFound}`);
    return result;

  } catch (error) {
    logger.error(`Error checking text presence in ${url}:`, error);
    return {
      url,
      textFound: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Batch check text presence across multiple URLs
 * @param urls - Array of URLs to check
 * @param requiredText - The text to search for
 * @param options - Additional options for scraping
 * @returns Promise<TextCheckResult[]>
 */
export const batchCheckTextPresence = async (
  urls: string[],
  requiredText: string,
  options: {
    includeContent?: boolean;
    caseSensitive?: boolean;
    maxConcurrent?: number;
  } = {}
): Promise<TextCheckResult[]> => {
  const maxConcurrent = options.maxConcurrent || 3;
  const results: TextCheckResult[] = [];
  
  logger.info(`Starting batch text check for ${urls.length} URLs`);
  
  // Process URLs in batches to avoid overwhelming the API
  for (let i = 0; i < urls.length; i += maxConcurrent) {
    const batch = urls.slice(i, i + maxConcurrent);
    const batchPromises = batch.map(url => 
      checkTextPresence(url, requiredText, options)
    );
    
    const batchResults = await Promise.allSettled(batchPromises);
    
    batchResults.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        results.push(result.value);
      } else {
        results.push({
          url: batch[index],
          textFound: false,
          error: `Promise rejected: ${result.reason}`
        });
      }
    });
  }
  
  logger.info(`Batch text check completed. Processed ${results.length} URLs`);
  return results;
};