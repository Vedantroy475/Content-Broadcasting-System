const express = require('express');
const broadcastController = require('../controllers/broadcastController');

const router = express.Router();

router.get('/live/:teacherId', broadcastController.getLiveContent);

module.exports = router;
