const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Something went wrong - Failed Login',
  successRedirect: '/',
  successFlash: 'You have been successfully logged in'
})

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You have successfully logged out!');
  res.redirect('/');
}