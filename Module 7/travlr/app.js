require('./app_api/config/environment');
const passport = require('passport');
require('./app_api/config/passport');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var handlebars = require('hbs');

var indexRouter = require('./app_server/routes/index');
var usersRouter = require('./app_server/routes/users');
var travelRouter = require('./app_server/routes/travel');
var apiRouter = require('./app_api/routes/index');
const { connect } = require('./app_api/models/db');
connect().catch((err) => console.error('Database startup failed:', err));

var app = express();
const customerSession = require('./app_server/middleware/customer-session');

// view engine setup
app.set('views', path.join(__dirname, 'app_server', 'views'));
handlebars.registerPartials(__dirname + '/app_server/views/partials');
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json({ limit: '32kb' }));
app.use(passport.initialize());
app.disable('x-powered-by');
app.use(function(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  next();
});
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.get('/travel.html', function(req, res) { res.redirect('/travel'); });

app.get('/news.html', (req,res) => res.redirect('/news'));
app.get('/index.html', (req,res) => res.redirect('/'));
app.get('/admin', (req,res) => res.redirect(process.env.ADMIN_URL || 'http://localhost:4200'));
app.use((req,res,next) => {
  if(/^\/(account|checkout|reservations)(\/|$)/.test(req.path)) return require('./app_server/routes/customer')(req,res,next);
  next();
});
app.use((req,res,next) => {
  if(req.path==='/' || req.path==='/news' || req.path.startsWith('/travel')) return customerSession.session(req,res,next);
  next();
});
app.use(express.static(path.join(__dirname, 'public'), { index:false }));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/travel', travelRouter);
// Allow the Angular development app to access the API.
app.use('/api', function(req, res, next) {
  const allowedOrigins = ['http://localhost:4200', 'http://127.0.0.1:4200'];
  if (allowedOrigins.includes(req.headers.origin)) {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.vary('Origin');
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  if (req.path.startsWith('/api/')) {
    const status = err.status || 500;
    return res.status(status).json({ message: status >= 500 ? 'The server could not complete the request.' : (status === 400 ? 'Invalid request body.' : err.message) });
  }
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
