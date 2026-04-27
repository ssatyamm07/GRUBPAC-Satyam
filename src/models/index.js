import sequelize from '../config/database.js';

import User from './User.js';
import Content from './Content.js';
import ContentSlot from './ContentSlot.js';
import Schedule from './Schedule.js';

User.hasMany(Content, { foreignKey: 'uploaded_by', as: 'UploadedContents' });
Content.belongsTo(User, { foreignKey: 'uploaded_by', as: 'Teacher' });

User.hasMany(Content, { foreignKey: 'approved_by', as: 'ApprovedContents' });
Content.belongsTo(User, { foreignKey: 'approved_by', as: 'Approver' });

Content.hasMany(Schedule, { foreignKey: 'content_id' });
Schedule.belongsTo(Content, { foreignKey: 'content_id' });

ContentSlot.hasMany(Schedule, { foreignKey: 'slot_id' });
Schedule.belongsTo(ContentSlot, { foreignKey: 'slot_id' });

export {
  sequelize,
  User,
  Content,
  ContentSlot,
  Schedule,
};