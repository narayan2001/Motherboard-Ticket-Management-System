const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seed.controller');

router.post('/seed', seedController.seedDatabase);

module.exports = router;
