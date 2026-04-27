import express from 'express';
import {
  getAll,
  getPending,
  approve,
  reject,
} from '../controllers/approvalController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/all', authenticate, authorize('principal'), getAll);

router.get('/pending', authenticate, authorize('principal'), getPending);

router.patch('/approve/:id', authenticate, authorize('principal'), approve);

router.patch('/reject/:id', authenticate, authorize('principal'), reject);

export default router;