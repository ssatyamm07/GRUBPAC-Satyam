import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Schedule = sequelize.define('Schedule', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  slot_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  rotation_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
}, {
  tableName: 'schedule',
  timestamps: false,
});

export default Schedule;