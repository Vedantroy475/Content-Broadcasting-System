const ROLES = {
  PRINCIPAL: 'principal',
  TEACHER: 'teacher',
};

const CONTENT_STATUS = {
  UPLOADED: 'uploaded',
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
};

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const DEFAULT_ROTATION_DURATION = 5; // minutes

module.exports = {
  ROLES,
  CONTENT_STATUS,
  ALLOWED_FILE_TYPES,
  DEFAULT_ROTATION_DURATION,
};
