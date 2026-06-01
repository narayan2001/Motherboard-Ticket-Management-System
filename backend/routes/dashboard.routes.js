const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth.middleware');
const {
  getDashboardStats,
  getReports
} = require('../controllers/dashboard.controller');

router.use(protect);

router.get('/stats', getDashboardStats);
router.get('/reports', getReports);

module.exports = router;
