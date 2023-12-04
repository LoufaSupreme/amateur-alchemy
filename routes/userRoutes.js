const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

// routes are not prefixed

router.get('/register',
  userController.registerForm
)

router.post('/register', 
  userController.validateRegisterChain,
  userController.checkValidationErrors,
  userController.registerUser,
  authController.login
);

router.get('/login',
  userController.loginForm
)

router.post('/login', authController.login);

router.get('/logout', authController.logout);

module.exports = router;