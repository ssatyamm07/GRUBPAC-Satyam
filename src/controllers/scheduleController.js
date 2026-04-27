import * as scheduleService from '../services/scheduleService.js';

export const create = async (req, res) => {
  try {
    const { content_id, subject, rotation_order, duration } = req.body ?? {};

    const data = await scheduleService.createScheduleEntry({
      contentId: content_id,
      subject,
      rotationOrder: rotation_order,
      duration,
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const list = async (req, res) => {
  try {
    const data = await scheduleService.listSchedules({
      role: req.user.role,
      userId: req.user.id,
      subject: req.query.subject,
      teacherId: req.query.teacherId,
    });

    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const data = await scheduleService.deleteScheduleEntry(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
