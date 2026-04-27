import express from 'express';
import { getLiveContent } from '../controllers/publicController.js';

const router = express.Router();

router.get('/live/:teacherId', getLiveContent);

export default router;