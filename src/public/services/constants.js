(function () {
    'use strict';

    angular
        .module('spi.constants', [])
        .constant('LOG_PREFIX', 'Spielplan-Ismaning Log: ')
        .constant('LOG_MAX_STRING_LENGTH', 70)
        .constant('JUGEND_FARBEN', [
            {
                name: 'Grün',
                wert: 'gruen'
            }, {
                name: 'Gelb',
                wert: 'gelb'
            }, {
                name: 'Rot',
                wert: 'rot'
            }, {
                name: 'Blau',
                wert: 'blau'
            }, {
                name: 'Orange',
                wert: 'orange'
            }, {
                name: 'Lila',
                wert: 'lila'
            }, {
                name: 'Hellblau',
                wert: 'hellblau'
            }, {
                name: 'Hellgrün',
                wert: 'hellgruen'
            }, {
                name: 'Hellrot',
                wert: 'hellrot'
            }
        ])
        .constant('AUTH_TOKEN_NAME', 'spielplan-ismaning-token')
        .constant('EMAIL_SUBSCRIPTION_TOKEN_NAME', 'spielplan-ismaning-subscriptions')
        .constant('BUG_REPORT_EMAIL', 'bugreport4+autbfctbcdterjvy8o2t@boards.trello.com');
})();