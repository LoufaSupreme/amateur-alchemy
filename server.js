const express = require('express');
const path = require('path');
const mongoose = require('mongoose');

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
// require('./models/User');
// require('./models/Review');

// const cookieParser = require('cookie-parser');
// const session = require('express-session');
// const MongoStore = require('connect-mongo');
// const passport = require('passport');
// const promisify = require('es6-promisify');
// const flash = require('connect-flash');
// const expressValidator = require('express-validator');

const routes = require('./routes/index');
// const helpers = require('./helpers');
// const errorHandlers = require('./handlers/errorHandlers');

const app = express();

// serves up static files from the public folder. Anything in public/ will just be served up as the file it is
app.use(express.static(path.join(__dirname, 'public')));
// app.use('/public', express.static('public'))

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);

// Start our app!
app.set('port', process.env.PORT || 7778);
const server = app.listen(app.get('port'), () => {
  console.log(`Express running → PORT ${server.address().port}`);
});
