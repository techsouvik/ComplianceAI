import express, { Router } from 'express';
import { checkCompliance } from '../controllers/complianceController';

const router: Router = express.Router();

router.route('/check').post(checkCompliance as any);

export default router;
