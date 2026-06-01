const prisma = require('../config/database');

/**
 * Send WhatsApp notification
 * @param {string} phoneNumber - Customer phone number with country code
 * @param {string} message - Message content
 * @param {string} ticketId - Ticket ID for logging
 * @param {string} messageType - Type of message
 * @returns {Promise}
 */
async function sendWhatsAppNotification(phoneNumber, message, ticketId, messageType) {
  try {
    // Ensure phone number has country code
    let formattedPhone = phoneNumber;
    if (!phoneNumber.startsWith('+')) {
      formattedPhone = `+91${phoneNumber}`; // Default to India, adjust as needed
    }

    // Check if Twilio is configured
    const twilioConfigured = 
      process.env.TWILIO_ACCOUNT_SID && 
      process.env.TWILIO_ACCOUNT_SID.startsWith('AC') &&
      process.env.TWILIO_AUTH_TOKEN &&
      process.env.TWILIO_AUTH_TOKEN !== 'demo_auth_token';

    let twilioMessage = null;

    if (twilioConfigured) {
      // Only import and use Twilio if properly configured
      const twilio = require('twilio');
      const client = twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN
      );

      // Send WhatsApp message via Twilio
      const messageData = {
        from: process.env.TWILIO_WHATSAPP_NUMBER,
        to: `whatsapp:${formattedPhone}`,
        body: message
      };
      
      // Only add statusCallback if it's a valid URL
      if (process.env.TWILIO_STATUS_CALLBACK && process.env.TWILIO_STATUS_CALLBACK.startsWith('http')) {
        messageData.statusCallback = process.env.TWILIO_STATUS_CALLBACK;
      }
      
      twilioMessage = await client.messages.create(messageData);
      console.log(`✅ WhatsApp notification sent to ${phoneNumber}`);
    } else {
      // Demo mode - just log the message
      console.log(`📱 [DEMO MODE] WhatsApp notification (would be sent to ${phoneNumber}):`);
      console.log(`   Message: ${message}`);
    }

    // Log notification in database
    await prisma.notification.create({
      data: {
        ticketId,
        recipientPhone: phoneNumber,
        messageType,
        messageContent: message,
        deliveryStatus: twilioConfigured ? 'SENT' : 'DEMO',
        sentAt: new Date()
      }
    });

    return twilioMessage;
  } catch (error) {
    console.error('❌ WhatsApp notification error:', error.message);

    // Log failed notification
    await prisma.notification.create({
      data: {
        ticketId,
        recipientPhone: phoneNumber,
        messageType,
        messageContent: message,
        deliveryStatus: 'FAILED',
        errorMessage: error.message,
        sentAt: new Date()
      }
    });

    // Don't throw error in demo mode, just log it
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_ACCOUNT_SID.startsWith('AC')) {
      console.log('⚠️  Twilio not configured - running in demo mode');
      return null;
    }

    // If error is about StatusCallback, log but don't throw
    if (error.message && error.message.includes('StatusCallback')) {
      console.log('⚠️  Twilio StatusCallback configuration issue - continuing without WhatsApp');
      console.log('   Fix: Go to Twilio Console → Messaging Service → Remove StatusCallback URL');
      return null;
    }

    throw error;
  }
}

module.exports = { sendWhatsAppNotification };
