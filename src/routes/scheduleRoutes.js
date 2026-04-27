import express from 'express';
import { create, list, remove } from '../controllers/scheduleController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';

const router = express.Router();

router.get('/', authenticate, list);

router.post('/', authenticate, authorize('principal'), create);

router.delete('/:id', authenticate, authorize('principal'), remove);

export default router;
