const express = require('express');
const router = express.Router();
const { getProjectTrends, getCostTrends, getTopClients, getProjectRisk } = require('../controllers/analyticsController');

router.get('/trends/projects', getProjectTrends);
router.get('/trends/costs', getCostTrends);
router.get('/top-clients', getTopClients);
router.get('/projects/:id/risk', getProjectRisk); // v0.3.8


module.exports = router;
