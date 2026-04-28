const contentService = require('../services/contentService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const uploadContent = asyncHandler(async (req, res) => {
  console.log("BODY:", req.body);
  console.log("FILE:", req.file);
  const {
    title,
    description,
    subject_id,
    start_time,
    end_time,
    rotation_duration,
    rotation_order,
  } = req.body;

  const file = req.file;

  const content = await contentService.uploadContent({
    title,
    description,
    subjectId: subject_id,
    file,
    startTime: new Date(start_time),
    endTime: new Date(end_time),
    rotationDuration: rotation_duration ? parseInt(rotation_duration, 10) : undefined,
    rotationOrder: rotation_order ? parseInt(rotation_order, 10) : undefined,
    uploadedBy: req.user.id,
  });

  res.status(201).json(new ApiResponse(201, content, 'Content uploaded successfully'));
});

const getMyContent = asyncHandler(async (req, res) => {
  const { status, subject_id } = req.query;

  const contents = await contentService.getMyContent(req.user.id, {
    status,
    subject_id,
  });

  res.status(200).json(new ApiResponse(200, contents, 'My content retrieved'));
});

const getContentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await contentService.getContentById(
    id,
    req.user.id,
    req.user.role
  );

  res.status(200).json(new ApiResponse(200, content, 'Content retrieved'));
});

module.exports = {
  uploadContent,
  getMyContent,
  getContentById,
};
