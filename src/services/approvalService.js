import { Content, User } from '../models/index.js';

const teacherInclude = {
  model: User,
  as: 'Teacher',
  attributes: ['id', 'name', 'email'],
};

export const getAllContent = async () => {
  return Content.findAll({
    include: [teacherInclude],
    order: [['created_at', 'DESC']],
  });
};

export const getPendingContent = async () => {
  return Content.findAll({
    where: { status: 'pending' },
    include: [teacherInclude],
    order: [['created_at', 'DESC']],
  });
};

export const approveContent = async (contentId, userId) => {
  const content = await Content.findByPk(contentId);

  if (!content) throw new Error('Content not found');

  if (content.status !== 'pending') {
    throw new Error('Only pending content can be approved');
  }

  content.status = 'approved';
  content.approved_by = userId;
  content.approved_at = new Date();

  await content.save();

  return content;
};

export const rejectContent = async (contentId, reason) => {
  const content = await Content.findByPk(contentId);

  if (!content) throw new Error('Content not found');

  if (content.status !== 'pending') {
    throw new Error('Only pending content can be rejected');
  }

  if (!reason) throw new Error('Rejection reason required');

  content.status = 'rejected';
  content.rejection_reason = reason;

  await content.save();

  return content;
};