const authService = require('../services/authService');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const creatorRole = req.user ? req.user.role : null;

  const result = await authService.register(
    { name, email, password, role },
    creatorRole
  );

  res.status(201).json(new ApiResponse(201, result, 'User registered successfully'));
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const result = await authService.login({ email, password });

  res.status(200).json(new ApiResponse(200, result, 'Login successful'));
});

module.exports = {
  register,
  login,
};
