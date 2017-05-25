const _ = require('lodash');

module.exports = function () {
    const logger = require('winston').loggers.get('api');
    function send(obj, res) {
        let level = 'warn';
        if (obj.STATUSCODE < 400) {
            level = 'verbose';
        } else if (obj.STATUSCODE < 500) {
            level = 'warn';
        } else {
            level = 'error';
        }
        logger.log(level, 'Message: %d %s \n', obj.STATUSCODE, obj.MESSAGE, obj);
        if (!res || _.isEmpty(res)) {
            logger.error('Undefined Response, while sending Message.');
            return;
        }
        return res.status(obj.STATUSCODE).json(obj);
    }

    return {
        Success: function (res) {
            send(require('./SuccessMessage.js'), res);
        },
        Deleted: function (res) {
            send(require('./DeleteMessage.js'), res);
        },
        Error: function (res, err) {
            send(require('./ErrorMessage.js')(err), res);
        },
        ErrorGruppeNotFound: function (res, err) {
            send(require('./ErrorGruppeNotFoundMessage.js')(err), res);
        },
        ErrorMaxZahlGruppe: function (res) {
            send(require('./ErrorMaxZahlGruppe.js'), res);
        },
        SpielplanErstellt: function (res) {
            send(require('./SpielplanErstelltMessage.js'), res);
        },
        Reset: function (res) {
            send(require('./ResetMessage.js'), res);
        },
        ErrorFehlendeFelder: function (res) {
            send(require('./ErrorFehlendeFelder.js'), res);
        },
        ErrorUnbekannteRolle: function (res) {
            send(require('./ErrorUnbekannteRolle.js'), res);
        },
        ErrorFalscheAnmeldedaten: function (res) {
            send(require('./ErrorFalscheAnmeldedaten.js'), res);
        },
        ErrorUserNichtLoeschbar: function (res) {
            send(require('./ErrorUserNichtLoeschbar.js'), res);
        },
        ErrorUserNotFound: function (res, username) {
            send(require('./ErrorUserNotFound.js')(username), res);
        },
        ErrorForbidden: function (res) {
            send(require('./ErrorForbiddenMessage.js'), res);
        },
        ErrorNotAuthorized: function (res) {
            send(require('./ErrorNotAuthorizedMessage.js'), res);
        },
        ErrorBadRequest: function (res, reason) {
            send(require('./ErrorBadRequest.js')(reason), res);
        },
        ErrorJugendNotFound: function (res, err) {
            send(require('./ErrorJugendNotFoundMessage.js')(err), res);
        },
        ErrorPlatzNotFound: function (res, err) {
            send(require('./ErrorPlatzNotFoundMessage.js')(err), res);
        },
        ErrorSpielNotFound: function (res, err) {
            send(require('./ErrorSpielNotFoundMessage.js')(err), res);
        },
        ErrorTeamNotFound: function (res, err) {
            send(require('./ErrorTeamNotFoundMessage.js')(err), res);
        },
        ErrorInvalidToken: function (res) {
            send(require('./ErrorInvalidToken.js'), res);
        },
        ErrorAnsprechpartnerNotFound: function (res, err) {
            send(require('./ErrorAnsprechpartnerNotFound.js')(err), res);
        },
        SpielplanAktualisert: function (res, spiele) {
            send(require('./SpielplanAktualisiertMessage.js')(spiele), res);
        },
        ErrorSpielplanUngueltig: function (res, index) {
            send(require('./ErrorSpielplanUngueltig.js')(index), res);
        },
        ErrorZeitenUngueltig: function (res) {
            send(require('./ErrorZeitenUngueltig.js'), res);
        },
        ErrorUserExistiertBereits: function (res, username) {
            send(require('./ErrorUserExistiertBereits.js')(username), res);
        },
        ErrorNotFound: function (res) {
            send(require('./ErrorNotFound.js')(), res);
        },
        ErrorSpielNotFilled: function (res) {
            send(require('./ErrorSpielNotFilled.js'), res);
        },
        ErrorDeprecated: function (res) {
            send(require('./ErrorDeprecated.js'), res);
        },
        ErrorSpielNotChangeable: function (res) {
            send(require('./ErrorSpielNotChangeable.js'), res);
        },
        ErrorVeranstaltungNotFound: function (res, err) {
            send(require('./ErrorVeranstaltungNotFound.js')(err), res);
        }
    };
};