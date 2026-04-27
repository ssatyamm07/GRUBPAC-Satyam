import sequelize from '../config/database.js';

import User from './User.js';
import Content from './Content.js';
import ContentSlot from './ContentSlot.js';
import Schedule from './Schedule.js';

// ======================
// Associations
// ======================

// User → Content (uploaded by teacher)
User.hasMany(Content, { foreignKey: 'uploaded_by' });
Content.belongsTo(User, { foreignKey: 'uploaded_by' });

// User → Content (approved by principal)
User.hasMany(Content, { foreignKey: 'approved_by' });
Content.belongsTo(User, { foreignKey: 'approved_by' });

// Content → Schedule
Content.hasMany(Schedule, { foreignKey: 'content_id' });
Schedule.belongsTo(Content, { foreignKey: 'content_id' });

// Slot → Schedule
ContentSlot.hasMany(Schedule, { foreignKey: 'slot_id' });
Schedule.belongsTo(ContentSlot, { foreignKey: 'slot_id' });

// ======================
// Export models
// ======================

export {
  sequelize,
  User,
  Content,
  ContentSlot,
  Schedule,
};