const prisma = require('../config/database');

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
      initialIssue
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
    
    const ticketCount = await prisma.ticket.count({
      where: {
        ticketNumber: {
          startsWith: `MB-${year}-`
        }
      }
    });
    
    const nextNumber = ticketCount + 1;
    const ticketNumber = `MB-${year}-${String(nextNumber).padStart(4, '0')}`;

    // Handle multiple image uploads
    let images = [];
    if (req.files && req.files.length > 0) {
      images = req.files.map(file => `/uploads/${file.filename}`);
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
        images,
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
        actionType: 'TICKET_CREATED',
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

// @desc    Get all tickets
// @route   GET /api/tickets
exports.getTickets = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { customerName: { contains: search, mode: 'insensitive' } },
        { customerPhone: { contains: search } },
        { motherboardBrand: { contains: search, mode: 'insensitive' } },
        { motherboardType: { contains: search, mode: 'insensitive' } }
      ];
    }

    const skip = (page - 1) * parseInt(limit);

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          createdBy: {
            select: { id: true, name: true, email: true }
          },
          diagnosis: true,
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
          page: parseInt(page),
          limit: parseInt(limit),
          total,
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
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        diagnosis: {
          include: {
            diagnosedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        payment: {
          include: {
            collectedBy: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        history: {
          include: {
            changedBy: {
              select: { id: true, name: true }
            }
          },
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

    res.json({
      success: true,
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
      where: { id: req.params.id }
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

    // Update ticket status
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { status: 'IN_PROGRESS' }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: req.params.id,
        changedById: req.user.id,
        actionType: 'DIAGNOSIS_SUBMITTED',
        actionDescription: 'Diagnosis submitted',
        oldStatus: ticket.status,
        newStatus: 'IN_PROGRESS'
      }
    });

    res.json({
      success: true,
      message: 'Diagnosis submitted successfully',
      data: diagnosis
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit payment
// @route   POST /api/tickets/:id/payment
exports.submitPayment = async (req, res, next) => {
  try {
    const { amountPaid, paymentMethod } = req.body;

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        ticketId: req.params.id,
        amountPaid: parseFloat(amountPaid),
        paymentMethod,
        collectedById: req.user.id
      }
    });

    // Update ticket status and payment status
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: { 
        status: 'CLOSED',
        paymentStatus: 'PAID'
      }
    });

    // Create history entry
    await prisma.ticketHistory.create({
      data: {
        ticketId: req.params.id,
        changedById: req.user.id,
        actionType: 'PAYMENT_RECEIVED',
        actionDescription: `Payment received: ₹${amountPaid} via ${paymentMethod}`,
        oldStatus: ticket.status,
        newStatus: 'CLOSED'
      }
    });

    res.json({
      success: true,
      message: 'Payment recorded and ticket closed',
      data: payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket image
// @route   DELETE /api/tickets/:id/images/:imageIndex
exports.deleteImage = async (req, res, next) => {
  try {
    const { id, imageIndex } = req.params;
    const index = parseInt(imageIndex);

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    if (index < 0 || index >= ticket.images.length) {
      return res.status(400).json({
        success: false,
        message: 'Invalid image index'
      });
    }

    // Remove image from array
    const updatedImages = ticket.images.filter((_, i) => i !== index);

    // Update ticket
    await prisma.ticket.update({
      where: { id },
      data: { images: updatedImages }
    });

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add images to ticket
// @route   POST /api/tickets/:id/images
exports.addImages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id }
    });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if adding images would exceed limit
    const newImagesCount = req.files ? req.files.length : 0;
    const totalImages = ticket.images.length + newImagesCount;

    if (totalImages > 8) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${newImagesCount} images. Maximum 8 images allowed. Current: ${ticket.images.length}`
      });
    }

    // Add new images
    let newImages = [];
    if (req.files && req.files.length > 0) {
      newImages = req.files.map(file => `/uploads/${file.filename}`);
    }

    const updatedImages = [...ticket.images, ...newImages];

    // Update ticket
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: { images: updatedImages }
    });

    res.json({
      success: true,
      message: 'Images added successfully',
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
};
