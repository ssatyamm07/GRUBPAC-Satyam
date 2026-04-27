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