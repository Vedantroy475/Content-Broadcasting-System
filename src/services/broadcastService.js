const { Op } = require('sequelize');
const { Content, ContentSchedule, Subject } = require('../models');
const { CONTENT_STATUS } = require('../utils/constants');

const getLiveContent = async (teacherId, subjectFilter = null) => {
  const now = new Date();

  const where = {
    uploaded_by: teacherId,
    status: CONTENT_STATUS.APPROVED,
  };

  if (subjectFilter) {
    where.subject_id = subjectFilter;
  }

  const contents = await Content.findAll({
    where,
    include: [
      {
        model: ContentSchedule,
        as: 'schedule',
        where: {
          start_time: { [Op.lte]: now },
          end_time: { [Op.gte]: now },
        },
        required: true,
      },
      { model: Subject, as: 'subject', attributes: ['id', 'name'] },
    ],
  });

  if (contents.length === 0) {
    return { message: 'No content available', data: null };
  }

  // Group by subject
  const groupedBySubject = {};
  contents.forEach((content) => {
    const subjectId = content.subject_id;
    if (!groupedBySubject[subjectId]) {
      groupedBySubject[subjectId] = [];
    }
    groupedBySubject[subjectId].push(content);
  });

  const result = [];

  for (const subjectId of Object.keys(groupedBySubject)) {
    const items = groupedBySubject[subjectId];

    // Sort by rotation_order
    items.sort((a, b) => a.schedule.rotation_order - b.schedule.rotation_order);

    const activeItem = getActiveItemInRotation(items, now);

    if (activeItem) {
      result.push({
        subject: activeItem.subject,
        content: {
          id: activeItem.id,
          title: activeItem.title,
          description: activeItem.description,
          file_path: activeItem.file_path,
          file_url: activeItem.file_url,
          file_type: activeItem.file_type,
          current_until: getCurrentUntil(activeItem, items, now),
        },
      });
    }
  }

  if (result.length === 0) {
    return { message: 'No content available', data: null };
  }

  return { message: 'Live content', data: result };
};

const getActiveItemInRotation = (items, now) => {
  const totalCycleMinutes = items.reduce(
    (sum, item) => sum + item.schedule.rotation_duration,
    0
  );

  if (totalCycleMinutes === 0) {
    return items[0] || null;
  }

  const earliestStart = items.reduce((min, item) => {
    const st = new Date(item.schedule.start_time).getTime();
    return st < min ? st : min;
  }, Infinity);

  const elapsedSeconds = Math.floor((now.getTime() - earliestStart) / 1000);
  const totalCycleSeconds = totalCycleMinutes * 60;
  const position = elapsedSeconds % totalCycleSeconds;

  let cumulativeSeconds = 0;
  for (const item of items) {
    cumulativeSeconds += item.schedule.rotation_duration * 5;
    if (position < cumulativeSeconds) {
      return item;
    }
  }
  console.log("Elapsed:", elapsedSeconds);
console.log("Position:", position);
console.log("TotalCycle:", totalCycleSeconds);
  // Fallback (should not happen)
  return items[items.length - 1];
};

const getCurrentUntil = (activeItem, allItems, now) => {
  const totalCycleMinutes = allItems.reduce(
    (sum, item) => sum + item.schedule.rotation_duration,
    0
  );

  if (totalCycleMinutes === 0 || allItems.length <= 1) {
    return activeItem.schedule.end_time;
  }

  const earliestStart = allItems.reduce((min, item) => {
    const st = new Date(item.schedule.start_time).getTime();
    return st < min ? st : min;
  }, Infinity);

  const elapsedSeconds = Math.floor((now.getTime() - earliestStart) / 1000);
  const totalCycleSeconds = totalCycleMinutes * 60;
  const position = elapsedSeconds % totalCycleSeconds;

  let cumulativeSeconds = 0;
  for (const item of allItems) {
    cumulativeSeconds += item.schedule.rotation_duration * 60;
    if (position < cumulativeSeconds) {
      const remainingInSlot = cumulativeSeconds - position;
      return new Date(now.getTime() + remainingInSlot * 1000);
    }
  }

  return activeItem.schedule.end_time;
};

module.exports = {
  getLiveContent,
};
