module.exports = function (env) {
    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');

    process.env.SECRET = env.SECRET || process.env.SECRET || 'TEST-SECRET';
    process.env.NODE_ENV = env.NODE_ENV || process.env.NODE_ENV || 'development';
    process.env.URL = env.URL || process.env.URL || 'http://localhost:8001';
    process.env.DISABLEEMAIL = env.DISABLEEMAIL || process.env.DISABLEEMAIL || 'true';
    process.env.VERSION = env.VERSION || process.env.VERSION || 'vtag';
    process.env.LOCKDOWNMODE = env.LOCKDOWNMODE || process.env.LOCKDOWNMODE || 'false';
    process.env.DISABLE_EMAILS = process.env.DISABLE_EMAILS || 'true';
    process.env.MONGO_DB_URI = env.MONGO_DB_URI || process.env.MONGO_DB_URI || 'mongodb://localhost/spielplan-test';

    sendgrid = require('sendgrid')((process.env.SENDGRID_USERNAME || 'test'), (process.env.SENDGRID_PASSWORD || 'test'));
    sendgrid.send = function (mail, cb) {
        console.log('Mail sent.');
        console.log(mail);
        return cb();
    };

    if (!mongoose.models.Gruppe) {
        require('./../../src/models/Gruppen');
    }
    if (!mongoose.models.Jugend) {
        require('./../../src/models/Jugenden');
    }
    if (!mongoose.models.Spiel) {
        require('./../../src/models/Spiele');
    }
    if (!mongoose.models.Spielplan) {
        require('./../../src/models/Spielplan');
    }
    if (!mongoose.models.Team) {
        require('./../../src/models/Teams');
    }
    if (!mongoose.models.Subscriber) {
        require('./../../src/models/Subscriber');
    }
    if (!mongoose.models.User) {
        require('./../../src/models/Users')(process.env.SECRET);
    }
    if (!mongoose.models.Ansprechpartner) {
        require('./../../src/models/Ansprechpartner');
    }
    require('../../src/config/passport');

    var routes = require('../../src/routes/index')();
    var users = require('../../src/routes/users')(sendgrid, (process.env.NODE_ENV || 'development'), (process.env.URL || 'http://localhost:8000/'), process.env.DISABLE_EMAILS, process.env.SECRET);
    var email = require('../../src/routes/email')(sendgrid, (process.env.NODE_ENV || 'development'), (process.env.URL || 'http://localhost:8000/'), process.env.DISABLE_EMAILS);
    var config = require('../../src/routes/config')(process.env);
    var gruppen = require('../../src/routes/gruppen')();
    var jugenden = require('../../src/routes/jugenden')();
    var spiele = require('../../src/routes/spiele')(sendgrid, (process.env.NODE_ENV || 'development'), (process.env.URL || 'http://localhost:8000/'), process.env.DISABLE_EMAILS);
    var spielplan = require('../../src/routes/spielplan')();
    var teams = require('../../src/routes/teams')();
    var ansprechpartner = require('../../src/routes/ansprechpartner')();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    var homepath = __dirname.substring(0, __dirname.length - 'test/backend/'.length);
    app.set('views', homepath + '/src/views');
    app.set('view engine', 'ejs');

    require('../../src/routes/middleware/authorization.js')(app, process.env.SECRET);
    require('../../src/routes/middleware/badRequestHandler.js')(app);

    app.use('/api/users', users);
    app.use('/api/email', email);
    app.use('/api/gruppen', gruppen);
    app.use('/api/config', config);
    app.use('/api/jugenden', jugenden);
    app.use('/api/spiele', spiele);
    app.use('/api/spielplan', spielplan);
    app.use('/api/teams', teams);
    app.use('/api/ansprechpartner', ansprechpartner);
    app.use(/\/.*/, routes);

    var databaseSetup = require('./database-setup/database-setup')(process.env.MONGO_DB_URI);

    app.connectDB = databaseSetup.connect;
    app.disconnectDB = databaseSetup.disconnect;

    app.adminToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1NzcyZjZlNTYyMTVmNmIwM2NhYmY3ZTIiLCJ1c2VybmFtZSI6ImJlcm5pIiwicm9sZSI6eyJyYW5rIjoxLCJuYW1lIjoiQWRtaW4ifSwiZXhwIjoxNDg4NTMyNzY5LCJpYXQiOjE0ODMzNDg3Njl9.wKVynI6UdrerA5HJIjUquk2gVSsoNp3kcJKRNaq4YuY';
    app.bearbeiterToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1ODZhMWIzZjU0YzI2MGJlOTE4ZTliYTgiLCJ1c2VybmFtZSI6InRlc3QtdXNlciIsInJvbGUiOnsicmFuayI6MCwibmFtZSI6IkJlYXJiZWl0ZXIifSwiZXhwIjoxNDg4NTMyNzk5LCJpYXQiOjE0ODMzNDg3OTl9.z8NKmUon1DXz8TCLBM2QW8vTpkddC2i4mXUKK1FAK6c';

    return app;
};

