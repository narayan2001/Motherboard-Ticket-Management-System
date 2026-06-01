const prisma = require('../config/database');

// @desc    Handle incoming WhatsApp messages from Twilio
// @route   POST /api/webhooks/whatsapp
exports.handleWhatsAppWebhook = async (req, res) => {
  try {
    const { From, Body, MessageSid } = req.body;

    console.log('📱 WhatsApp webhook received:', { From, Body, MessageSid });

    // Clean up the phone number (remove 'whatsapp:' prefix)
    const customerPhone = From?.replace('whatsapp:', '');
    
    if (!customerPhone || !Body) {
      return res.status(200).send('OK');
    }

    // Normalize the response
    const response = Body.trim().toLowerCase();
    
    // Check if it's a yes/no response
    let approvalStatus = null;
    if (response === 'yes' || response === 'y' || response === '1') {
      approvalStatus = 'APPROVED';
    } else if (response === 'no' || response === 'n' || response === '0') {
      approvalStatus = 'DECLINED';
    }

    // If not a valid approval response, ignore
    if (!approvalStatus) {
      console.log('⚠️  Not a valid approval response:', Body);
      return res.status(200).send('OK');
    }

    // Find the most recent pending approval for this customer phone number
    const ticket = await prisma.ticket.findFirst({
      where: {
        customerPhone: {
          endsWith: customerPhone.slice(-10) // Match last 10 digits
        },
        status: 'AWAITING_APPROVAL'
      },
      orderBy: {
        updatedAt: 'desc'
      },
      include: {
        approval: true,
        diagnosis: true
      }
    });

    if (!ticket || !ticket.approval) {
      console.log('❌ No pending approval found for phone:', customerPhone);
      return res.status(200).send('OK');
    }

    // Update approval status
    await prisma.ticketApproval.update({
      where: { id: ticket.approval.id },
      data: {
        approvalStatus,
        customerResponseNotes: `Customer replied: ${Body}`,
        responseDate: new Date()
      }
    });

    // Update ticket status
    const newStatus = approvalStatus === 'APPROVED' ? 'APPROVED' : 'DECLINED';
    await prisma.ticket.update({
      where: { id: ticket.id },
      data: { status: newStatus }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: ticket.createdById, // Use creator as fallback
        actionType: `CUSTOMER_${approvalStatus}`,
        actionDescription: `Customer ${approvalStatus === 'APPROVED' ? 'approved' : 'declined'} via WhatsApp: "${Body}"`,
        oldStatus: 'AWAITING_APPROVAL',
        newStatus
      }
    });

    console.log(`✅ Ticket ${ticket.ticketNumber} auto-${approvalStatus.toLowerCase()} via WhatsApp`);

    // Send confirmation message to customer
    const { sendWhatsAppNotification } = require('../utils/whatsapp');
    const confirmationMessage = approvalStatus === 'APPROVED'
      ? `✅ Thank you! Your repair for ticket ${ticket.ticketNumber} has been APPROVED. We'll proceed with the repair. Total cost: ₹${ticket.diagnosis.totalCost}`
      : `❌ We've received your response. Ticket ${ticket.ticketNumber} has been DECLINED. Please contact us if you have any questions.`;
    
    await sendWhatsAppNotification(customerPhone, confirmationMessage);

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ WhatsApp webhook error:', error);
    // Always return 200 to Twilio to prevent retries
    res.status(200).send('OK');
  }
};
