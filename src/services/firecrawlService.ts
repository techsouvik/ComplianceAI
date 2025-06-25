import axios from 'axios';
import logger from '../utils/logger';

interface FirecrawlResponse {
  success: boolean;
  data?: {
    content: string;
    markdown: string;
    html: string;
    metadata: {
      title: string;
      description: string;
      language: string;
      sourceURL: string;
    };
  };
  error?: string;
}

interface TextCheckResult {
  found: boolean;
  occurrences: number;
  positions: Array<{
    index: number;
    context: string;
  }>;
  url: string;
  searchText: string;
}

export class FirecrawlService {
  private apiKey: string;
  private baseUrl: string = 'https://api.firecrawl.dev/v0';

  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY || '';
    if (!this.apiKey) {
      logger.warn('FIRECRAWL_API_KEY not found in environment variables');
    }
  }

  /**
   * Scrape a webpage using Firecrawl API
   */
  private async scrapeWebpage(url: string): Promise<FirecrawlResponse> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/scrape`,
        {
          url: url,
          formats: ['markdown', 'html'],
          includeTags: ['title', 'meta'],
          excludeTags: ['script', 'style', 'nav', 'footer'],
          waitFor: 3000
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 30000
        }
      );

      logger.info(`Successfully scraped webpage: ${url}`);
      return response.data;
    } catch (error: any) {
      logger.error(`Error scraping webpage ${url}:`, error.message);
      throw new Error(`Failed to scrape webpage: ${error.message}`);
    }
  }

  /**
   * Check if specific text is present in a webpage
   */
  async checkTextPresence(url: string, searchText: string, caseSensitive: boolean = false): Promise<TextCheckResult> {
    try {
      logger.info(`Checking text presence for "${searchText}" in ${url}`);
      
      const scrapedData = await this.scrapeWebpage(url);
      
      if (!scrapedData.success || !scrapedData.data) {
        throw new Error('Failed to scrape webpage content');
      }

      const content = scrapedData.data.markdown || scrapedData.data.content || '';
      const searchPattern = caseSensitive ? searchText : searchText.toLowerCase();
      const contentToSearch = caseSensitive ? content : content.toLowerCase();

      const positions: Array<{ index: number; context: string }> = [];
      let index = 0;
      let occurrences = 0;

      // Find all occurrences
      while ((index = contentToSearch.indexOf(searchPattern, index)) !== -1) {
        occurrences++;
        
        // Extract context around the found text (50 characters before and after)
        const contextStart = Math.max(0, index - 50);
        const contextEnd = Math.min(content.length, index + searchPattern.length + 50);
        const context = content.substring(contextStart, contextEnd);
        
        positions.push({
          index,
          context: `...${context}...`
        });
        
        index += searchPattern.length;
      }

      const result: TextCheckResult = {
        found: occurrences > 0,
        occurrences,
        positions,
        url,
        searchText
      };

      logger.info(`Text check completed. Found: ${result.found}, Occurrences: ${result.occurrences}`);
      return result;

    } catch (error: any) {
      logger.error(`Error checking text presence:`, error.message);
      throw error;
    }
  }

  /**
   * Check multiple text patterns in a webpage
   */
  async checkMultipleTexts(url: string, searchTexts: string[], caseSensitive: boolean = false): Promise<TextCheckResult[]> {
    try {
      logger.info(`Checking multiple texts in ${url}`);
      
      const results: TextCheckResult[] = [];
      
      for (const searchText of searchTexts) {
        const result = await this.checkTextPresence(url, searchText, caseSensitive);
        results.push(result);
      }

      return results;
    } catch (error: any) {
      logger.error(`Error checking multiple texts:`, error.message);
      throw error;
    }
  }

  /**
   * Get webpage metadata using Firecrawl
   */
  async getWebpageMetadata(url: string) {
    try {
      const scrapedData = await this.scrapeWebpage(url);
      
      if (!scrapedData.success || !scrapedData.data) {
        throw new Error('Failed to scrape webpage metadata');
      }

      return {
        title: scrapedData.data.metadata.title,
        description: scrapedData.data.metadata.description,
        language: scrapedData.data.metadata.language,
        sourceURL: scrapedData.data.metadata.sourceURL
      };
    } catch (error: any) {
      logger.error(`Error getting webpage metadata:`, error.message);
      throw error;
    }
  }
}

export default new FirecrawlService();