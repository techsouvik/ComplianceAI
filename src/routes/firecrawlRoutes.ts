import express, { Router } from 'express';
import { 
  checkSingleTextPresence, 
  checkMultipleTextsPresence, 
  healthCheck 
} from '../controllers/firecrawlController';

const router: Router = express.Router();

// Health check endpoint
router.get('/health', healthCheck);

// Single text presence check
router.post('/check-text', checkSingleTextPresence);

// Multiple texts presence check
router.post('/check-multiple-texts', checkMultipleTextsPresence);

export default router;