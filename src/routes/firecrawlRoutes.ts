import { Router } from 'express';
import { checkSingleUrl, checkMultipleUrls, healthCheck } from '../controllers/firecrawlController';

const router = Router();

/**
 * @route POST /api/firecrawl/check-text
 * @desc Check if required text is present in a single URL
 * @body { url: string, requiredText: string, includeContent?: boolean, caseSensitive?: boolean }
 */
router.post('/check-text', checkSingleUrl);

/**
 * @route POST /api/firecrawl/check-text-batch
 * @desc Check if required text is present in multiple URLs
 * @body { urls: string[], requiredText: string, includeContent?: boolean, caseSensitive?: boolean, maxConcurrent?: number }
 */
router.post('/check-text-batch', checkMultipleUrls);

/**
 * @route GET /api/firecrawl/health
 * @desc Health check for firecrawl service
 */
router.get('/health', healthCheck);

export default router;