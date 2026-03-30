const User = require('./User.js');
const UserSettings = require('./UserSettings.js');
const StudentTeacher = require('./StudentTeacher.js');

User.hasOne(UserSettings, { foreignKey: 'user_id', as: 'settings' });
UserSettings.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

// Self-referential many-to-many: STUDENT -> TICHER(s)
User.belongsToMany(User, {
  as: 'teachers',
  through: StudentTeacher,
  foreignKey: 'student_id',
  otherKey: 'teacher_id',
});
User.belongsToMany(User, {
  as: 'students',
  through: StudentTeacher,
  foreignKey: 'teacher_id',
  otherKey: 'student_id',
});

module.exports = { User, UserSettings, StudentTeacher };
