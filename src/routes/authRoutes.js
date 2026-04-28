const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const validate = require('../middlewares/validationMiddleware');
const { ROLES } = require('../utils/constants');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

const registerValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('role')
    .isIn([ROLES.PRINCIPAL, ROLES.TEACHER])
    .withMessage(`Role must be either ${ROLES.PRINCIPAL} or ${ROLES.TEACHER}`),
];

const loginValidation = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

// Public registration (creates teacher or principal if no auth)
// Protected registration (only principal can create teachers)
router.post(
  '/register',
  registerValidation,
  validate,
  asyncHandler(async (req, res, next) => {
    // If authorization header is present, require principal role
    if (req.headers.authorization) {
      authMiddleware(req, res, () => {
        roleMiddleware([ROLES.PRINCIPAL])(req, res, next);
      });
    } else {
      next();
    }
  }),
  authController.register
);

router.post('/login', loginValidation, validate, authController.login);

module.exports = router;
