module.exports = function(loglevel) {
    const winston = require('winston');
    
    const createCategory = function(name, label) {
        winston.loggers.add(name, {
            console: {
                level: loglevel || 'info',
                colorize: true,
                label: label
            }
        });
    };

    createCategory('app', 'Spielplan Ismaning: Base');
    
    createCategory('api', 'Spielplan Ismaning: API');
    createCategory('apiAnsprechpartner', 'Spielplan Ismaning: API - Ansprechpartner');
    createCategory('apiConfig', 'Spielplan Ismaning: API - Config');
    createCategory('apiEmail', 'Spielplan Ismaning: API - Email');
    createCategory('apiGruppen', 'Spielplan Ismaning: API - Gruppen');
    createCategory('apiJugenden', 'Spielplan Ismaning: API - Jugenden');
    createCategory('apiSpiele', 'Spielplan Ismaning: API - Spiele');
    createCategory('apiSpielplan', 'Spielplan Ismaning: API - Spielplan');
    createCategory('apiUsers', 'Spielplan Ismaning: API - Users');
    createCategory('apiHelper', 'Spielplan Ismaning: API - Helper');
    createCategory('apiVeranstaltungen', 'Spielplan Ismaning: API - Veranstaltungen');

    createCategory('middlewareAuthorization', 'Spielplan Ismaning: Middleware - Authorization');
    createCategory('middlewareBadRequest', 'Spielplan Ismaning: Middleware - Request');
    createCategory('middlewareEvent', 'Spielplan Ismaning: Middleware - EventCheck');

    createCategory('dbSetup', 'Spielplan Ismaning: Database Setup');

    createCategory('mailGenerator', 'Spielplan Ismaning: Mail-Generator');
    createCategory('spielplanGenerator', 'Spielplan Ismaning: Spielplan-Generator');

    createCategory('model', 'Spielplan Ismaning: Models');
};