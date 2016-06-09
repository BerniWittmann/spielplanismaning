var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

app.set('env', 'development');
app.set('MONGODB_URI', process.env.MONGODB_URI);

var mongoose = require('mongoose');
var passport = require('passport');

// connect MongoDB
mongoose.connect(app.get('MONGODB_URI'), function (err, db) {
	if (!err) {
		console.log('Connected to mLab');
	} else {
		console.log(err); //failed to connect
	}
});

require('./models/Gruppen');
require('./models/Jugenden');
require('./models/Spiele');
require('./models/Spielplan');
require('./models/Teams');
//require('./models/Users');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');

var UserSchema = new mongoose.Schema({
	username: {
		type: String
		, lowercase: true
		, unique: true
	}
	, hash: String
	, salt: String
});

console.log('######' + process.env.SECRET + '####');
UserSchema.methods.generateJWT = function () {

	// set expiration to 60 days
	var today = new Date();
	var exp = new Date(today);
	exp.setDate(today.getDate() + 60);

	return jwt.sign({
		_id: this._id
		, username: this.username
		, exp: parseInt(exp.getTime() / 1000)
	, }, 'SECRET');
};

UserSchema.methods.setPassword = function (password) {
	this.salt = crypto.randomBytes(16).toString('hex');

	this.hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');
};

UserSchema.methods.validPassword = function (password) {
	var hash = crypto.pbkdf2Sync(password, this.salt, 1000, 64).toString('hex');

	return this.hash === hash;
};

mongoose.model('User', UserSchema);
require('./config/passport');

var routes = require('./routes/index');
var users = require('./routes/users');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(favicon(__dirname + '/public/assets/img/hoelle_sued_logo_klein.png'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
	extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());

app.use('/', routes);
app.use('/users', users);


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
if (app.get('env') === 'development') {
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