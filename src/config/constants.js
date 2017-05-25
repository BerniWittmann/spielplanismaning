const moment = require('moment');

module.exports = {
    GRUPPEN_TYPES: ['normal', 'zwischenrunde'],
    BEACH_EVENT_HEADER_NAME: 'BEACH-EVENT-ID',
    EVENT_REQUIRED_ROUTES: ['/api/gruppen', '/api/turniere', '/api/teams', '/api/spiele', '/api/spielplan', '/api/config', '/api/email'],
    EVENT_EXCLUDED_ROUTES: ['/api/config', '/api/email/bug'],
    SPIELPLAN_DEFAULTS: {
        startzeit: '09:00',
        spielzeit: 8,
        pausenzeit: 2,
        endzeit: '16:00',
        startdatum: moment().add(7, 'd').format('DD.MM.YYYY'),
        enddatum: moment().add(7, 'd').format('DD.MM.YYYY')
    }
};