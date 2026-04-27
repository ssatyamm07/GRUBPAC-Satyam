import * as schedulingService from '../services/schedulingService.js';
import * as publicService from '../services/publicService.js';

export const listTeachers = async (req, res) => {
  try {
    const data = await publicService.listTeachersForPublic();
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const listTeacherSubjects = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const subjects = await publicService.listSubjectsForTeacherPublic(teacherId);
    res.json(subjects);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLiveByTeacherQuery = async (req, res) => {
  try {
    const teacherRaw = req.query.teacher;
    const { subject } = req.query;

    if (!teacherRaw?.trim()) {
      return res.status(400).json({
        error: 'Query "teacher" is required (name, email, or numeric id).',
      });
    }

    let teacherId;
    try {
      teacherId = await publicService.resolveTeacherId(teacherRaw);
    } catch (e) {
      if (e.code === 'AMBIGUOUS_NAME') {
        return res.status(400).json({ error: e.message });
      }
      throw e;
    }

    if (!teacherId) {
      return res.json({ message: 'Teacher not found' });
    }

    const content = await schedulingService.getLiveContent(teacherId, subject);

    if (!content) {
      return res.json({ message: 'No content available' });
    }

    res.json(content);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const getLiveContent = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { subject } = req.query;
    const parsedTeacherId = Number.parseInt(teacherId, 10);

    if (!Number.isInteger(parsedTeacherId) || parsedTeacherId <= 0) {
      return res.json({ message: 'No content available' });
    }

    const content = await schedulingService.getLiveContent(parsedTeacherId, subject);

    if (!content) {
      return res.json({ message: 'No content available' });
    }

    res.json(content);

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};