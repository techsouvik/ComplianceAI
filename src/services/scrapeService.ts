const puppeteer = require('puppeteer');
import logger from '../utils/logger';

export const fetchWebpageContent = async (url: string) => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'domcontentloaded' , timeout:50000});
        
        // Remove unnecessary elements: scripts, styles, images, popups, etc.
        await page.evaluate(() => {
          document.querySelectorAll('script, style, img, iframe, .popup').forEach(el => el.remove());
        });
    
        // Get HTML Content
        const html = await page.content()
        
        await browser.close();
        logger.info(`Page content fetched successfully from ${url}`);
        return html;
      } catch (error) {
        logger.error(`Error fetching page content: ${error}`);
        throw error;
      }
}

