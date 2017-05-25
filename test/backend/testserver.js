module.exports = function () {
    require('dotenv').config({path: 'config/test.env'});
    const winston = require('winston');
    const loglevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug')
    require('./../../src/config/logging.js')(loglevel);
    const appLogger = winston.loggers.get('app');
    var express = require('express');
    var app = express();
    var mongoose = require('mongoose');
    var bodyParser = require('body-parser');

    var sendgrid = require('sendgrid')(process.env.SENDGRID_USERNAME, process.env.SENDGRID_PASSWORD);
    sendgrid.send = function (mail, cb) {
        appLogger.verbose('Mail sent.', mail);
        return cb();
    };

    if (!mongoose.models.Veranstaltung) {
        require('./../../src/models/Veranstaltungen');
    }
    if (!mongoose.models.Spiel) {
        require('./../../src/models/Spiele');
    }
    if (!mongoose.models.Gruppe) {
        require('./../../src/models/Gruppen');
    }
    if (!mongoose.models.Jugend) {
        require('./../../src/models/Jugenden');
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
    var users = require('../../src/routes/users')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLE_EMAILS, process.env.SECRET);
    var email = require('../../src/routes/email')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLE_EMAILS);
    var config = require('../../src/routes/config')(process.env);
    var gruppen = require('../../src/routes/gruppen')();
    var jugenden = require('../../src/routes/jugenden')();
    var spiele = require('../../src/routes/spiele')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLE_EMAILS);
    var spielplan = require('../../src/routes/spielplan')();
    var teams = require('../../src/routes/teams')();
    var ansprechpartner = require('../../src/routes/ansprechpartner')();
    var notfound = require('../../src/routes/notfound')();

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: true}));

    var homepath = __dirname.substring(0, __dirname.length - 'test/backend/'.length);
    app.set('views', homepath + '/src/views');
    app.set('view engine', 'ejs');

    require('../../src/routes/middleware/authorization.js')(app, process.env.SECRET);
    require('../../src/routes/middleware/badRequestHandler.js')(app);
    require('../../src/routes/middleware/beachEvent.js')(app);

    app.use('/api/users', users);
    app.use('/api/email', email);
    app.use('/api/gruppen', gruppen);
    app.use('/api/config', config);
    app.use('/api/turniere', jugenden);
    app.use('/api/spiele', spiele);
    app.use('/api/spielplan', spielplan);
    app.use('/api/teams', teams);
    app.use('/api/ansprechpartner', ansprechpartner);
    app.use(/\/api\/.*/, notfound);
    app.use(/\/.*/, routes);

    var databaseSetup = require('./database-setup/database-setup')(process.env.MONGODB_URI);

    app.connectDB = databaseSetup.connect;
    app.disconnectDB = databaseSetup.disconnect;

    app.adminToken = function () {
        return databaseSetup.getTokens().Admin;
    };
    app.bearbeiterToken = function () {
        return databaseSetup.getTokens().Bearbeiter;
    };
    app.eventID = databaseSetup.getEventID().toString();
    app.IDs = databaseSetup.getIDs();

    return app;
};

