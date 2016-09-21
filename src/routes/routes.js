module.exports = function (app, sendgrid) {
    var routes = require('./index.js')();
    var users = require('./users.js')();
    var email = require('./email.js')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'));
    var config = require('./config.js')(process.env);
    var teams = require('./teams.js')();
    var gruppen = require('./gruppen.js')();
    var jugenden = require('./jugenden.js')();
    var spiele = require('./spiele.js')(sendgrid, (process.env.ENVIRONMENT || 'DEV'), (process.env.URL || 'http://localhost:8000/'), (process.env.DISABLEEMAIL || 'false'));
    var spielplan = require('./spielplan.js')();

    var API_PREFIX = '/api';
    app.use(API_PREFIX + '/users', users);
    app.use(API_PREFIX + '/email', email);
    app.use(API_PREFIX + '/config', config);
    app.use(API_PREFIX + '/teams', teams);
    app.use(API_PREFIX + '/gruppen', gruppen);
    app.use(API_PREFIX + '/jugenden', jugenden);
    app.use(API_PREFIX + '/spiele', spiele);
    app.use(API_PREFIX + '/spielplan', spielplan);
    app.use(/\/.*/, routes);
};