import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_path: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  file_type: {
    type: DataTypes.STRING,
  },
  file_size: {
    type: DataTypes.INTEGER,
  },
  status: {
    type: DataTypes.ENUM('pending', 'approved', 'rejected'),
    defaultValue: 'pending',
  },
  rejection_reason: {
    type: DataTypes.TEXT,
  },
  uploaded_by: {
    type: DataTypes.INTEGER,
  },
  approved_by: {
    type: DataTypes.INTEGER,
  },
  approved_at: {
    type: DataTypes.DATE,
  },
  start_time: {
    type: DataTypes.DATE,
  },
  end_time: {
    type: DataTypes.DATE,
  },
}, {
  tableName: 'content',
  timestamps: false,
});

export default Content;