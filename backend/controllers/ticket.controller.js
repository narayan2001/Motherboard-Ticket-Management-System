const prisma = require('../config/database');
const { sendWhatsAppNotification } = require('../utils/whatsapp');

// @desc    Create new ticket
// @route   POST /api/tickets
exports.createTicket = async (req, res, next) => {
  try {
    const {
      customerName,
      customerPhone,
      customerEmail,
      motherboardBrand,
      motherboardType,
      initialIssue,
      priority
    } = req.body;

    // Validation
    const errors = [];

    if (!customerName || customerName.trim().length < 2) {
      errors.push('Customer name must be at least 2 characters');
    }

    // Phone validation - Indian format
    const phoneRegex = /^(\+91)?[6-9]\d{9}$/;
    const cleanPhone = customerPhone ? customerPhone.replace(/\s/g, '') : '';
    if (!phoneRegex.test(cleanPhone)) {
      errors.push('Please provide a valid 10-digit Indian phone number');
    }

    // Email validation (if provided)
    if (customerEmail && customerEmail.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerEmail)) {
        errors.push('Please provide a valid email address');
      }
    }

    if (!motherboardBrand || motherboardBrand.trim().length < 2) {
      errors.push('Motherboard brand is required');
    }

    if (!motherboardType || motherboardType.trim().length < 2) {
      errors.push('Motherboard model/type is required');
    }

    if (!initialIssue || initialIssue.trim().length < 10) {
      errors.push('Please provide a detailed issue description (at least 10 characters)');
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Format phone number
    const formattedPhone = cleanPhone.startsWith('+91') ? cleanPhone : `+91${cleanPhone.replace(/^\+91/, '')}`;

    // Generate unique ticket number
    const year = new Date().getFullYear();
    
    // Count all tickets for this year to get the next number
    const ticketCount = await prisma.ticket.count({
      where: {
        ticketNumber: {
          startsWith: `MB-${year}-`
        }
      }
    });
    
    const nextNumber = ticketCount + 1;
    const ticketNumber = `MB-${year}-${String(nextNumber).padStart(4, '0')}`;

    // Handle image upload if exists
    let imagePath = null;
    if (req.file) {
      imagePath = `/uploads/${req.file.filename}`;
    }

    // Create ticket
    const ticket = await prisma.ticket.create({
      data: {
        ticketNumber,
        customerName: customerName.trim(),
        customerPhone: formattedPhone,
        customerEmail: customerEmail ? customerEmail.trim() : null,
        motherboardBrand: motherboardBrand.trim(),
        motherboardType: motherboardType.trim(),
        initialIssue: initialIssue.trim(),
        priority: priority || 'MEDIUM',
        imagePath,
        createdById: req.user.id
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: req.user.id,
        actionType: 'CREATED',
        actionDescription: 'Ticket created',
        newStatus: 'CREATED'
      }
    });

    res.status(201).json({
      success: true,
      message: 'Ticket created successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all tickets with filters
// @route   GET /api/tickets
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, priority, search, assignedTo, page = 1, limit = 20 } = req.query;

    const where = {};

    // Apply filters
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assignedTo) where.assignedToId = assignedTo;
    
    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } }
      ];
    }

    // Role-based filtering
    if (req.user.role === 'EMPLOYEE') {
      where.assignedToId = req.user.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          createdBy: { select: { id: true, name: true } },
          assignedTo: { select: { id: true, name: true } },
          diagnosis: true,
          approval: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: parseInt(limit)
      }),
      prisma.ticket.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
exports.getTicket = async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        assignedTo: { select: { id: true, name: true, email: true, phone: true } },
        diagnosis: {
          include: {
            diagnosedBy: { select: { id: true, name: true } }
          }
        },
        approval: true,
        payment: {
          include: {
            collectedBy: { select: { id: true, name: true } }
          }
        },
        history: {
          include: {
            changedBy: { select: { id: true, name: true } }
          },
          orderBy: { createdAt: 'desc' }
        },
        notifications: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check access
    if (req.user.role === 'EMPLOYEE' && ticket.assignedToId !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this ticket'
      });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign ticket to employee
