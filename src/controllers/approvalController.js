const approvalService = require('../services/approvalService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getPendingContent = asyncHandler(async (req, res) => {
  const contents = await approvalService.getPendingContent();
  res.status(200).json(new ApiResponse(200, contents, 'Pending content retrieved'));
});

const getAllContent = asyncHandler(async (req, res) => {
  const { status, subject_id, uploaded_by } = req.query;

  const contents = await approvalService.getAllContent({
    status,
    subject_id,
    uploaded_by,
  });

  res.status(200).json(new ApiResponse(200, contents, 'All content retrieved'));
});

const approveContent = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const content = await approvalService.approveContent(id, req.user.id);

  res.status(200).json(new ApiResponse(200, content, 'Content approved successfully'));
});

const rejectContent = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rejection_reason } = req.body;

  const content = await approvalService.rejectContent(
    id,
    req.user.id,
    rejection_reason
  );

  res.status(200).json(new ApiResponse(200, content, 'Content rejected successfully'));
});

module.exports = {
  getPendingContent,
  getAllContent,
  approveContent,
  rejectContent,
};
