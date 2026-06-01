require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

console.log('Testing with different configurations...\n');

// Try 1: Without any statusCallback
console.log('Try 1: Basic message...');
client.messages
  .create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to: 'whatsapp:+918700483024',
    body: '🧪 TEST 1: Basic WhatsApp test from Motherboard Ticket System!'
  })
  .then(message => {
    console.log('✅ Success! Message SID:', message.sid);
    process.exit(0);
  })
  .catch(error => {
    console.log('❌ Try 1 failed:', error.message);
    
    // Try 2: With explicit null statusCallback
    console.log('\nTry 2: With statusCallback = undefined...');
    return client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+918700483024',
      body: '🧪 TEST 2: WhatsApp with statusCallback undefined',
      statusCallback: undefined
    });
  })
  .then(message => {
    if (message) {
      console.log('✅ Success! Message SID:', message.sid);
      process.exit(0);
    }
  })
  .catch(error => {
    console.log('❌ Try 2 failed:', error.message);
    
    // Try 3: With empty string statusCallback
    console.log('\nTry 3: With statusCallback = empty string...');
    return client.messages.create({
      from: process.env.TWILIO_WHATSAPP_NUMBER,
      to: 'whatsapp:+918700483024',
      body: '🧪 TEST 3: WhatsApp with empty statusCallback',
      statusCallback: ''
    });
  })
  .then(message => {
    if (message) {
      console.log('✅ Success! Message SID:', message.sid);
      process.exit(0);
    }
  })
  .catch(error => {
    console.log('❌ Try 3 failed:', error.message);
    console.log('\n⚠️  All attempts failed. Please check your Twilio account settings.');
    console.log('You may need to remove the StatusCallback URL from your Twilio Messaging Service.');
    process.exit(1);
  });
