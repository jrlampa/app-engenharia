const express = require('express');
const router = express.Router();
const { listClients, createClient, getClientStats } = require('../controllers/clientController');

router.get('/', listClients);
router.post('/', createClient);
router.get('/:id/stats', getClientStats);

module.exports = router;
