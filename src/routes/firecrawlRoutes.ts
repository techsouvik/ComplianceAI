import express, { Router } from 'express';
import { 
  checkTextPresence, 
  checkMultipleTexts, 
  getWebpageMetadata 
} from '../controllers/firecrawlController';

const router: Router = express.Router();

// Route to check if specific text is present in a webpage
router.route('/check-text').post(checkTextPresence as any);

// Route to check multiple text patterns in a webpage
router.route('/check-multiple-texts').post(checkMultipleTexts as any);

// Route to get webpage metadata
router.route('/metadata').post(getWebpageMetadata as any);

export default router;