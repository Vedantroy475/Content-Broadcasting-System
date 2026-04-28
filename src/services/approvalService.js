const { Content, User, Subject, ContentSchedule } = require('../models');
const ApiError = require('../utils/ApiError');
const { CONTENT_STATUS } = require('../utils/constants');

const getPendingContent = async () => {
  const contents = await Content.findAll({
    where: { status: CONTENT_STATUS.PENDING },
    include: [
      { model: Subject, as: 'subject', attributes: ['id', 'name'] },
      { model: ContentSchedule, as: 'schedule' },
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return contents;
};

const getAllContent = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.subject_id) {
    where.subject_id = filters.subject_id;
  }
  if (filters.uploaded_by) {
    where.uploaded_by = filters.uploaded_by;
  }

  const contents = await Content.findAll({
    where,
    include: [
      { model: Subject, as: 'subject', attributes: ['id', 'name'] },
      { model: ContentSchedule, as: 'schedule' },
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
    ],
    order: [['created_at', 'DESC']],
  });

  return contents;
};

const approveContent = async (contentId, principalId) => {
  const content = await Content.findByPk(contentId);

  if (!content) {
    throw new ApiError(404, 'Content not found');
  }

  if (content.status !== CONTENT_STATUS.PENDING) {
    throw new ApiError(400, `Content is already ${content.status}`);
  }

  content.status = CONTENT_STATUS.APPROVED;
  content.approved_by = principalId;
  content.approved_at = new Date();

  await content.save();

  return content;
};

const rejectContent = async (contentId, principalId, rejectionReason) => {
  if (!rejectionReason || rejectionReason.trim().length === 0) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const content = await Content.findByPk(contentId);

  if (!content) {
    throw new ApiError(404, 'Content not found');
  }

  if (content.status !== CONTENT_STATUS.PENDING) {
    throw new ApiError(400, `Content is already ${content.status}`);
  }

  content.status = CONTENT_STATUS.REJECTED;
  content.rejection_reason = rejectionReason;
  content.approved_by = principalId;

  await content.save();

  return content;
};

module.exports = {
  getPendingContent,
  getAllContent,
  approveContent,
  rejectContent,
};
