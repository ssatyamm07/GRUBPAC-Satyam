import sequelize from '../config/database.js';
import { Content, ContentSlot, Schedule } from '../models/index.js';

const normalizeSubject = (subject) => subject?.trim().toLowerCase();

export const findOrCreateSlot = async (subject) => {
  const key = normalizeSubject(subject);
  if (!key) throw new Error('subject is required');

  const [slot] = await ContentSlot.findOrCreate({
    where: { subject: key },
    defaults: { subject: key },
  });

  return slot;
};

export const createScheduleEntry = async ({
  contentId,
  subject,
  rotationOrder,
  duration,
}) => {
  if (contentId == null || contentId === '') {
    throw new Error('content_id is required');
  }

  const content = await Content.findByPk(contentId);
  if (!content) throw new Error('Content not found');
  if (content.status !== 'approved') {
    throw new Error('Only approved content can be added to the broadcast schedule');
  }

  const slot = await findOrCreateSlot(subject);

  if (normalizeSubject(content.subject) !== normalizeSubject(slot.subject)) {
    throw new Error('Schedule subject must match content subject');
  }

  const order = Number.parseInt(rotationOrder, 10);
  const dur = Number.parseInt(duration, 10);
  if (!Number.isInteger(order) || order < 1) {
    throw new Error('rotation_order must be a positive integer');
  }
  if (!Number.isInteger(dur) || dur < 1) {
    throw new Error('duration must be a positive integer (minutes)');
  }

  const row = await Schedule.create({
    content_id: contentId,
    slot_id: slot.id,
    rotation_order: order,
    duration: dur,
  });

  return Schedule.findByPk(row.id, {
    include: [
      { model: Content },
      { model: ContentSlot },
    ],
  });
};

export const listSchedules = async ({ role, userId, subject, teacherId }) => {
  const contentInclude = { model: Content, required: true };

  if (role === 'teacher') {
    contentInclude.where = { uploaded_by: userId };
  } else if (teacherId != null && teacherId !== '') {
    const tid = Number.parseInt(teacherId, 10);
    if (Number.isInteger(tid) && tid > 0) {
      contentInclude.where = { uploaded_by: tid };
    }
  }

  const subj = normalizeSubject(subject);
  const slotInclude = { model: ContentSlot, required: true };
  if (subj) {
    slotInclude.where = { subject: subj };
  }

  return Schedule.findAll({
    include: [contentInclude, slotInclude],
    order: [
      [sequelize.col('ContentSlot.subject'), 'ASC'],
      [sequelize.col('Schedule.rotation_order'), 'ASC'],
    ],
  });
};

export const deleteScheduleEntry = async (scheduleId) => {
  const row = await Schedule.findByPk(scheduleId);
  if (!row) throw new Error('Schedule entry not found');
  await row.destroy();
  return { deleted: true, id: scheduleId };
};
