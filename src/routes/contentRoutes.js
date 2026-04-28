const express = require('express');
const { body } = require('express-validator');
const contentController = require('../controllers/contentController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { upload, handleMulterError } = require('../config/multer');
const { ROLES } = require('../utils/constants');

const router = express.Router();

const uploadValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('subject_id').notEmpty().withMessage('Subject is required'),
  body('start_time').notEmpty().withMessage('Start time is required'),
  body('end_time').notEmpty().withMessage('End time is required'),
];

router.post(
  '/upload',
  authMiddleware,
  roleMiddleware([ROLES.TEACHER]),
  upload.single('file'),
   (req, res, next) => {
    console.log("BODY BEFORE VALIDATION:", req.body);
    console.log("FILE BEFORE VALIDATION:", req.file);
    next();
  },
  handleMulterError, 
  uploadValidation,
  validate,
  contentController.uploadContent
);

router.get(
  '/my-content',
  authMiddleware,
  roleMiddleware([ROLES.TEACHER]),
  contentController.getMyContent
);

router.get(
  '/:id',
  authMiddleware,
  contentController.getContentById
);

module.exports = router;
