require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

client.messages
  .create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: 'whatsapp:+918700483024',
    body: '🧪 TEST: Motherboard Ticket System - This is a test WhatsApp message!'
  })
  .then(message => {
    console.log('✅ WhatsApp sent successfully!');
    console.log('Message SID:', message.sid);
    console.log('Status:', message.status);
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Error:', error.message);
    console.error('Code:', error.code);
    process.exit(1);
  });
