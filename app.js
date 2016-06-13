var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.set('ENVIRONMENT', (process.env.ENVIRONMENT || 'DEV'));
if (app.get('ENVIRONMENT') == 'PROD') {
	app.set('MONGODB_URI', (process.env.MONGODB_URI || 'mongodb://heroku_dfxcd8mn:c4jursvke7aml4pqp3j8f1qh5e@ds031751.mlab.com:31751/heroku_dfxcd8mn'));
} else if (app.get('ENVIRONMENT') == 'DEV') {
	app.set('MONGODB_URI', (process.env.MONGODB_URI || 'mongodb://localhost/spielplan'));
}


var mongoose = require('mongoose');
var passport = require('passport');


// connect MongoDB
mongoose.connect(app.get('MONGODB_URI'), function (err, db) {
	if (!err) {
		console.log('Connected to Database on ' + app.get('MONGODB_URI'));
	} else {
		console.log(err); //failed to connect
	}
});

var sendgrid = require('sendgrid')((process.env.SENDGRID_USERNAME || 'app51990899@heroku.com'), (process.env.SENDGRID_PASSWORD ||  'eannrw3q2784'));

require('./models/Gruppen');
require('./models/Jugenden');
require('./models/Spiele');
require('./models/Spielplan');
require('./models/Teams');
require('./models/Users')((process.env.SECRET || 'SECRET'));
require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');
var email = require('./routes/email')(sendgrid, process.env.ENVIRONMENT);
var config = require('./routes/config')(process.env);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(favicon(__dirname + '/public/favicon.ico'));

app.use('/', routes);
app.use('/users', users);
app.use('/email', email);
app.use('/config', config);



app.set('port', (process.env.PORT || 8000));

app.listen(app.get('port'), function () {
	console.log('Node app is running on port', app.get('port'));
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
	var err = new Error('Not Found');
	err.status = 404;
	next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('ENVIRONMENT') === 'DEV') {
	app.use(function (err, req, res, next) {
		res.status(err.status || 500);
		res.render('error', {
			message: err.message
			, error: err
		});
	});
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	res.render('error', {
		message: err.message
		, error: {}
	});
});




module.exports = app;