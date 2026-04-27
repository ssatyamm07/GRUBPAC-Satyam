import express from 'express';
import { uploadContent, getMyUploads } from '../controllers/contentController.js';
import { authenticate } from '../middlewares/authMiddleware.js';
import { authorize } from '../middlewares/roleMiddleware.js';
import { upload } from '../middlewares/uploadMiddleware.js';

const router = express.Router();

router.post(
  '/upload',
  authenticate,
  authorize('teacher'),
  upload.single('file'),
  uploadContent
);

router.get('/my', authenticate, authorize('teacher'), getMyUploads);

export default router;