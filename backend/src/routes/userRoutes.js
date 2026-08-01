const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const userController = require('../controllers/userController');
const router = express.Router();

router.use(protect);

router.get('/dashboard', userController.getDashboard);
router.get('/profile', userController.getProfile);
router.patch('/profile', userController.updateProfile);
router.patch('/change-password', userController.changePassword);
router.get('/history', userController.getHistory);
router.get('/export', userController.exportData);

module.exports = router;
