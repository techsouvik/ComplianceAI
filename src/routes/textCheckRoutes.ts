import express, { Router } from 'express';
import { 
  checkTextInSingleUrl, 
  checkTextInMultipleUrlsController, 
  checkTextInLinkedPagesController 
} from '../controllers/textCheckController';

const router: Router = express.Router();

// Check text in a single URL
router.route('/single').post(checkTextInSingleUrl as any);

// Check text in multiple URLs
router.route('/multiple').post(checkTextInMultipleUrlsController as any);

// Check text in linked pages from a base URL
router.route('/linked-pages').post(checkTextInLinkedPagesController as any);

export default router;