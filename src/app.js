require('dotenv').config({path: 'config/.env'});
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet')

const Raven = require('raven');
const version = require('../package.json').version;
if (process.env.NODE_ENV === 'production') {
    Raven.config(process.env.SENTRY_URL, {
        release: version,
        environment: process.env.NODE_ENV
    }).install();
}

const winston = require('winston');
const expressWinston = require('express-winston');
const loglevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
require('./config/logging.js')(loglevel);
const appLogger = winston.loggers.get('app');

function handleException(err) {
    appLogger.error(err);
    if (process.env.NODE_ENV === 'production') {
        Raven.captureException(err);
    }
    throw err;
}

process.on('uncaughtException', handleException);
process.on('unhandledRejection', handleException);

appLogger.info('Current Version: %s', version);
appLogger.info('Log Level: %s', loglevel.toUpperCase());
appLogger.info('App is running in %s Mode', process.env.NODE_ENV.toUpperCase());

const sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

const secret = process.env.SECRET;
const app = express();

app.use(helmet());

require('./models/Veranstaltungen');
require('./models/Spiele');
require('./models/Gruppen');
require('./models/Jugenden');
require('./models/Spielplan');
require('./models/Teams');
require('./models/Subscriber');
require('./models/Users')(secret);
require('./models/Ansprechpartner');
require('./config/passport');

app.set('ENVIRONMENT', process.env.NODE_ENV);
app.set('MONGODB_URI', process.env.MONGODB_URI);
app.set('port', (process.env.PORT || 8000));

// connect MongoDB
mongoose.connect(app.get('MONGODB_URI'), function (err) {
    if (!err) {
        appLogger.info('Connected to Database on %s', app.get('MONGODB_URI'));
    } else {
        appLogger.error(err); //failed to connect
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'production') {
    app.use(Raven.requestHandler());
}

app.use(expressWinston.logger({
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    meta: false,
    expressFormat: true,
    colorize: true,
    level: 'info',
    statusLevels: true
}));
app.use(bodyParser.json({limit: '20mb'}));
//noinspection JSUnresolvedFunction
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(mongoSanitize({
    replaceWith: '_'
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//noinspection JSUnresolvedFunction
app.use(passport.initialize());
//noinspection JSCheckFunctionSignatures
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

app.listen(app.get('port'), function () {
    appLogger.info('Server is listening on port %d', app.get('port'));
});

require('./config/setup-db.js')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLEEMAIL);

app.use(require('./routes/middleware/allowCrossDomain.js'));

//Setup API Authorization
require('./routes/middleware/authorization.js')(app, secret);

//Setup BadRequest Handler
require('./routes/middleware/badRequestHandler.js')(app);

require('./routes/middleware/beachEvent.js')(app);

//Setup Routes
require('./routes/routes.js')(app, sendgrid, secret);

if (process.env.NODE_ENV === 'production') {
    app.use(Raven.errorHandler());
}

app.use(expressWinston.errorLogger({
    transports: [
        new winston.transports.Console({
            json: false,
            colorize: true
        })
    ],
    baseMeta: {test: 'val', foo: 'bar'},
    level: 'error',
    msg: '{{req.method}} {{req.path}} {{res.statusCode}}: {{err.message}} \n',
    metaField: 'error'
}));

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    appLogger.error('Error 404 Not Found', {error: err});
    next(err);
});

// error handlers
app.use(function (err, req, res) {
    appLogger.error('Error ' + err.status || 500 + ' ' + err.name, {error: err});
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        err: err
    });
});

module.exports = app;