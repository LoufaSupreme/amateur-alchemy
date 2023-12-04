const mongoose = require('mongoose');
const User = mongoose.model('User');
const { body, validationResult } = require('express-validator');

// show the login form page
exports.loginForm = (req, res) => {
  console.log("Running loginForm");
  res.render('login', { title: 'Login' });
}

// show the register form page
exports.registerForm = (req, res) => {
  console.log("Running registerForm");
  res.render('register', { title: 'Register' });
}

// an array of functions from express-validator that validates form data
// the array should be inluded as a middleware function in the index file
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
  body('password', 'Password must be at least 6 characters long and contain a lowercase letter, uppercase letter, and a number.')
    .isStrongPassword({
      minLength: 6,
      minLowercase: 1, 
      minUppercase: 1,
      minNumbers: 1, 
      minSymbols: 0,
    }),
  body('password-confirm')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords must match!");
      }
      return true;
    })
];

// checks if express-validator added any validation errors to 
// the req and then renders a flash msg if so
exports.checkValidationErrors = (req, res, next) => {
  console.log("Running checkValidationErrors");
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

// register a new user
exports.registerUser = async (req, res, next) => {
  console.log(`Running registerUser for ${req.body.email}`);
  // create a new user
  const user = new User({ email: req.body.email, name: req.body.name });

  // the "passportLocalMongoose" plugin in the User schema exposes a "register" method
  await User.register(user, req.body.password)

  next();
}


