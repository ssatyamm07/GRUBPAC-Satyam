import { Op } from 'sequelize';
import { Content, ContentSlot, Schedule, User } from '../models/index.js';

export async function listTeachersForPublic() {
  const rows = await User.findAll({
    where: { role: 'teacher' },
    attributes: ['id', 'name', 'email'],
    order: [['name', 'ASC']],
  });
  return rows.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
  }));
}

export async function resolveTeacherId(teacherRaw) {
  const trimmed = teacherRaw?.trim();
  if (!trimmed) return null;

  if (/^\d+$/.test(trimmed)) {
    const id = Number.parseInt(trimmed, 10);
    if (!Number.isInteger(id) || id <= 0) return null;
    const u = await User.findByPk(id);
    if (!u || u.role !== 'teacher') return null;
    return id;
  }

  if (trimmed.includes('@')) {
    const u = await User.findOne({
      where: {
        role: 'teacher',
        email: { [Op.iLike]: trimmed },
      },
    });
    return u?.id ?? null;
  }

  const teachers = await User.findAll({ where: { role: 'teacher' } });
  const matches = teachers.filter((u) => u.name.toLowerCase() === trimmed.toLowerCase());
  if (matches.length === 0) return null;
  if (matches.length > 1) {
    const err = new Error('Multiple teachers share this name. Use email or id.');
    err.code = 'AMBIGUOUS_NAME';
    throw err;
  }
  return matches[0].id;
}

export async function listSubjectsForTeacherPublic(teacherId) {
  const id = Number.parseInt(teacherId, 10);
  if (!Number.isInteger(id) || id <= 0) return [];

  const teacher = await User.findByPk(id, { attributes: ['id', 'role'] });
  if (!teacher || teacher.role !== 'teacher') return [];

  const rows = await Schedule.findAll({
    attributes: [],
    include: [
      {
        model: Content,
        attributes: [],
        where: { uploaded_by: id, status: 'approved' },
        required: true,
      },
      {
        model: ContentSlot,
        attributes: ['subject'],
        required: true,
      },
    ],
  });

  const set = new Set();
  for (const row of rows) {
    const s = row.ContentSlot?.subject?.trim();
    if (s) set.add(s);
  }
  return [...set].sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }));
}
