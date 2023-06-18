const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
// for flash messages:
const flash = require('connect-flash');
const cookieParser = require('cookie-parser');
const session = require('express-session');

const helpers = require('./helpers/helpers.js');
const errorHandlers = require('./handlers/errorHandler');

// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

// Connect to our Database and handle any bad connections
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises
mongoose.connection.on('error', (err) => {
  console.error(`🙅 🚫 🙅 🚫 → ${err.message}`);
});

// import all of our models:
require('./models/Beer');
require('./models/Brewery');
require('./models/Article');
require('./models/TriangleTest');
// require('./models/User');
// require('./models/Review');

// const MongoStore = require('connect-mongo');
// const passport = require('passport');
// const promisify = require('es6-promisify');
// const expressValidator = require('express-validator');

const app = express();

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.resolve(__dirname, 'public')));
// app.use('/public', express.static('public'))
// app.use("public", express.static(path.resolve(__dirname + 'public')));

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// populates req.cookies with any cookies that came along with the request
// needed to use flash messages
app.use(cookieParser());

// Sessions allow us to store data on visitors from request to request
// This keeps users logged in and allows us to send flash messages
app.use(session({
  secret: process.env.SECRET,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  // store: new MongoStore({ mongoUrl: process.env.DATABASE })
}));

// The flash middleware let's us use req.flash('error', 'Shit!'), which will then pass that message to the next page the user requests
app.use(flash());

// pass variables to our templates + all requests
// passes helpful things like that User object, the custom helper functions, etc to every template
app.use((req, res, next) => {
  res.locals.h = helpers;
  res.locals.flashes = req.flash();
  res.locals.user = req.user || null;  // the passport library makes a user variable accessible on req automatically
  res.locals.currentPath = req.path;
  next();
});

// routes:
// has to be after requiring the models:
const indexRoutes = require('./routes/index');  
const articleRoutes = require('./routes/articleRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const breweryRoutes = require('./routes/breweryRoutes');

app.use('/', indexRoutes);
app.use('/articles', articleRoutes);
app.use('/reviews', reviewRoutes);
app.use('/breweries', breweryRoutes);

// If that above routes didnt work, we 404 them and forward to error handler
app.use(errorHandlers.notFound);

// One of our error handlers will see if these errors are just validation errors
app.use(errorHandlers.flashValidationErrors);

// Otherwise this was a really bad error we didn't expect! Shoot eh
if (app.get('env') === 'development') {
  /* Development Error Handler - Prints stack trace */
  app.use(errorHandlers.developmentErrors);
}

// production error handler
app.use(errorHandlers.productionErrors);

// Start our app!
app.set('port', process.env.PORT || 7778);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
