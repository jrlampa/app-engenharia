const express = require('express');
const router = express.Router();
const { getProjectTrends, getCostTrends, getTopClients } = require('../controllers/analyticsController');

router.get('/trends/projects', getProjectTrends);
router.get('/trends/costs', getCostTrends);
router.get('/top-clients', getTopClients);

module.exports = router;
