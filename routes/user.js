const express = require('express');
const userController = require('../controllers/user');
const router = express.Router();
const { verify, verifyAdmin } = require('../auth');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.get('/details', verify, userController.getProfile);
router.patch('/:id/set-as-admin', verify,verifyAdmin, userController.updateUserToAdmin);
router.patch('/update-password', verify, userController.updatePassword);

module.exports = router;
