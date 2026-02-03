const express = require('express');
const router = express.Router();
const { getConfig, updateConfig, getUITokens } = require('../controllers/configController');

router.get('/', getConfig);
router.put('/', updateConfig);
router.get('/ui-tokens', getUITokens); // v0.3.8


module.exports = router;
