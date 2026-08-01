const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const terminalController = require('../controllers/terminalController');
const router = express.Router();

router.use(protect);

router.post('/command', terminalController.processCommand);
router.get('/history', terminalController.getHistory);
router.post('/generate-quests', terminalController.generateQuests);

module.exports = router;
