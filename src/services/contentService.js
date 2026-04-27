import { Content } from '../models/index.js';

export const uploadContent = async (req) => {
  const {
    title,
    subject,
    description,
    start_time,
    end_time,
  } = req.body;

  if (!title || !subject) {
    throw new Error('Title and subject are required');
  }

  if ((start_time && !end_time) || (!start_time && end_time)) {
    throw new Error('Provide both start_time and end_time together');
  }

  if (!req.file) {
    throw new Error('File is required');
  }

  const start = start_time ? new Date(start_time) : null;
  const end = end_time ? new Date(end_time) : null;

  if (start && end && Number.isNaN(start.getTime())) {
    throw new Error('Invalid start_time');
  }

  if (start && end && Number.isNaN(end.getTime())) {
    throw new Error('Invalid end_time');
  }

  if (start && end && start >= end) {
    throw new Error('start_time must be before end_time');
  }

  const content = await Content.create({
    title,
    subject,
    description,
    file_path: req.file.path,
    file_type: req.file.mimetype,
    file_size: req.file.size,
    uploaded_by: req.user.id,
    status: 'pending',
    start_time: start,
    end_time: end,
    created_at: new Date(),
  });

  return content;
};

export const getMyUploads = async (userId) => {
  return Content.findAll({
    where: { uploaded_by: userId },
    order: [['created_at', 'DESC']],
  });
};

export const updateContentWindow = async (userId, contentId, body) => {
  const payload = body ?? {};
  if (!('start_time' in payload) || !('end_time' in payload)) {
    throw new Error(
      'Body must include start_time and end_time (ISO 8601 strings), or both null to clear the window'
    );
  }

  const { start_time, end_time } = payload;

  if ((start_time != null && end_time == null) || (start_time == null && end_time != null)) {
    throw new Error('start_time and end_time must both be set or both be null');
  }

  const content = await Content.findByPk(contentId);
  if (!content) throw new Error('Content not found');
  if (content.uploaded_by !== userId) {
    throw new Error('You can only update your own content');
  }

  if (start_time == null && end_time == null) {
    content.start_time = null;
    content.end_time = null;
    await content.save();
    return content;
  }

  const start = new Date(start_time);
  const end = new Date(end_time);

  if (Number.isNaN(start.getTime())) throw new Error('Invalid start_time');
  if (Number.isNaN(end.getTime())) throw new Error('Invalid end_time');
  if (start >= end) throw new Error('start_time must be before end_time');

  content.start_time = start;
  content.end_time = end;
  await content.save();
  return content;
};