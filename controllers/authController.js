const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Something went wrong - Failed Login',
  successRedirect: '/',
  successFlash: 'You have been successfully logged in'
})

exports.logout = (req, res) => {
  console.log(`Logging out ${req.user.email}`);
  req.logout((err) => {
    if (err) return next(err);
    req.flash('success', 'You have successfully logged out!');
    res.redirect('/');
  });
}