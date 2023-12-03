const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// routes are not prefixed

router.get('/register',
  userController.registerForm
)

router.post('/register', 
  userController.validateRegisterChain,
  userController.checkValidationErrors,
  userController.registerUser,
);

router.get('/login',
  userController.loginForm
)

module.exports = router;