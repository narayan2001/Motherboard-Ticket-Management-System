const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhook.controller');

// Twilio WhatsApp webhook (no auth required)
router.post('/whatsapp', webhookController.handleWhatsAppWebhook);

module.exports = router;
