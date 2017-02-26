module.exports = function (app, sendgrid, secret) {
    const routes = require('./index.js')();
    const users = require('./users.js')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLEEMAIL, secret);
    const email = require('./email.js')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLEEMAIL);
    const config = require('./config.js')(process.env);
    const teams = require('./teams.js')();
    const gruppen = require('./gruppen.js')();
    const jugenden = require('./jugenden.js')();
    const spiele = require('./spiele.js')(sendgrid, process.env.NODE_ENV, process.env.URL, process.env.DISABLEEMAIL);
    const spielplan = require('./spielplan.js')();
    const ansprechpartner = require('./ansprechpartner.js')();

    const API_PREFIX = '/api';
    app.use(API_PREFIX + '/users', users);
    app.use(API_PREFIX + '/email', email);
    app.use(API_PREFIX + '/config', config);
    app.use(API_PREFIX + '/teams', teams);
    app.use(API_PREFIX + '/gruppen', gruppen);
    app.use(API_PREFIX + '/jugenden', jugenden);
    app.use(API_PREFIX + '/spiele', spiele);
    app.use(API_PREFIX + '/spielplan', spielplan);
    app.use(API_PREFIX + '/ansprechpartner', ansprechpartner);
    app.use(/\/.*/, routes);
};