// @route   PUT /api/tickets/:id/assign
exports.assignTicket = async (req, res, next) => {
  try {
    const { assignedToId } = req.body;

    // Verify employee exists
    const employee = await prisma.user.findUnique({
      where: { id: assignedToId }
    });

    if (!employee || employee.role !== 'EMPLOYEE') {
      return res.status(400).json({
        success: false,
        message: 'Invalid employee ID'
      });
    }

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        assignedToId,
        status: 'ASSIGNED'
      },
      include: {
        assignedTo: { select: { id: true, name: true } }
      }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: req.user.id,
        actionType: 'ASSIGNED',
        actionDescription: `Ticket assigned to ${employee.name}`,
        oldStatus: 'CREATED',
        newStatus: 'ASSIGNED'
      }
    });

    res.json({
      success: true,
      message: 'Ticket assigned successfully',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket status
// @route   PUT /api/tickets/:id/status
exports.updateStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        diagnosis: true
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: ticket.id,
        changedById: req.user.id,
        actionType: 'STATUS_CHANGED',
        actionDescription: notes || `Status changed from ${ticket.status} to ${status}`,
        oldStatus: ticket.status,
        newStatus: status
      }
    });

    // Send WhatsApp notification when ticket is resolved
    if (status === 'RESOLVED') {
      const { sendWhatsAppNotification } = require('../utils/whatsapp');
      
      const message = `✅ Great news! Your motherboard repair is complete!

🎫 Ticket: ${ticket.ticketNumber}
📋 Customer: ${ticket.customerName}
🔧 Motherboard: ${ticket.motherboardBrand} ${ticket.motherboardType}

Your device has been repaired and is ready for pickup!

${ticket.diagnosis ? `💰 Total Amount: ₹${ticket.diagnosis.totalCost}` : ''}

Please visit our service center to collect your motherboard and make the payment.

Thank you for choosing our service! 😊`;

      await sendWhatsAppNotification(ticket.customerPhone, message);
    }
    
    // Send WhatsApp notification when repair starts
    if (status === 'IN_PROGRESS') {
      const { sendWhatsAppNotification } = require('../utils/whatsapp');
      
      const message = `🔧 Your motherboard repair has started!

🎫 Ticket: ${ticket.ticketNumber}
📋 Customer: ${ticket.customerName}
🔧 Motherboard: ${ticket.motherboardBrand} ${ticket.motherboardType}

Our technicians are now working on your repair.

${ticket.diagnosis?.estimatedCompletionDays ? `⏱️ Estimated Completion: ${ticket.diagnosis.estimatedCompletionDays} day(s)` : ''}

We'll notify you once it's complete! 😊`;

      await sendWhatsAppNotification(ticket.customerPhone, message);
    }

    res.json({
      success: true,
      message: 'Ticket status updated',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit diagnosis
// @route   POST /api/tickets/:id/diagnosis
exports.submitDiagnosis = async (req, res, next) => {
  try {
    const {
      diagnosisNotes,
      repairSolution,
      partsRequired,
      partsCost,
      laborCost,
      estimatedCompletionDays
    } = req.body;

    // Parse costs as floats
    const parsedPartsCost = parseFloat(partsCost || 0);
    const parsedLaborCost = parseFloat(laborCost || 0);
    const totalCost = parsedPartsCost + parsedLaborCost;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Create or update diagnosis
    const diagnosis = await prisma.ticketDiagnosis.upsert({
      where: { ticketId: req.params.id },
      create: {
        ticketId: req.params.id,
        diagnosisNotes,
        repairSolution,
        partsRequired,
        partsCost: parsedPartsCost,
        laborCost: parsedLaborCost,
        totalCost,
        estimatedCompletionDays: parseInt(estimatedCompletionDays || 0),
        diagnosedById: req.user.id
      },
      update: {
        diagnosisNotes,
        repairSolution,
        partsRequired,
        partsCost: parsedPartsCost,
        laborCost: parsedLaborCost,
        totalCost,
        estimatedCompletionDays: parseInt(estimatedCompletionDays || 0)
      }
    });

    // Create approval record
    const approval = await prisma.ticketApproval.upsert({
      where: { ticketId: req.params.id },
      create: {
        ticketId: req.params.id,
        diagnosisId: diagnosis.id,
        approvalStatus: 'PENDING',
        notificationSentAt: new Date()
      },
      update: {
        approvalStatus: 'PENDING',
        diagnosisId: diagnosis.id
      }
    });

    // Update ticket status
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: 'AWAITING_APPROVAL' }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: req.params.id,
        changedById: req.user.id,
        actionType: 'DIAGNOSIS_SUBMITTED',
        actionDescription: 'Diagnosis submitted and waiting for customer approval',
        oldStatus: ticket.status,
        newStatus: 'AWAITING_APPROVAL'
      }
    });

    // Send WhatsApp notification
    const message = `Hello ${ticket.customerName},\n\nYour motherboard (Ticket: ${ticket.ticketNumber}) has been diagnosed.\n\nIssue Found: ${diagnosisNotes}\n\nTotal Repair Cost: ₹${totalCost}\nExpected Completion: ${estimatedCompletionDays} days\n\nPlease reply YES to approve or NO to decline the repair.`;
    
    await sendWhatsAppNotification(ticket.customerPhone, message, req.params.id, 'DIAGNOSIS_ESTIMATE');

    res.json({
      success: true,
      message: 'Diagnosis submitted and notification sent to customer',
      data: { diagnosis, approval }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update approval status
// @route   PUT /api/tickets/:id/approval
exports.updateApproval = async (req, res, next) => {
  try {
    const { approvalStatus, customerResponseNotes } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        diagnosis: true
      }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const approval = await prisma.ticketApproval.update({
      where: { ticketId: req.params.id },
      data: {
        approvalStatus,
        customerResponseNotes,
        responseDate: new Date()
      }
    });

    const newStatus = approvalStatus === 'APPROVED' ? 'APPROVED' : 'DECLINED';

    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: newStatus }
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: req.params.id,
        changedById: req.user.id,
        actionType: 'APPROVAL_UPDATED',
        actionDescription: `Customer ${approvalStatus.toLowerCase()} the repair`,
        oldStatus: 'AWAITING_APPROVAL',
        newStatus
      }
    });

    // Send WhatsApp notification for manual approval/decline
    const { sendWhatsAppNotification } = require('../utils/whatsapp');
    
    if (approvalStatus === 'APPROVED') {
      const message = `✅ Your repair has been APPROVED!

🎫 Ticket: ${ticket.ticketNumber}
🔧 Motherboard: ${ticket.motherboardBrand} ${ticket.motherboardType}
💰 Total Cost: ₹${ticket.diagnosis.totalCost}

We're now proceeding with the repair. You'll be notified once it's completed!

Thank you! 😊`;
      
      await sendWhatsAppNotification(ticket.customerPhone, message);
    } else if (approvalStatus === 'DECLINED') {
      const message = `❌ Repair DECLINED - Ticket ${ticket.ticketNumber}

Your motherboard repair request has been marked as declined.

If you have any questions or wish to proceed, please contact us.

Thank you!`;
      
      await sendWhatsAppNotification(ticket.customerPhone, message);
    }

    res.json({
      success: true,
      message: 'Approval status updated',
      data: approval
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit payment
// @route   POST /api/tickets/:id/payment
exports.submitPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod, receiptNumber } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: { diagnosis: true }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    const payment = await prisma.payment.create({
      data: {
        ticketId: req.params.id,
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        receiptNumber,
        collectedById: req.user.id
      }
    });

    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: 'CLOSED' }
    });

    await prisma.ticketHistory.create({
      data: {
        ticketId: req.params.id,
        changedById: req.user.id,
        actionType: 'PAYMENT_RECEIVED',
        actionDescription: `Payment of ₹${amountPaid} received via ${paymentMethod}`,
        oldStatus: 'RESOLVED',
        newStatus: 'CLOSED'
      }
    });

    // Send thank you notification
    const message = `Thank you for choosing our services!\n\nYour motherboard (Ticket: ${ticket.ticketNumber}) has been successfully repaired.\n\nWe appreciate your business and look forward to serving you again.`;
    
    await sendWhatsAppNotification(ticket.customerPhone, message, req.params.id, 'THANK_YOU');

    res.json({
      success: true,
      message: 'Payment recorded and ticket closed',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};
