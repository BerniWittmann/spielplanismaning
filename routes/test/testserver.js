module.exports = function (env) {
    var express = require('express');
    var app = express();

    process.env.SECRET = process.env.SECRET || env.SECRET || 'TEST-SECRET';
    process.env.ENVIRONMENT = process.env.ENVIRONMENT || env.ENVIRONMENT || 'TEST';
    process.env.URL = process.env.URL || env.URL || 'http://localhost:8001';
    process.env.DISABLEEMAIL = process.env.DISABLEEMAIL || env.DISABLEEMAIL || 'true';
    process.env.VERSION = process.env.VERSION || env.VERSION || 'vtag';
    process.env.LOCKDOWNMODE = process.env.LOCKDOWNMODE || env.LOCKDOWNMODE || 'false';
    sendgrid = require('sendgrid')((process.env.SENDGRID_USERNAME || 'test'), (process.env.SENDGRID_PASSWORD || 'test'));
    sendgrid.send = function (mail, cb) {
        console.log('Mail sent.');
        console.log(mail);
        return cb();
    };

    require('../../models/Gruppen');
    require('../../models/Jugenden');
    require('../../models/Spiele');
    require('../../models/Spielplan');
    require('../../models/Teams');
    require('../../models/Subscriber');
    require('../../models/Users')((process.env.SECRET || 'SECRET'));
    require('../../config/passport');

    var routes = require('../index')((process.env.SECRET || 'SECRET'), sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'), (process.env.DISABLEEMAIL || 'false'));
    var users = require('../users');
    var email = require('../email')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'));
    var config = require('../config')(process.env);

    app.use('/', routes);
    app.use('/users', users);
    app.use('/email', email);
    app.use('/config', config);

    function start(done) {
        server = require('http').createServer(app);
        server.listen('8001');
        server.start = start;
        server.quit = quit;
        var port = server.address().port;
        console.log('Test server listening at port %s', port);
        return done();
    }

    function quit(done) {
        return server.close(done);
    }

    var server = {start: start, quit: quit};
    return server;
};

