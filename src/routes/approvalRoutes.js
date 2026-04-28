const express = require('express');
const { body } = require('express-validator');
const approvalController = require('../controllers/approvalController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { ROLES } = require('../utils/constants');

const router = express.Router();

router.get(
  '/pending',
  authMiddleware,
  roleMiddleware([ROLES.PRINCIPAL]),
  approvalController.getPendingContent
);

router.get(
  '/all',
  authMiddleware,
  roleMiddleware([ROLES.PRINCIPAL]),
  approvalController.getAllContent
);

router.patch(
  '/:id/approve',
  authMiddleware,
  roleMiddleware([ROLES.PRINCIPAL]),
  approvalController.approveContent
);

router.patch(
  '/:id/reject',
  authMiddleware,
  roleMiddleware([ROLES.PRINCIPAL]),
  body('rejection_reason').trim().notEmpty().withMessage('Rejection reason is required'),
  validate,
  approvalController.rejectContent
);

module.exports = router;
