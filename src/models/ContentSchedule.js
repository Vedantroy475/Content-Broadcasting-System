const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { DEFAULT_ROTATION_DURATION } = require('../utils/constants');

const ContentSchedule = sequelize.define('ContentSchedule', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  content_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'content',
      key: 'id',
    },
  },
  start_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  end_time: {
    type: DataTypes.DATE,
    allowNull: false,
  },
  rotation_duration: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: DEFAULT_ROTATION_DURATION,
  },
  rotation_order: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'content_schedules',
  timestamps: true,
  underscored: true,
  validate: {
    validTimeWindow() {
      if (this.end_time <= this.start_time) {
        throw new Error('end_time must be greater than start_time');
      }
    },
  },
});

module.exports = ContentSchedule;
