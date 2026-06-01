const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  getAllMotherboards,
  createMotherboard,
  updateMotherboard,
  deleteMotherboard
} = require('../controllers/motherboard.controller');

router.use(protect);

router.route('/')
  .get(getAllMotherboards)
  .post(authorize('SUPER_ADMIN'), createMotherboard);

router.route('/:id')
  .put(authorize('SUPER_ADMIN'), updateMotherboard)
  .delete(authorize('SUPER_ADMIN'), deleteMotherboard);

module.exports = router;
