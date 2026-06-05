const prisma = require('../config/database');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
exports.getDashboardStats = async (req, res, next) => {
  try {
    const { startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    // No role-based filtering needed anymore (no EMPLOYEE role)
    let ticketFilter = { ...dateFilter };

    const [
      totalTickets,
      ticketsByStatus,
      ticketsByPaymentStatus,
      totalRevenue,
      recentTickets
    ] = await Promise.all([
      // Total tickets count
      prisma.ticket.count({ where: ticketFilter }),

      // Tickets by status
      prisma.ticket.groupBy({
        by: ['status'],
        where: ticketFilter,
        _count: true
      }),

      // Tickets by payment status
      prisma.ticket.groupBy({
        by: ['paymentStatus'],
        where: ticketFilter,
        _count: true
      }),

      // Total revenue (only for SUPER_ADMIN and RECEPTIONIST)
      ['SUPER_ADMIN', 'RECEPTIONIST'].includes(req.user.role)
        ? prisma.payment.aggregate({
            _sum: { amountPaid: true },
            where: {
              createdAt: dateFilter.createdAt
            }
          })
        : { _sum: { amountPaid: null } },

      // Recent tickets
      prisma.ticket.findMany({
        where: ticketFilter,
        include: {
          createdBy: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      })
    ]);

    const statusCounts = ticketsByStatus.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {});

    const paymentCounts = ticketsByPaymentStatus.reduce((acc, item) => {
      acc[item.paymentStatus] = item._count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        totalTickets,
        statusCounts,
        paymentCounts,
        totalRevenue: totalRevenue._sum.amountPaid || 0,
        recentTickets
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reports
// @route   GET /api/dashboard/reports
exports.getReports = async (req, res, next) => {
  try {
    const { type, startDate, endDate } = req.query;

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      };
    }

    let reportData = {};

    if (type === 'revenue') {
      const payments = await prisma.payment.findMany({
        where: dateFilter,
        include: {
          ticket: {
            select: {
              ticketNumber: true,
              customerName: true
            }
          }
        },
        orderBy: { paymentDate: 'desc' }
      });

      reportData = {
        payments,
        total: payments.reduce((sum, p) => sum + p.amountPaid, 0)
      };
    } else if (type === 'tickets') {
      const tickets = await prisma.ticket.findMany({
        where: dateFilter,
        include: {
          createdBy: { select: { name: true } },
          diagnosis: true,
          payment: true
        },
        orderBy: { createdAt: 'desc' }
      });

      reportData = { tickets };
    }

    res.json({
      success: true,
      data: reportData
    });
  } catch (error) {
    next(error);
  }
};
