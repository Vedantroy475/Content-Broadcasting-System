const sequelize = require('../config/database');
const User = require('./User');
const Subject = require('./Subject');
const Content = require('./Content');
const ContentSchedule = require('./ContentSchedule');
const TeacherSubject = require('./TeacherSubject');

// Associations
User.hasMany(Content, { foreignKey: 'uploaded_by', as: 'uploadedContent' });
Content.belongsTo(User, { foreignKey: 'uploaded_by', as: 'uploader' });

User.hasMany(Content, { foreignKey: 'approved_by', as: 'approvedContent' });
Content.belongsTo(User, { foreignKey: 'approved_by', as: 'approver' });

Subject.hasMany(Content, { foreignKey: 'subject_id', as: 'contents' });
Content.belongsTo(Subject, { foreignKey: 'subject_id', as: 'subject' });

Content.hasOne(ContentSchedule, { foreignKey: 'content_id', as: 'schedule' });
ContentSchedule.belongsTo(Content, { foreignKey: 'content_id', as: 'content' });

User.belongsToMany(Subject, {
  through: TeacherSubject,
  foreignKey: 'teacher_id',
  as: 'teachingSubjects',
});
Subject.belongsToMany(User, {
  through: TeacherSubject,
  foreignKey: 'subject_id',
  as: 'teachers',
});

module.exports = {
  sequelize,
  User,
  Subject,
  Content,
  ContentSchedule,
  TeacherSubject,
};
