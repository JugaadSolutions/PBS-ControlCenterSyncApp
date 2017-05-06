var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var helmet = require('helmet');
var cors = require('cors');
var compression = require('compression');
var winston = require('winston');
var expressWinston = require('express-winston');
//var logger = require('morgan');
//var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require('config');

var ErrorHandler = require('./app/handlers/error-handler');

var app = express();

app.use(compression({}));

/*var corsOptions = {
 origin: 'http://www.mytrintrin.com',
 optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
 };*/
app.use(cors(/*corsOptions*/));
app.use(helmet());
app.use(helmet.noCache());
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'"],
    imgSrc: ["'self'"],
    connectSrc: ["'self'"],
    fontSrc: ["'self'"],
    objectSrc: ["'none'"],
    mediaSrc: ["'self'"],
    frameSrc: ["'none'"]
  }
}));
app.disable('x-powered-by');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: true }));
//app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function (req, res, next) {
  res.render('index', {title: 'PBS Admin Core'});
});

/*app.use('/', routes);
 app.use('/users', users);*/
require('./app/models');
require('./app/routes')(app);

// Middleware to log application level errors
app.use(expressWinston.errorLogger({
  transports: [
    new winston.transports.File({
      level: config.get('logging.general.level'),
      filename: config.get('logging.general.file'),
      handleExceptions: true,
      json: true,
      maxsize: 20971520, //5MB
      maxFiles: 10,
      colorize: true
    }),
    new winston.transports.Console({
      json: true,
      colorize: true
    })
  ],
  exitOnError: true
}));

app.use(function (err, req, res, next) {
  ErrorHandler.processError(err, function (status, response) {
    res.status(status).json(response);
  });
});


module.exports = app;
