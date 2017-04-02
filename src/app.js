require('dotenv').config({path: 'config/.env'});
const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const Raven = require('raven');
const version = require('../package.json').version;
if (process.env.NODE_ENV === 'production') {
    Raven.config(process.env.SENTRY_URL, {
        release: version,
        environment: process.env.NODE_ENV
    }).install();
}

const sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

const secret = process.env.SECRET;
const app = express();

require('./models/Gruppen');
require('./models/Jugenden');
require('./models/Spiele');
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
        console.log('Connected to Database on ' + app.get('MONGODB_URI'));
    } else {
        console.log(err); //failed to connect
    }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

if (process.env.NODE_ENV === 'production') {
    app.use(Raven.requestHandler());
}

app.use(logger('dev'));
app.use(bodyParser.json());
//noinspection JSUnresolvedFunction
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
//noinspection JSUnresolvedFunction
app.use(passport.initialize());
//noinspection JSCheckFunctionSignatures
app.use(favicon(path.join(__dirname, '/public/favicon.ico')));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

//Setup API Authorization
require('./routes/middleware/authorization.js')(app, secret);

//Setup BadRequest Handler
require('./routes/middleware/badRequestHandler.js')(app);

//Setup Routes
require('./routes/routes.js')(app, sendgrid, secret);

if (process.env.NODE_ENV === 'production') {
    app.use(Raven.errorHandler());
}

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    const err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('ENVIRONMENT') === 'development') {
    app.use(function (err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message
            , error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message
        , error: {}
    });
});

module.exports = app;