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
  body('first-name', 'First name must be between 2 and 35 characters!')
    .trim()  
    .escape()
    .isLength({min: 2, max: 35}),
  body('last-name')
    .trim()  
    .escape()
    .optional(),
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
    }),
  body('password-confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    })
];

exports.checkValidationErrors = (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    req.flash('error', validationErrors.errors.map(err => err.msg));
    // must pass in flashes manually here because they are being added all on one request... or something

    const route = req.originalUrl.split('/')[1];
    const capitalized = route.charAt(0).toUpperCase() + route.slice(1);
    res.render(route, { title: capitalized, body: req.body, flashes: req.flash() });
    return;
  }

  next();
}



