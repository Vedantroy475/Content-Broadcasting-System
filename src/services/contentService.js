const { Content, ContentSchedule, Subject, User } = require('../models');
const ApiError = require('../utils/ApiError');
const { CONTENT_STATUS, ROLES } = require('../utils/constants');
const { uploadToAppwrite } = require('./uploadService');

const uploadContent = async ({
  title,
  description,
  subjectId,
  file,
  startTime,
  endTime,
  rotationDuration,
  rotationOrder,
  uploadedBy,
}) => {
  const subject = await Subject.findByPk(subjectId);
  if (!subject) {
    throw new ApiError(404, 'Subject not found');
  }

  let fileUrl = null;
  let fileType = null;
  let fileSize = null;

  if (file) {
    try {
      const uploadResult = await uploadToAppwrite(file);
      fileUrl = uploadResult.fileUrl;
      fileType = uploadResult.mimeType;
      fileSize = uploadResult.fileSize;
    } catch (error) {
      throw new ApiError(500, 'Failed to upload file to storage');
    }
  }

  const content = await Content.create({
    title,
    description,
    subject_id: subjectId,
    file_path: null,
    file_url: fileUrl,
    file_type: fileType,
    file_size: fileSize,
    uploaded_by: uploadedBy,
    status: CONTENT_STATUS.PENDING,
  });

  await ContentSchedule.create({
    content_id: content.id,
    start_time: startTime,
    end_time: endTime,
    rotation_duration: rotationDuration || 5,
    rotation_order: rotationOrder || 0,
  });

  return content;
};

const getMyContent = async (teacherId, filters = {}) => {
  const where = { uploaded_by: teacherId };

  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.subject_id) {
    where.subject_id = filters.subject_id;
  }

  const contents = await Content.findAll({
    where,
    include: [
      { model: Subject, as: 'subject', attributes: ['id', 'name'] },
      { model: ContentSchedule, as: 'schedule' },
    ],
    order: [['created_at', 'DESC']],
  });

  return contents;
};

const getContentById = async (contentId, userId, userRole) => {
  const where = { id: contentId };

  if (userRole === ROLES.TEACHER) {
    where.uploaded_by = userId;
  }

  const content = await Content.findOne({
    where,
    include: [
      { model: Subject, as: 'subject', attributes: ['id', 'name'] },
      { model: ContentSchedule, as: 'schedule' },
      { model: User, as: 'uploader', attributes: ['id', 'name', 'email'] },
      { model: User, as: 'approver', attributes: ['id', 'name', 'email'] },
    ],
  });

  if (!content) {
    throw new ApiError(404, 'Content not found');
  }

  return content;
};

module.exports = {
  uploadContent,
  getMyContent,
  getContentById,
};
