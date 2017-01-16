var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var passport = require('passport');

var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);

var secret = (process.env.SECRET || 'TSV_SECRET');
var app = express();

require('./models/Gruppen');
require('./models/Jugenden');
require('./models/Spiele');
require('./models/Spielplan');
require('./models/Teams');
require('./models/Subscriber');
require('./models/Users')(secret);
require('./config/passport');

app.set('ENVIRONMENT', (process.env.NODE_ENV || 'development'));
if (app.get('ENVIRONMENT') === 'development') {
    app.set('MONGODB_URI', (process.env.MONGODB_URI || 'mongodb://localhost/spielplan'));
} else {
    app.set('MONGODB_URI', process.env.MONGODB_URI);
}

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

app.set('port', (process.env.PORT || 8000));

app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

//Setup API Authorization
require('./routes/middleware/authorization.js')(app, secret);

//Setup BadRequest Handler
require('./routes/middleware/badRequestHandler.js')(app);

//Setup Routes
require('./routes/routes.js')(app, sendgrid, secret);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
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