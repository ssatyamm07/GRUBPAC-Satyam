import express from 'express';
import {
  getLiveByTeacherQuery,
  getLiveContent,
  listTeacherSubjects,
  listTeachers,
} from '../controllers/publicController.js';

const router = express.Router();

router.get('/teachers', listTeachers);
router.get('/teachers/:teacherId/subjects', listTeacherSubjects);
router.get('/live', getLiveByTeacherQuery);
router.get('/live/:teacherId', getLiveContent);

export default router;