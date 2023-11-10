const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register', 
  userController.validateRegister,
  userController.registerForm,
);

router.get('/login',
  userController.loginForm
)

module.exports = router;