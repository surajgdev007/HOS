const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const questController = require('../controllers/questController');
const router = express.Router();

router.use(protect);

router.get('/', questController.getQuests);
router.get('/history', questController.getQuestHistory);
router.post('/', questController.createQuest);
router.patch('/:id/accept', questController.acceptQuest);
router.patch('/:id/complete', questController.completeQuest);
router.patch('/:id/fail', questController.failQuest);
router.delete('/:id', questController.deleteQuest);

module.exports = router;
