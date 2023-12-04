// configure passport
const passport = require('passport');
const User = require('../models/User');

passport.use(User.createStrategy()); // can do this b/c we included the passportLocalMongoose plugin in User.JS

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());