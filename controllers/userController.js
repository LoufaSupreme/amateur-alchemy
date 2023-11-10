const mongoose = require('mongoose');
const User = mongoose.model('User');
// const promisify = require('es6-promisify');
const { body, validationResult } = require('express-validator');

exports.loginForm = (req, res) => {
  res.render('login', { title: 'Login' });
}

exports.registerForm = (req, res) => {
  res.render('register', { title: 'Register' });
}

exports.validateRegisterChain = [
  body('name', 'Name must be between 2 and 35 characters!')
    .trim()  
    .escape()
    .isLength({min: 2, max: 35}),
  body('email', 'That email is not valid!')
    .trim()
    .escape()
    .normalizeEmail({
      remove_dots: false,
      remove_extension: false,
      gmail_remove_sebaddress: false
    })
    .isEmail(),
  body('password', 'Password must be atleast 6 characters long and contain a lowercase letter uppercase letter, number and symbol.')
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1, 
      minUppercase: 1,
      minNumbers: 1, 
      minSymbols: 1
    }),
  body('password-confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    })
];

// methods are from express-validator
exports.checkValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.errors.map(err => err.msg));
    console.log(validationErrors)
    // must pass in flashes manually here because they are being added all on one request... or something
    res.render(req.originalUrl.split('/')[1], { body: req.body, flashes: req.flash() });
    return;
  }

  next();
}



