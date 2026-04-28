const broadcastService = require('../services/broadcastService');
const { Subject } = require('../models');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const getLiveContent = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { subject } = req.query;

  let subjectFilter = null;
  if (subject) {
    const subjectRecord = await Subject.findOne({ where: { name: subject.toLowerCase() } });
    if (subjectRecord) {
      subjectFilter = subjectRecord.id;
    }
  }

  const result = await broadcastService.getLiveContent(teacherId, subjectFilter);

  res.status(200).json(new ApiResponse(200, result.data, result.message));
});

module.exports = {
  getLiveContent,
};
