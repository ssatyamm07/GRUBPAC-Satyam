import { Content, Schedule, ContentSlot } from '../models/index.js';

export const getLiveContent = async (teacherId, subject) => {
  const now = new Date();
  const normalizedSubject = subject?.trim().toLowerCase();

  // Schedule is the source of truth for what can go live.
  const scheduleRows = await Schedule.findAll({
    include: [
      {
        model: Content,
        where: {
          uploaded_by: teacherId,
          status: 'approved',
        },
      },
      {
        model: ContentSlot,
      },
    ],
    order: [['rotation_order', 'ASC']],
  });

  const eligibleRows = scheduleRows.filter((row) => {
    if (!row.Content || !row.ContentSlot) return false;

    const rowSubject = row.ContentSlot.subject?.toLowerCase();
    if (normalizedSubject && rowSubject !== normalizedSubject) return false;

    if (!row.Content.start_time || !row.Content.end_time) return false;

    const start = new Date(row.Content.start_time);
    const end = new Date(row.Content.end_time);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return false;

    return now >= start && now <= end;
  });

  if (eligibleRows.length === 0) {
    return null;
  }

  const durations = eligibleRows.map((row) => {
    const duration = row.duration;
    return Number.isFinite(duration) && duration > 0 ? duration : 5;
  });

  const minutes = Math.floor(now.getTime() / 60000);
  const total = durations.reduce((sum, value) => sum + value, 0);
  let time = minutes % total;

  for (let i = 0; i < eligibleRows.length; i += 1) {
    if (time < durations[i]) {
      return eligibleRows[i].Content;
    }
    time -= durations[i];
  }

  return eligibleRows[0].Content;
};