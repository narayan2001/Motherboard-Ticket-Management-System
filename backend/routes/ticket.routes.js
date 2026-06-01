const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth.middleware');
const upload = require('../utils/fileUpload');
const {
  createTicket,
  getAllTickets,
  getTicket,
  assignTicket,
  updateStatus,
  submitDiagnosis,
  updateApproval,
  submitPayment
} = require('../controllers/ticket.controller');

router.use(protect);

router.route('/')
  .get(getAllTickets)
  .post(authorize('RECEPTIONIST', 'SUPER_ADMIN'), upload.single('image'), createTicket);

router.get('/:id', getTicket);

router.put('/:id/assign', authorize('SUPER_ADMIN'), assignTicket);

router.put('/:id/status', authorize('EMPLOYEE', 'SUPER_ADMIN'), updateStatus);

router.post('/:id/diagnosis', authorize('EMPLOYEE', 'SUPER_ADMIN'), submitDiagnosis);

router.put('/:id/approval', authorize('EMPLOYEE', 'SUPER_ADMIN'), updateApproval);

router.post('/:id/payment', authorize('EMPLOYEE', 'SUPER_ADMIN'), submitPayment);

module.exports = router;
