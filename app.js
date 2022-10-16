const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
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

// view engine setup
app.set('views', path.join(__dirname, 'views')); // this is the folder where we keep our pug files
app.set('view engine', 'pug'); // we use the engine pug, mustache or EJS work great too

// Takes the raw requests and turns them into usable properties on req.body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// After allllll that above middleware, we finally handle our own routes!
app.use('/', routes);

// done! we export it so we can start the site in start.js
module.exports = app;