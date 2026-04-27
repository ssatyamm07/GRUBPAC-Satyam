import * as schedulingService from '../services/schedulingService.js';

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