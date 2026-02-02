const ClientService = require('../services/ClientService');
const asyncHandler = require('../utils/asyncHandler');

/**
 * GET /api/clients
 */
const listClients = asyncHandler(async (req, res) => {
  const clients = await ClientService.listClients();
  res.json({ sucesso: true, clients });
});

/**
 * POST /api/clients
 */
const createClient = asyncHandler(async (req, res) => {
  const newClient = await ClientService.createClient(req.body);
  res.json({ sucesso: true, client: newClient });
});

/**
 * GET /api/clients/:id/stats
 */
const getClientStats = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const stats = await ClientService.getClientStats(parseInt(id));
  res.json({ sucesso: true, stats });
});

module.exports = { listClients, createClient, getClientStats };
