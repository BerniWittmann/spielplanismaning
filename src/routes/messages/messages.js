module.exports = function () {
    function send(obj, res) {
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
        ErrorBadRequest: function (res) {
            send(require('./ErrorBadRequest.js'), res);
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
        ErrorSpielplanUngueltig: function (res) {
            send(require('./ErrorSpielplanUngueltig.js'), res);
        }
    };
};