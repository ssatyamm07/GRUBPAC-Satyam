import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const ContentSlot = sequelize.define('ContentSlot', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
}, {
  tableName: 'content_slots',
  timestamps: false,
});

export default ContentSlot;