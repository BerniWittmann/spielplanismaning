(function () {
    'use strict';

    angular
        .module('spi.constants', [])
        .constant('LOG_PREFIX', 'Spielplan-Ismaning')
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
        .constant('AUTH_TOKEN_NAME', 'token')
        .constant('EMAIL_SUBSCRIPTION_TOKEN_NAME', 'subscriptions')
        .constant('BUG_REPORT_EMAIL', 'bugreport9+qupxrjhtl7lupgbiaeo8@boards.trello.com')
        .constant('ANZAHL_PLAETZE', 3)
        .constant('ENDPOINT_BASE', '/api')
        .constant('CURRENT_EVENT_TOKEN_NAME', 'currentEvent')
        .constant('AVAILABLE_STATES_WITHOUT_EVENT', ['spi.verwaltung.allgemein', 'spi.login', 'spi.account', 'spi.kontakt', 'spi.login', 'spi.password-forgot', 'spi.password-reset', 'spi.team-deabonnieren', 'spi.verwaltung.ansprechpartner', 'spi.verwaltung.veranstaltungen']);
})();