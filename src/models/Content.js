const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const { CONTENT_STATUS } = require('../utils/constants');

const Content = sequelize.define('Content', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  subject_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'subjects',
      key: 'id',
    },
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  file_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
  },
  file_size: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  uploaded_by: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  status: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: CONTENT_STATUS.PENDING,
    validate: {
      isIn: [
        [
          CONTENT_STATUS.UPLOADED,
          CONTENT_STATUS.PENDING,
          CONTENT_STATUS.APPROVED,
          CONTENT_STATUS.REJECTED,
        ],
      ],
    },
  },
  rejection_reason: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  approved_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  approved_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
}, {
  tableName: 'content',
  timestamps: true,
  underscored: true,
});

module.exports = Content;
