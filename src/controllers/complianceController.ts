import { Request, Response } from 'express';
import { fetchWebpageContent } from '../services/scrapeService';
import { checkContentAgainstPolicy } from '../services/llmService';
import logger from '../utils/logger';

export const checkCompliance = async (req: Request, res: Response) => {
  try {
    const { url, policyUrl } = req.body;

    if (!url || !policyUrl) {
      return res.status(400).json({ error: 'Both URL and policy URL are required.' });
    }

    const pageContent = await fetchWebpageContent(url);
    const policyContent = await fetchWebpageContent(policyUrl);
    const nonCompliantFindings = await checkContentAgainstPolicy(pageContent, policyContent);

    logger.info('Compliance check completed successfully');
    res.json({ nonCompliantFindings });
  } catch (error) {
    logger.error('Error in compliance check:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
