const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/fileUpload');
const {
  createTicket,
  getTickets,
  getTicket,
  updateStatus,
  submitDiagnosis,
  submitPayment,
  deleteImage,
  addImages
} = require('../controllers/ticket.controller');

router.use(protect);

router.route('/')
  .get(getTickets)
  .post(authorize('RECEPTIONIST', 'SUPER_ADMIN'), upload.array('images', 8), createTicket);

router.get('/:id', getTicket);

router.put('/:id/status', authorize('RECEPTIONIST', 'SUPER_ADMIN'), updateStatus);

router.post('/:id/diagnosis', authorize('RECEPTIONIST', 'SUPER_ADMIN'), submitDiagnosis);

router.post('/:id/payment', authorize('RECEPTIONIST', 'SUPER_ADMIN'), submitPayment);

// Image management
router.post('/:id/images', authorize('RECEPTIONIST', 'SUPER_ADMIN'), upload.array('images', 8), addImages);
router.delete('/:id/images/:imageIndex', authorize('RECEPTIONIST', 'SUPER_ADMIN'), deleteImage);

module.exports = router;
