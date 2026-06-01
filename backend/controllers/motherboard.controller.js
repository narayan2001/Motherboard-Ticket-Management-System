const prisma = require('../config/database');

// @desc    Get all motherboard types
// @route   GET /api/motherboards
exports.getAllMotherboards = async (req, res, next) => {
  try {
    const { isActive } = req.query;

    const where = {};
    if (isActive !== undefined) where.isActive = isActive === 'true';

    const motherboards = await prisma.motherboardType.findMany({
      where,
      orderBy: [{ brandName: 'asc' }, { modelSeries: 'asc' }]
    });

    res.json({
      success: true,
      data: motherboards
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create motherboard type
// @route   POST /api/motherboards
exports.createMotherboard = async (req, res, next) => {
  try {
    const { brandName, modelSeries, category } = req.body;

    const motherboard = await prisma.motherboardType.create({
      data: {
        brandName,
        modelSeries,
        category
      }
    });

    res.status(201).json({
      success: true,
      message: 'Motherboard type created successfully',
      data: motherboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update motherboard type
// @route   PUT /api/motherboards/:id
exports.updateMotherboard = async (req, res, next) => {
  try {
    const { brandName, modelSeries, category, isActive } = req.body;

    const motherboard = await prisma.motherboardType.update({
      where: { id: req.params.id },
      data: {
        brandName,
        modelSeries,
        category,
        isActive
      }
    });

    res.json({
      success: true,
      message: 'Motherboard type updated successfully',
      data: motherboard
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete motherboard type
// @route   DELETE /api/motherboards/:id
exports.deleteMotherboard = async (req, res, next) => {
  try {
    await prisma.motherboardType.delete({
      where: { id: req.params.id }
    });

    res.json({
      success: true,
      message: 'Motherboard type deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};
